"use client";

import { useState } from "react";
import { Assignment } from "@/lib/supabase";

interface WorkSubmissionProps {
  assignment: Assignment;
  onSubmissionComplete: () => void;
}

export default function WorkSubmission({
  assignment,
  onSubmissionComplete,
}: WorkSubmissionProps) {
  const [submitting, setSubmitting] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!textContent && !file) {
      alert("Please provide either text content or upload a file");
      return;
    }

    setSubmitting(true);
    setShowFeedback(false);

    try {
      let content = textContent;
      let fileName = "";
      let fileType = "text";

      // If file is uploaded, read its content
      if (file) {
        fileName = file.name;
        fileType = file.type || file.name.split('.').pop() || 'unknown';
        
        // Read file content
        const fileContent = await readFileContent(file);
        content = fileContent || textContent;
      }

      // Submit for evaluation
      const response = await fetch("/api/evaluate-work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_id: assignment.id,
          content,
          file_name: fileName,
          file_type: fileType,
          github_url: githubUrl || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit work");
      }

      const data = await response.json();
      setEvaluation(data);
      setShowFeedback(true);
      
      // Clear form
      setTextContent("");
      setGithubUrl("");
      setFile(null);
      
      // Refresh assignment data
      onSubmissionComplete();

      // Show success message
      alert(
        `🎉 Work Submitted Successfully!\n\n` +
        `Progress Added: +${data.progress_added}%\n` +
        `New Progress: ${data.new_progress}%\n` +
        `Quality Score: ${data.evaluation.quality_score}/10`
      );
    } catch (error) {
      console.error("Error submitting work:", error);
      alert("Failed to submit work. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      // Read as text for most files
      if (file.type.startsWith('text/') || 
          file.name.match(/\.(js|py|java|cpp|c|html|css|json|xml|md|txt)$/i)) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#76B900] to-[#0ea5e9] flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Submit Your Work
          </h2>
          <p className="text-sm text-gray-600">
            Upload files, paste code, or link your GitHub
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Text Content Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📝 Work Description / Code
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your code, describe what you've done, or provide notes about your work..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76B900] focus:border-transparent resize-none text-sm"
            rows={6}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📎 Upload File (Optional)
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76B900] focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#76B900] file:text-white hover:file:bg-[#5a9100] file:cursor-pointer"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* GitHub URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub Repository (Optional)
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76B900] focus:border-transparent text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || (!textContent && !file)}
          className="w-full bg-gradient-to-r from-[#76B900] to-[#0ea5e9] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Evaluating Your Work...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submit & Get AI Feedback
            </>
          )}
        </button>
      </form>

      {/* Feedback Display */}
      {showFeedback && evaluation && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg animate-fadeIn">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            AI Evaluation Results
          </h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-600">Quality Score</p>
              <p className="text-2xl font-bold text-[#76B900]">
                {evaluation.evaluation.quality_score}/10
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-600">Progress Added</p>
              <p className="text-2xl font-bold text-blue-600">
                +{evaluation.progress_added}%
              </p>
            </div>
          </div>

          {evaluation.evaluation.feedback && (
            <div className="text-sm text-gray-700 space-y-2">
              <p className="font-semibold text-gray-900">
                📊 Overall Assessment ({evaluation.evaluation.effort} Effort)
              </p>
              <p className="bg-white p-3 rounded">
                {evaluation.evaluation.feedback.overall || "Good work! Keep it up!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
