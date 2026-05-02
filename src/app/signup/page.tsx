"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Activity } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to sign up");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", padding: "12px", background: "var(--primary-light)", borderRadius: "var(--radius-lg)", color: "var(--primary)", marginBottom: "16px" }}>
            <Activity size={32} />
          </div>
          <h2>Create Account</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>Join Team Task Manager today</p>
        </div>

        {error && <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
          </div>

          <div className="input-group">
            <label>Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="MEMBER">Member (Can manage assigned tasks)</option>
              <option value="ADMIN">Admin (Can create projects & assign tasks)</option>
            </select>
          </div>

          <button className="btn btn-primary" style={{ width: "100%", marginTop: "16px", padding: "12px" }} disabled={loading}>
            {loading ? "Creating..." : <><UserPlus size={18} /> Sign Up</>}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
