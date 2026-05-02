"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Plus, Folder } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Projects() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
  };

  useEffect(() => {
    if (session) fetchProjects();
  }, [session]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description })
    });
    setLoading(false);
    if (res.ok) {
      setShowModal(false);
      setName("");
      setDescription("");
      fetchProjects();
    }
  };

  return (
    <AppShell>
      <div className="animate-fade-in">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h2>Projects</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Manage team projects</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> New Project
            </button>
          )}
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {projects.map(p => (
            <Link href={`/projects/${p.id}`} key={p.id}>
              <div className="card" style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "10px", borderRadius: "8px" }}>
                    <Folder size={20} />
                  </div>
                  <h3 style={{ fontSize: "16px" }}>{p.name}</h3>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px", minHeight: "42px" }}>
                  {p.description || "No description provided."}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                  <span>Tasks: {p._count?.tasks || 0}</span>
                  <span>Created by {p.createdBy?.name?.split(' ')[0]}</span>
                </div>
              </div>
            </Link>
          ))}
          {projects.length === 0 && <p style={{ color: "var(--text-muted)" }}>No projects found.</p>}
        </div>

        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "400px" }}>
              <h3 style={{ marginBottom: "24px" }}>Create New Project</h3>
              <form onSubmit={handleCreate}>
                <div className="input-group">
                  <label>Project Name</label>
                  <input className="input" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
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
