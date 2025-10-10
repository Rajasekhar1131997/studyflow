import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignment_id, content, file_name, file_type, github_url } = body;

    if (!assignment_id || !content) {
      return NextResponse.json(
        { error: "Assignment ID and content are required" },
        { status: 400 }
      );
    }

    // Fetch assignment details
    const { data: assignment, error: fetchError } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", assignment_id)
      .single();

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const daysLeft = Math.ceil(
      (new Date(assignment.due_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Prepare evaluation prompt
    const evaluationPrompt = `You are an AI tutor evaluating student work for AI StudyAssist. 

Assignment Details:
- Title: ${assignment.title}
- Description: ${assignment.description}
- Current Progress: ${assignment.progress}%
- Days Remaining: ${daysLeft}
${assignment.ai_plan ? `- Study Plan: ${assignment.ai_plan.substring(0, 500)}...` : ''}

Submitted Work:
- File: ${file_name || 'Text submission'}
- Type: ${file_type || 'text'}
${github_url ? `- GitHub: ${github_url}` : ''}
- Content Preview: ${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

Please evaluate this work and provide:
1. **Quality Score** (0-10): Rate the quality of the work
2. **Completeness** (0-100%): How much of the assignment is complete based on this submission
3. **Effort Assessment**: Low, Medium, or High
4. **Progress Suggestion** (0-30%): How much progress should be added to the current ${assignment.progress}%
5. **Detailed Feedback**: Specific feedback on:
   - What was done well
   - Areas for improvement
   - Suggestions for next steps
   - Code quality (if applicable)
   - Completeness against requirements

Respond in JSON format:
{
  "quality_score": number,
  "completeness": number,
  "effort": "Low" | "Medium" | "High",
  "progress_to_add": number,
  "feedback": {
    "strengths": string,
    "improvements": string,
    "next_steps": string,
    "code_quality": string (if code),
    "overall": string
  }
}`;

    // Call NVIDIA API for evaluation
    const nvidiaResponse = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta/llama-3.1-70b-instruct",
          messages: [
            {
              role: "user",
              content: evaluationPrompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
        }),
      }
    );

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text();
      console.error("NVIDIA API error:", errorText);
      return NextResponse.json(
        { error: "Failed to evaluate work" },
        { status: 500 }
      );
    }

    const nvidiaData = await nvidiaResponse.json();
    let evaluation;
    
    try {
      // Extract JSON from response
      const responseText = nvidiaData.choices[0].message.content;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        quality_score: 7,
        completeness: 50,
        effort: "Medium",
        progress_to_add: 10,
        feedback: {
          strengths: "Work submitted successfully",
          improvements: "Continue working on the assignment",
          next_steps: "Follow the study plan",
          overall: responseText
        }
      };
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      evaluation = {
        quality_score: 7,
        completeness: 50,
        effort: "Medium",
        progress_to_add: 10,
        feedback: {
          overall: nvidiaData.choices[0].message.content
        }
      };
    }

    // Save submission to database
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        assignment_id,
        file_name,
        file_type,
        github_url,
        content: content.substring(0, 5000), // Limit stored content
        ai_evaluation: evaluation,
        progress_added: evaluation.progress_to_add,
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Error saving submission:", submissionError);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    // Update assignment progress
    const newProgress = Math.min(100, assignment.progress + evaluation.progress_to_add);
    const { error: updateError } = await supabase
      .from("assignments")
      .update({ 
        progress: newProgress,
        total_submissions: (assignment.total_submissions || 0) + 1
      })
      .eq("id", assignment_id);

    if (updateError) {
      console.error("Error updating progress:", updateError);
    }

    return NextResponse.json({
      success: true,
      evaluation,
      submission,
      new_progress: newProgress,
      progress_added: evaluation.progress_to_add,
    });
  } catch (error) {
    console.error("Error evaluating work:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
