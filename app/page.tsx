"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AssignmentList from "@/components/AssignmentList";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      setUser(session.user);
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* User Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-white">
              <p className="text-sm text-gray-400">Welcome back,</p>
              <p className="text-lg font-semibold">{user?.user_metadata?.full_name || user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Header with Branding - Centered */}
          <header className="mb-8 text-center">
            <div className="mb-6">
              <h1 className="text-5xl font-bold text-white mb-2">
                AI StudyAssist
              </h1>
              <p className="text-gray-300 text-lg">
                Your intelligent assignment companion with AI-powered tutoring
              </p>
            </div>

            {/* Tech Stack Badges - Centered */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2 bg-[#76B900]/10 border border-[#76B900]/30 rounded-lg px-4 py-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#76B900">
                  <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm0 2.15L20.485 7.5v9L12 21.85 3.515 16.5v-9L12 2.15z"/>
                </svg>
                <span className="text-[#76B900] font-semibold text-sm">
                  Powered by NVIDIA Nemotron 70B
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0L1.75 6v12L12 24l10.25-6V6L12 0z"/>
                </svg>
                <span className="text-white font-semibold text-sm">
                  Deployed on Vercel
                </span>
              </div>
            </div>

            {/* Feature Tags - Centered */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-medium">
                🤖 AI Study Plans
              </span>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-medium">
                💬 AI Chat Assistant
              </span>
              <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-xs font-medium">
                📧 Smart Notifications
              </span>
              <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-xs font-medium">
                📊 Progress Tracking
              </span>
            </div>

            {/* Add Assignment Button - Right Side */}
            <div className="flex justify-end mb-6">
              <Link
                href="/add-assignment"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#76B900] to-[#5a9100] text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Assignment
              </Link>
            </div>
          </header>

          <AssignmentList />
        </div>
      </div>
    </div>
  );
}
