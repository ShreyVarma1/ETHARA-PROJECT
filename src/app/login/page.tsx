"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", padding: "12px", background: "var(--primary-light)", borderRadius: "var(--radius-lg)", color: "var(--primary)", marginBottom: "16px" }}>
            <Activity size={32} />
          </div>
          <h2>Welcome Back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>Sign in to continue to Team Task Manager</p>
        </div>

        {error && <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", marginTop: "16px", padding: "12px" }} disabled={loading}>
            {loading ? "Signing in..." : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
          Don't have an account? <Link href="/signup" style={{ color: "var(--primary)", fontWeight: 500 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
