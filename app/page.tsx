import Link from "next/link";
import AssignmentList from "@/components/AssignmentList";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Branding */}
          <header className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">
                  StudyFlow Dashboard
                </h1>
                <p className="text-gray-300 text-lg">
                  Manage your assignments and track your progress
                </p>
              </div>
              
              {/* Tech Stack Badges */}
              <div className="flex flex-col gap-2">
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
            </div>

            {/* Feature Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
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
          </header>

          <div className="mb-6">
            <Link
              href="/add-assignment"
              className="inline-block bg-gradient-to-r from-[#76B900] to-[#5a9100] text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              + Add New Assignment
            </Link>
          </div>

          <AssignmentList />
        </div>
      </div>
    </div>
  );
}
