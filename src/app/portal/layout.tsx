"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, Plus, LogOut, Home } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useAuth } from "@/hooks/use-auth";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <div>
            {/* Top Navigation Bar */}
            <header style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                background: "rgba(13, 13, 28, 0.85)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--border-color)",
                padding: "0 24px",
            }}>
                <div style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 64,
                }}>
                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <Link href="/portal" style={{ textDecoration: "none" }}>
                            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
                                <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    OpsKings
                                </span>
                            </h1>
                        </Link>

                        {/* Nav Links */}
                        <nav style={{ display: "flex", gap: 4 }}>
                            <Link
                                href="/portal"
                                className={`sidebar-link ${pathname === "/portal" ? "active" : ""}`}
                                style={{ borderRadius: 8, padding: "6px 14px", fontSize: 13 }}
                            >
                                <Ticket size={16} />
                                My Tickets
                            </Link>
                            <Link
                                href="/portal/new-ticket"
                                className={`sidebar-link ${pathname === "/portal/new-ticket" ? "active" : ""}`}
                                style={{ borderRadius: 8, padding: "6px 14px", fontSize: 13 }}
                            >
                                <Plus size={16} />
                                New Ticket
                            </Link>
                        </nav>
                    </div>

                    {/* User Info & Sign Out */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {user && (
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</span>
                                <span className="badge badge-active" style={{ fontSize: 10 }}>Client</span>
                            </div>
                        )}
                        <button
                            onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } })}
                            className="sidebar-link"
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                borderRadius: 8, padding: "6px 10px", fontSize: 13,
                            }}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main>{children}</main>
        </div>
    );
}
