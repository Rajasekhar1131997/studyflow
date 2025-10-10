"use client";

import { useState, useRef, useEffect } from "react";
import { Assignment } from "@/lib/supabase";

interface AssignmentChatbotProps {
  assignment: Assignment;
  onClose?: () => void;
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
    <div className="bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 rounded-xl shadow-2xl flex flex-col overflow-hidden h-[calc(100vh-12rem)] sticky top-6 border border-gray-700/50">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-700/50 bg-gradient-to-r from-[#76B900] to-[#0ea5e9]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">
              AI Study Assistant
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs text-white/80">Online & Ready</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/90 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
          💬 Ask me anything about this assignment
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-gray-900">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } animate-fadeIn`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                message.role === "user"
                  ? "bg-gradient-to-r from-[#76B900] to-[#0ea5e9] text-white"
                  : "bg-slate-800 text-gray-100 border border-gray-700/50"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-slate-800 p-4 rounded-2xl shadow-lg border border-gray-700/50">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-[#76B900] to-[#0ea5e9] rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gradient-to-r from-[#76B900] to-[#0ea5e9] rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gradient-to-r from-[#76B900] to-[#0ea5e9] rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                ></div>
                <span className="text-xs text-gray-400 ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-gradient-to-br from-slate-800 to-gray-900 border-t border-gray-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-[#76B900] focus:border-transparent disabled:opacity-50 text-sm text-white placeholder-gray-400 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-[#76B900] to-[#0ea5e9] text-white p-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
            aria-label="Send message"
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
      </form>
    </div>
  );
}
