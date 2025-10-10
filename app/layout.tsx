import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI StudyAssist - Your Intelligent Assignment Companion",
  description: "AI-powered assignment management with personalized study plans, progress tracking, and 24/7 AI tutoring assistance powered by NVIDIA Nemotron 70B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
