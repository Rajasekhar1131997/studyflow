import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import sgMail from "@sendgrid/mail";
import twilio from "twilio";

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_SID || "",
  process.env.TWILIO_AUTH_TOKEN || ""
);

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional security measure)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow for development without secret
      if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Calculate date 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch assignments due within 3 days
    const { data: assignments, error } = await supabase
      .from("assignments")
      .select("*")
      .gte("due_date", today.toISOString().split("T")[0])
      .lte("due_date", threeDaysFromNow.toISOString().split("T")[0]);

    if (error) {
      console.error("Error fetching assignments:", error);
      return NextResponse.json(
        { error: "Failed to fetch assignments" },
        { status: 500 }
      );
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No assignments due soon",
        sent: 0,
      });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const assignment of assignments) {
      const daysLeft = Math.ceil(
        (new Date(assignment.due_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const assignmentUrl = `https://studyflow.vercel.app/assignment/${assignment.id}`;
      
      const message = `📚 StudyFlow Reminder: Your assignment "${assignment.title}" is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}! Don't forget to work on it. View details: ${assignmentUrl}`;

      try {
        if (assignment.notify_method === "email") {
          // Send email via SendGrid
          await sgMail.send({
            to: assignment.contact,
            from: "rajasekhar1131997@gmail.com", // Replace with your verified sender
            subject: `Assignment Due Soon: ${assignment.title}`,
            text: message,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #B415FF;">📚 StudyFlow Assignment Reminder</h2>
                <p>Hi there!</p>
                <p>Your assignment <strong>"${assignment.title}"</strong> is due in <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>!</p>
                <p><strong>Description:</strong> ${assignment.description}</p>
                <p><strong>Due Date:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
                <p><strong>Progress:</strong> ${assignment.progress}%</p>
                <a href="${assignmentUrl}" style="display: inline-block; background: linear-gradient(to right, #DF8908, #B415FF); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">View Assignment</a>
                <p style="margin-top: 20px; color: #666;">Don't forget to work on it! You've got this! 💪</p>
              </div>
            `,
          });
          sentCount++;
        } else if (assignment.notify_method === "sms") {
          // Send SMS via Twilio
          await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: assignment.contact,
          });
          sentCount++;
        }
      } catch (notifyError: any) {
        console.error(
          `Error sending notification for assignment ${assignment.id}:`,
          notifyError
        );
        errors.push(
          `Failed to notify for "${assignment.title}": ${notifyError.message}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} notifications`,
      sent: sentCount,
      total: assignments.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in send-alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
