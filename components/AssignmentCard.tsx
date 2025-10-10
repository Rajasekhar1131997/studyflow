"use client";

import { useState } from "react";
import { Assignment } from "@/lib/supabase";

interface AssignmentCardProps {
  assignment: Assignment;
  onUpdate: () => void;
}

export default function AssignmentCard({
  assignment,
  onUpdate,
}: AssignmentCardProps) {
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
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all border border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {assignment.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {assignment.description}
        </p>
      </div>

      {/* Progress Section with Controls */}
      <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-lg font-bold text-[#76B900]">
            {assignment.progress}%
          </span>
        </div>
        
        {/* Progress Bar - More Visible */}
        <div className="w-full bg-gray-300 rounded-full h-4 border-2 border-gray-400 mb-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-[#76B900] to-[#5a9100] h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
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

        {/* Progress Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateProgress(Math.max(0, assignment.progress - 10))}
            className="flex-1 min-w-[70px] px-3 py-2 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-all"
            title="Decrease progress by 10%"
          >
            -10%
          </button>
          <button
            onClick={() => updateProgress(Math.min(100, assignment.progress + 10))}
            className="flex-1 min-w-[70px] px-3 py-2 bg-[#76B900] hover:bg-[#5a9100] border-2 border-[#76B900] text-white text-sm font-semibold rounded-lg transition-all shadow-md"
            title="Increase progress by 10%"
          >
            +10%
          </button>
          <button
            onClick={() => updateProgress(100)}
            className="flex-1 min-w-[90px] px-3 py-2 bg-green-600 hover:bg-green-700 border-2 border-green-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md"
            title="Mark as 100% complete"
          >
            ✓ Complete
          </button>
        </div>
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

      <div className="space-y-2">
        <button
          onClick={generateAIPlan}
          disabled={generating}
          className="w-full bg-gradient-to-r from-[#76B900] to-[#5a9100] text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {generating ? "Generating..." : "🤖 Generate AI Plan"}
        </button>
        <button
          onClick={() => {
            const chatButton = document.getElementById('floating-chatbot-button');
            if (chatButton) {
              chatButton.click();
            }
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          💬 Chat with AI
        </button>
        <button
          onClick={submitAssignment}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          ✅ Submit Assignment
        </button>
      </div>

      {assignment.ai_plan && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-800 mb-1">
            AI Study Plan
          </p>
          <p className="text-xs text-gray-700 line-clamp-3">
            {assignment.ai_plan}
          </p>
        </div>
      )}
    </div>
  );
}
