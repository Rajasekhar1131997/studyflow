import Link from "next/link";
import AssignmentList from "@/components/AssignmentList";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            StudyFlow Dashboard
          </h1>
          <p className="text-white/80 text-lg">
            Manage your assignments and track your progress
          </p>
        </header>

        <div className="mb-6">
          <Link
            href="/add-assignment"
            className="inline-block bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-purple-50 transition-colors"
          >
            + Add New Assignment
          </Link>
        </div>

        <AssignmentList />
      </div>
    </div>
  );
}
