import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingChatbot from "@/components/FloatingChatbot";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyFlow - AI Study Assistant",
  description: "Manage assignments, track progress, and receive AI guidance powered by NVIDIA Nemotron 70B",
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
          <FloatingChatbot />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
