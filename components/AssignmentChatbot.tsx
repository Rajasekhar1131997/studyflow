"use client";

import { useState, useRef, useEffect } from "react";
import { Assignment } from "@/lib/supabase";

interface AssignmentChatbotProps {
  assignment: Assignment;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssignmentChatbot({
  assignment,
  onClose,
}: AssignmentChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm here to help you with "${assignment.title}". Ask me anything about this assignment, study strategies, or concepts you need help understanding!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const contextPrompt = {
        role: "system",
        content: `You are a helpful AI study assistant. The student is working on this assignment:
Title: ${assignment.title}
Description: ${assignment.description}
Due Date: ${new Date(assignment.due_date).toLocaleDateString()}
Days Remaining: ${Math.ceil((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}

Help them understand concepts, provide study strategies, and guide their learning for THIS specific assignment. Be encouraging and educational.`,
      };

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            contextPrompt,
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content: input },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
        {/* Header - ChatGPT Style */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-6">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {assignment.title}
              </h3>
              <p className="text-sm text-gray-500">
                AI Study Assistant • {Math.ceil((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm("Mark this assignment as submitted?")) {
                // You can add logic here to update the assignment status
                alert("Assignment marked as submitted!");
                onClose();
              }
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-[#DF8908] to-[#B415FF] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
            Submit Assignment
          </button>
        </div>

        {/* Messages - ChatGPT Style */}
        <div className="flex-1 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`w-full ${
                message.role === "assistant" ? "bg-gray-50" : "bg-white"
              } border-b border-gray-100`}
            >
              <div className="max-w-5xl mx-auto px-8 py-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-sm flex items-center justify-center font-semibold text-white ${
                        message.role === "assistant"
                          ? "bg-gradient-to-br from-[#DF8908] to-[#B415FF]"
                          : "bg-purple-600"
                      }`}
                    >
                      {message.role === "assistant" ? "AI" : "U"}
                    </div>
                  </div>
                  {/* Message Content */}
                  <div className="flex-1 space-y-2">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="w-full bg-gray-50 border-b border-gray-100">
              <div className="max-w-5xl mx-auto px-8 py-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-sm flex items-center justify-center font-semibold text-white bg-gradient-to-br from-[#DF8908] to-[#B415FF]">
                      AI
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - ChatGPT Style */}
        <div className="border-t border-gray-200 bg-white">
          <form onSubmit={sendMessage} className="max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message StudyFlow AI..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-transparent focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="mr-2 p-2 text-white bg-gradient-to-r from-[#DF8908] to-[#B415FF] rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Send"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              AI can make mistakes. Check important info.
            </p>
          </form>
    </div>
    </div>
  );
}
