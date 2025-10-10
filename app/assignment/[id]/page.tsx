"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, Assignment } from "@/lib/supabase";
import AssignmentChatbot from "@/components/AssignmentChatbot";
import WorkSubmission from "@/components/WorkSubmission";
import SubmissionHistory from "@/components/SubmissionHistory";

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAssignment();
    }
  }, [params.id]);

  async function fetchAssignment() {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setAssignment(data);
    } catch (error) {
      console.error("Error fetching assignment:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProgress(newProgress: number) {
    if (!assignment) return;

    try {
      const response = await fetch("/api/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: assignment.id, 
          progress: newProgress 
        }),
      });

      if (!response.ok) throw new Error("Failed to update progress");
      fetchAssignment();
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress. Please try again.");
    }
  }

  async function generateAIPlan() {
    if (!assignment) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ai-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          due_date: assignment.due_date,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");
      await fetchAssignment();
      alert("AI Study Plan Generated Successfully! 🎉");
    } catch (error) {
      console.error("Error generating AI plan:", error);
      alert("Failed to generate AI plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function parseDayWisePlan(plan: string) {
    // Parse the AI plan to extract day-wise breakdown
    const lines = plan.split('\n');
    const days: { [key: string]: string[] } = {};
    let currentDay = '';

    lines.forEach(line => {
      // Match various day formats: "Day X:", "*Day X:", "Day X-Y:", "*Day X-Y:", etc.
      const dayMatch = line.match(/\*?\s*Day\s+(\d+(?:-\d+)?)[:\s]/i) || 
                      line.match(/(\d+)\.\s*Day/i) ||
                      line.match(/\*?\s*Day\s+(\d+(?:-\d+)?)\s*$/i);
      
      if (dayMatch) {
        const dayNum = dayMatch[1];
        currentDay = `Day ${dayNum}`;
        days[currentDay] = [];
        
        // If there's content after the day marker on the same line, add it
        const content = line.replace(/\*?\s*Day\s+\d+(?:-\d+)?[:\s]*/i, '').trim();
        if (content) {
          days[currentDay].push(content);
        }
      } else if (currentDay && line.trim() && !line.match(/^[*\-+]\s*$/)) {
        days[currentDay].push(line.trim());
      }
    });

    // If no day pattern found, try to split by sections
    if (Object.keys(days).length === 0) {
      const sections = plan.split(/(?=\*?\s*Day\s+\d+|Week\s+\d+|\d+\.)/i);
      sections.forEach((section, index) => {
        if (section.trim()) {
          const key = section.match(/^(\*?\s*Day\s+\d+(?:-\d+)?|Week\s+\d+)/i)?.[0]?.replace('*', '').trim() || `Section ${index + 1}`;
          days[key] = [section.trim()];
        }
      });
    }

    return days;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Assignment not found</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#76B900] hover:bg-[#5a9100] text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(assignment.due_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const dayWisePlan = assignment.ai_plan ? parseDayWisePlan(assignment.ai_plan) : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="mb-6 flex items-center gap-2 text-white hover:text-[#76B900] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Assignment Header */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {assignment.title}
                </h1>
                
                <div className="flex items-center gap-6 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <span className="ml-2 font-semibold text-gray-800">
                      {new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Days Left:</span>
                    <span className={`ml-2 font-bold text-lg ${
                      daysLeft <= 3 ? "text-red-500" : 
                      daysLeft <= 7 ? "text-yellow-500" : 
                      "text-green-500"
                    }`}>
                      {daysLeft}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                </div>

                {/* Progress Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                      <p className="text-xs text-gray-500 mt-1">Updates automatically when you submit work</p>
                    </div>
                    <span className="text-3xl font-bold text-[#76B900]">
                      {assignment.progress}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-300 rounded-full h-5 border-2 border-gray-400 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#76B900] to-[#0ea5e9] h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${assignment.progress}%`,
                        minWidth: assignment.progress > 0 ? '10%' : '0%'
                      }}
                    >
                      {assignment.progress > 10 && (
                        <span className="text-white text-xs font-bold">
                          {assignment.progress}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Submission */}
              <WorkSubmission 
                assignment={assignment} 
                onSubmissionComplete={fetchAssignment}
              />

              {/* Submission History */}
              <SubmissionHistory assignmentId={assignment.id} />

              {/* AI Study Plan */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    🤖 AI Study Plan
                  </h2>
                  {!assignment.ai_plan && (
                    <button
                      onClick={generateAIPlan}
                      disabled={loading}
                      className="bg-gradient-to-r from-[#76B900] to-[#5a9100] text-white font-semibold px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? "Generating..." : "Generate Plan"}
                    </button>
                  )}
                </div>

                {assignment.ai_plan ? (
                  Object.keys(dayWisePlan).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(dayWisePlan).map(([day, content]) => (
                        <div key={day} className="border-l-4 border-[#76B900] pl-4 py-2 bg-blue-50 rounded-r-lg">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {day}
                          </h3>
                          <div className="text-gray-700 space-y-1">
                            {content.map((line, idx) => (
                              <p key={idx} className="text-sm">
                                {line.replace(/^[-•*]\s*/, '• ')}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {assignment.ai_plan}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No AI study plan generated yet.</p>
                    <p className="text-sm mt-2">Click "Generate Plan" to create one!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="lg:col-span-1">
              <AssignmentChatbot assignment={assignment} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
