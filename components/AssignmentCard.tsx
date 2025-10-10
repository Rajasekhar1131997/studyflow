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
      onUpdate(); // Refresh the dashboard
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to submit assignment. Please try again.");
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-purple-900 mb-2">
          {assignment.title}
        </h3>
        <p className="text-gray-700 text-sm line-clamp-2">
          {assignment.description}
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-bold text-purple-600">
            {assignment.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#DF8908] to-[#B415FF] h-3 rounded-full transition-all"
            style={{ width: `${assignment.progress}%` }}
          ></div>
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
          className="w-full bg-gradient-to-r from-[#DF8908] to-[#B415FF] text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
          className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          💬 Chat with AI
        </button>
        <button
          onClick={submitAssignment}
          className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          ✅ Submit Assignment
        </button>
      </div>

      {assignment.ai_plan && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs font-semibold text-purple-800 mb-1">
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
