import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, due_date } = body;

    if (!id || !title || !description || !due_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const daysLeft = Math.ceil(
      (new Date(due_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const prompt = `You are a helpful study planner assistant. A student needs to complete an assignment with the following details:

Title: ${title}
Description: ${description}
Days remaining: ${daysLeft} days

Please create a detailed study plan that:
1. Breaks down the assignment into daily milestones
2. Provides specific study tips and strategies
3. Includes time management recommendations
4. Suggests resources or approaches for each milestone

Format the plan in a clear, actionable way that the student can follow.`;

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
              content: prompt,
            },
          ],
          temperature: 0.7,
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
        { error: "Failed to generate AI plan" },
        { status: 500 }
      );
    }

    const nvidiaData = await nvidiaResponse.json();
    const plan = nvidiaData.choices[0].message.content;

    // Update assignment with AI plan
    const { error: updateError } = await supabase
      .from("assignments")
      .update({ ai_plan: plan })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating assignment:", updateError);
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Error generating AI plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
