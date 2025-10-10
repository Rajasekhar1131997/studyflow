import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, progress } = body;

    if (!id || progress === undefined) {
      return NextResponse.json(
        { error: "Assignment ID and progress are required" },
        { status: 400 }
      );
    }

    // Ensure progress is between 0 and 100
    const validProgress = Math.max(0, Math.min(100, progress));

    // Update the assignment progress in Supabase
    const { error } = await supabase
      .from("assignments")
      .update({ progress: validProgress })
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      progress: validProgress,
      message: "Progress updated successfully" 
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
