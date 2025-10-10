"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddAssignment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    contact: "",
    notify_method: "email",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the current session
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please log in first to add assignments.");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/add-assignment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific error message
        const errorMsg = data.error || "Failed to add assignment";
        
        if (response.status === 401) {
          alert("Please log in first to add assignments.");
          router.push("/login");
          return;
        }
        
        if (errorMsg.includes("user_id") || errorMsg.includes("column") || errorMsg.includes("violates")) {
          alert(
            "⚠️ Database Setup Required!\n\n" +
            "The database needs to be updated before you can add assignments.\n\n" +
            "Please run the SQL schemas:\n" +
            "1. database-schema-submissions.sql\n" +
            "2. database-schema-auth-fixed.sql\n\n" +
            "Check the console or README for instructions."
          );
          console.error("Database setup required. Run the SQL schemas first.");
          return;
        }
        
        throw new Error(errorMsg);
      }

      alert("Assignment added successfully!");
      router.push("/");
    } catch (error: any) {
      console.error("Error adding assignment:", error);
      alert(error.message || "Failed to add assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-white hover:text-white/80 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-6">
            Add New Assignment
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Assignment Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Math Homework Chapter 5"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe the assignment details..."
              />
            </div>

            <div>
              <label
                htmlFor="due_date"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Due Date *
              </label>
              <input
                type="date"
                id="due_date"
                required
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Contact (Email or Phone) *
              </label>
              <input
                type="text"
                id="contact"
                required
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="email@example.com or +1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notification Method *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="notify_method"
                    value="email"
                    checked={formData.notify_method === "email"}
                    onChange={(e) =>
                      setFormData({ ...formData, notify_method: e.target.value })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="notify_method"
                    value="sms"
                    checked={formData.notify_method === "sms"}
                    onChange={(e) =>
                      setFormData({ ...formData, notify_method: e.target.value })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700">SMS</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#76B900] to-[#5a9100] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Adding..." : "Add Assignment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
