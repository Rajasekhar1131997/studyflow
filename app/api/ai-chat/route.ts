import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const systemPrompt = {
      role: "system",
      content: `You are a helpful AI tutor for AI StudyAssist, an intelligent assignment companion. Your role is to:
- Help students understand homework concepts and problems
- Break down complex topics into simple explanations
- Provide step-by-step guidance without giving direct answers
- Encourage critical thinking and learning
- Be supportive and motivating
- Answer questions about study strategies and time management
- Provide personalized tutoring assistance

Always be patient, clear, and educational in your responses.`,
    };

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
          messages: [systemPrompt, ...messages],
          temperature: 0.7,
          max_tokens: 512,
          top_p: 1,
          stream: false,
        }),
      }
    );

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text();
      console.error("NVIDIA API error:", errorText);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const nvidiaData = await nvidiaResponse.json();
    const assistantMessage = nvidiaData.choices[0].message.content;

    return NextResponse.json({ 
      success: true, 
      message: assistantMessage 
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
