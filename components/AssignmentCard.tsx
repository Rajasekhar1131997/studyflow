"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Assignment } from "@/lib/supabase";

interface AssignmentCardProps {
  assignment: Assignment;
  onUpdate: () => void;
}

export default function AssignmentCard({
  assignment,
  onUpdate,
}: AssignmentCardProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const daysLeft = Math.ceil(
    (new Date(assignment.due_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const getDaysLeftColor = () => {
    if (daysLeft <= 3) return "text-red-400";
    if (daysLeft <= 7) return "text-yellow-400";
    return "text-green-400";
  };

  async function generateAIPlan() {
    setGenerating(true);
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
      const data = await response.json();
      alert("AI Study Plan Generated!\n\n" + data.plan);
      onUpdate();
    } catch (error) {
      console.error("Error generating AI plan:", error);
      alert("Failed to generate AI plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function updateProgress(newProgress: number) {
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
      onUpdate(); // Refresh the dashboard
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress. Please try again.");
    }
  }

  async function submitAssignment() {
    if (!confirm(`Submit "${assignment.title}"? This will remove it from your dashboard.`)) {
      return;
    }

    try {
      const response = await fetch("/api/submit-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assignment.id }),
      });

      if (!response.ok) throw new Error("Failed to submit assignment");
      
      alert("Assignment submitted successfully! 🎉");
      onUpdate();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to submit assignment. Please try again.");
    }
  }

  return (
    <div 
      onClick={() => router.push(`/assignment/${assignment.id}`)}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all border border-gray-200 cursor-pointer hover:scale-[1.02]"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {assignment.title}
        </h3>
        <p className="text-gray-600 text-sm max-h-24 overflow-y-auto">
          {assignment.description}
        </p>
      </div>

      {/* Progress Section */}
      <div className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-2xl font-bold text-[#76B900]">
            {assignment.progress}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-300 rounded-full h-4 border-2 border-gray-400 shadow-inner">
          <div
            className="bg-gradient-to-r from-[#76B900] to-[#0ea5e9] h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ 
              width: `${assignment.progress}%`,
              minWidth: assignment.progress > 0 ? '8%' : '0%'
            }}
          >
            {assignment.progress > 8 && (
              <span className="text-white text-xs font-bold">
                {assignment.progress}%
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Submit work to update progress automatically
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Due Date</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(assignment.due_date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Days Left</p>
          <p className={`text-2xl font-bold ${getDaysLeftColor()}`}>
            {daysLeft}
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 text-[#76B900] font-semibold text-sm">
          Click to view details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {assignment.ai_plan && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-800 mb-2">
            AI Study Plan
          </p>
          <p className="text-xs text-gray-700 max-h-32 overflow-y-auto pr-2">
            {assignment.ai_plan}
          </p>
        </div>
      )}
    </div>
  );
}
