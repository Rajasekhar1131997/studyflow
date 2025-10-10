"use client";

import { useEffect, useState } from "react";
import { supabase, Assignment } from "@/lib/supabase";
import AssignmentCard from "./AssignmentCard";

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center text-white text-xl py-12">
        Loading assignments...
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 text-center">
        <p className="text-white text-xl mb-4">No assignments yet!</p>
        <p className="text-white/70">
          Click "Add New Assignment" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          onUpdate={fetchAssignments}
        />
      ))}
    </div>
  );
}
