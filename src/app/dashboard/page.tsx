"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { CheckCircle, Clock, Layout, Activity } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ total: 0, todo: 0, progress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const tasks = await res.json();
          // Filter tasks assigned to current user, unless admin
          const myTasks = (session?.user as any)?.role === "ADMIN" 
            ? tasks 
            : tasks.filter((t: any) => t.assigneeId === (session?.user as any)?.id);

          setStats({
            total: myTasks.length,
            todo: myTasks.filter((t: any) => t.status === "TODO").length,
            progress: myTasks.filter((t: any) => t.status === "IN_PROGRESS").length,
            completed: myTasks.filter((t: any) => t.status === "COMPLETED").length,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchStats();
  }, [session]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <div style={{ background: `var(--${color}-light)`, color: `var(--${color})`, padding: "16px", borderRadius: "12px", display: "flex" }}>
        <Icon size={24} />
      </div>
      <div>
        <h3 style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>{title}</h3>
        <p style={{ fontSize: "28px", fontWeight: 700 }}>{loading ? "-" : value}</p>
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="animate-fade-in">
        <header style={{ marginBottom: "32px" }}>
          <h2>Welcome back, {(session?.user as any)?.name?.split(' ')[0] || 'User'}!</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Here's an overview of your tasks.</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          <StatCard title="Total Tasks" value={stats.total} icon={Layout} color="primary" />
          <StatCard title="To Do" value={stats.todo} icon={Activity} color="warning" />
          <StatCard title="In Progress" value={stats.progress} icon={Clock} color="primary" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="success" />
        </div>
      </div>
    </AppShell>
  );
}
