"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BarChart3,
    Users,
    PieChart,
    UserCheck,
    Clock,
    LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/tickets-chart", label: "Tickets Over Time", icon: BarChart3 },
    { href: "/dashboard/team-performance", label: "Team Performance", icon: Users },
    { href: "/dashboard/distribution", label: "Distribution", icon: PieChart },
    { href: "/dashboard/clients", label: "Client Analysis", icon: UserCheck },
    { href: "/dashboard/response-time", label: "Response Time", icon: Clock },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <nav className="sidebar">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
                    <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        OpsKings
                    </span>
                </h1>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Admin Dashboard
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${isActive ? "active" : ""}`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, marginTop: 16 }}>
                {user && (
                    <div style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                            {user.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }} />
                            Internal Team
                        </div>
                    </div>
                )}
                <button
                    onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } })}
                    className="sidebar-link"
                    style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </nav>
    );
}
