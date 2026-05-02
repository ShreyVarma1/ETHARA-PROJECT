"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useSession } from "next-auth/react";
import { CheckSquare, Clock, Calendar } from "lucide-react";

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    if (res.ok) {
      const data = await res.json();
      const myTasks = isAdmin ? data : data.filter((t: any) => t.assigneeId === (session?.user as any)?.id);
      setTasks(myTasks);
    }
  };

  useEffect(() => {
    if (session) fetchTasks();
  }, [session]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTasks();
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "TODO") return "badge badge-todo";
    if (status === "IN_PROGRESS") return "badge badge-progress";
    if (status === "COMPLETED") return "badge badge-completed";
    return "badge";
  };

  return (
    <AppShell>
      <div className="animate-fade-in">
        <header style={{ marginBottom: "32px" }}>
          <h2>{isAdmin ? "All Team Tasks" : "My Tasks"}</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>View and update your assigned tasks</p>
        </header>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-color)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" }}>Task</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" }}>Project</th>
                {isAdmin && <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" }}>Assignee</th>}
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" }}>Status</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "var(--transition)" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 500, marginBottom: "4px" }}>{task.title}</div>
                    {task.dueDate && <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}><Calendar size={12}/> {new Date(task.dueDate).toLocaleDateString()}</div>}
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px" }}>{task.project?.name}</td>
                  {isAdmin && <td style={{ padding: "16px", fontSize: "14px" }}>{task.assignee?.name || "Unassigned"}</td>}
                  <td style={{ padding: "16px" }}>
                    <span className={getStatusBadgeClass(task.status)}>
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <select 
                      className="input" 
                      style={{ padding: "6px 10px", fontSize: "12px" }}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
