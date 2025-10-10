"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setSuccess(true);
        // Don't redirect, user needs to verify email first
      } else {
        // No email confirmation needed (or already confirmed)
        setSuccess(true);
        
        // Redirect to dashboard after showing success
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            AI StudyAssist
          </h1>
          <p className="text-gray-400">
            Your intelligent assignment companion
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Create Your Account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-bold text-blue-900">Check Your Email!</p>
              </div>
              <div className="text-sm text-blue-800 space-y-2">
                <p className="font-semibold">
                  📧 An email has been sent to your registered email address.
                </p>
                <p>
                  Please confirm your account through the verification link provided in the email.
                </p>
                <p className="text-xs text-blue-600 mt-3">
                  💡 Tip: Check your spam folder if you don't see the email within a few minutes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-700">
                  After verification, you can <Link href="/login" className="font-semibold underline">log in here</Link>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76B900] focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76B900] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76B900] focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#76B900] to-[#0ea5e9] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#76B900] font-semibold hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by NVIDIA Nemotron 70B • Deployed on Vercel
          </p>
        </div>
      </div>
    </div>
  );
}
