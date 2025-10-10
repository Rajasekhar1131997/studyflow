"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface SubmissionHistoryProps {
  assignmentId: string;
}

interface Submission {
  id: string;
  submission_date: string;
  file_name: string;
  file_type: string;
  github_url: string;
  ai_evaluation: any;
  progress_added: number;
}

export default function SubmissionHistory({ assignmentId }: SubmissionHistoryProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  async function fetchSubmissions() {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", assignmentId)
        .order("submission_date", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6">
        <p className="text-gray-600 text-center">Loading submission history...</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 font-medium">No submissions yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Submit your work to track progress and get AI feedback
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        📚 Submission History
        <span className="text-sm font-normal text-gray-500">
          ({submissions.length} submission{submissions.length !== 1 ? 's' : ''})
        </span>
      </h2>

      <div className="space-y-3">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#76B900] transition-colors"
          >
            {/* Submission Header */}
            <div
              onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {submission.file_name || 'Text Submission'}
                    </span>
                    {submission.file_type && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {submission.file_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(submission.submission_date).toLocaleDateString()} at{' '}
                    {new Date(submission.submission_date).toLocaleTimeString()}
                  </p>
                  {submission.github_url && (
                    <a
                      href={submission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      View on GitHub
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="text-lg font-bold text-[#76B900]">
                      +{submission.progress_added}%
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === submission.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === submission.id && submission.ai_evaluation && (
              <div className="border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  🎯 AI Evaluation
                </h4>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Quality</p>
                    <p className="text-lg font-bold text-[#76B900]">
                      {submission.ai_evaluation.quality_score}/10
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Complete</p>
                    <p className="text-lg font-bold text-blue-600">
                      {submission.ai_evaluation.completeness}%
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Effort</p>
                    <p className="text-lg font-bold text-orange-600">
                      {submission.ai_evaluation.effort}
                    </p>
                  </div>
                </div>

                {submission.ai_evaluation.feedback && (
                  <div className="bg-white p-3 rounded-lg text-sm space-y-2">
                    {submission.ai_evaluation.feedback.strengths && (
                      <div>
                        <p className="font-semibold text-green-700">✅ Strengths:</p>
                        <p className="text-gray-700">{submission.ai_evaluation.feedback.strengths}</p>
                      </div>
                    )}
                    {submission.ai_evaluation.feedback.improvements && (
                      <div>
                        <p className="font-semibold text-orange-700">💡 Areas to Improve:</p>
                        <p className="text-gray-700">{submission.ai_evaluation.feedback.improvements}</p>
                      </div>
                    )}
                    {submission.ai_evaluation.feedback.next_steps && (
                      <div>
                        <p className="font-semibold text-blue-700">📋 Next Steps:</p>
                        <p className="text-gray-700">{submission.ai_evaluation.feedback.next_steps}</p>
                      </div>
                    )}
                    {submission.ai_evaluation.feedback.overall && (
                      <div>
                        <p className="font-semibold text-gray-900">📝 Overall:</p>
                        <p className="text-gray-700">{submission.ai_evaluation.feedback.overall}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
