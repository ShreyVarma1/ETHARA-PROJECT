"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Loader2, Activity } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
        <Loader2 className="animate-spin" color="var(--primary)" size={32} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const user = session?.user as any;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/tasks", label: "My Tasks", icon: CheckSquare },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div style={{ background: "var(--primary)", padding: "8px", borderRadius: "8px", display: "flex" }}>
            <Activity color="white" size={20} />
          </div>
          <h1 style={{ fontSize: "18px" }}>TaskFlow</h1>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          {links.map(link => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: isActive ? "var(--primary-light)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: isActive ? 600 : 500,
                  transition: "var(--transition)"
                }}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px", marginTop: "auto" }}>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontWeight: 600, fontSize: "14px" }}>{user?.name}</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user?.role}</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)", fontWeight: 500, padding: "8px 0" }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
