"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Plus, Calendar, Clock, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchTasks = async () => {
    const res = await fetch(`/api/tasks?projectId=${id}`);
    if (res.ok) setTasks(await res.json());
  };

  const fetchUsers = async () => {
    if (isAdmin) {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    }
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
      fetchUsers();
    }
  }, [session, id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title, 
        description, 
        projectId: id,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null
      })
    });
    setLoading(false);
    if (res.ok) {
      setShowModal(false);
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDueDate("");
      fetchTasks();
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTasks();
  };

  // Group tasks for Kanban board
  const todoTasks = tasks.filter(t => t.status === "TODO");
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");

  const TaskCard = ({ task }: { task: any }) => {
    const canEdit = isAdmin || task.assigneeId === (session?.user as any)?.id;
    return (
      <div style={{ background: "var(--bg-color)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "12px" }}>
        <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>{task.title}</h4>
        {task.description && <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>{task.description}</p>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--text-muted)", marginBottom: canEdit ? "12px" : "0" }}>
          <span>{task.assignee?.name || "Unassigned"}</span>
          {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
        </div>
        {canEdit && (
          <select 
            className="input" 
            style={{ width: "100%", padding: "6px", fontSize: "12px" }}
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value)}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        )}
      </div>
    );
  };

  const KanbanColumn = ({ title, tasks, icon: Icon, color }: any) => (
    <div style={{ background: "var(--surface-color)", borderRadius: "var(--radius-md)", padding: "16px", flex: 1, minWidth: "280px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: 600, color: `var(--${color})` }}>
        <Icon size={18} />
        {title} ({tasks.length})
      </div>
      <div>
        {tasks.map((task: any) => <TaskCard key={task.id} task={task} />)}
        {tasks.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: "12px" }}>No tasks</div>}
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="animate-fade-in">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h2>Project Board</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Manage tasks for this project</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> New Task
            </button>
          )}
        </header>

        <div style={{ display: "flex", gap: "24px", overflowX: "auto", paddingBottom: "24px" }}>
          <KanbanColumn title="To Do" tasks={todoTasks} icon={Clock} color="warning" />
          <KanbanColumn title="In Progress" tasks={inProgressTasks} icon={Calendar} color="primary" />
          <KanbanColumn title="Completed" tasks={completedTasks} icon={CheckCircle} color="success" />
        </div>

        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "400px" }}>
              <h3 style={{ marginBottom: "24px" }}>Create New Task</h3>
              <form onSubmit={handleCreateTask}>
                <div className="input-group">
                  <label>Task Title</label>
                  <input className="input" required value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Assignee</label>
                  <select className="input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Due Date</label>
                  <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
