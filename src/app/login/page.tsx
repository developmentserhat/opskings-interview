"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn.email({ email, password });
            if (result.error) {
                setError(result.error.message || "Login failed");
                setLoading(false);
                return;
            }

            // Fetch user role to decide where to redirect & save to cookie for middleware
            try {
                const meRes = await fetch("/api/auth/me");
                if (meRes.ok) {
                    const user = await meRes.json();
                    // Set a non-HttpOnly cookie that middleware can read instantly
                    document.cookie = `user_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
                    router.push(user.role === "internal" ? "/dashboard" : "/portal");
                } else {
                    document.cookie = `user_role=internal; path=/; max-age=86400; SameSite=Lax`;
                    router.push("/dashboard");
                }
            } catch {
                document.cookie = `user_role=internal; path=/; max-age=86400; SameSite=Lax`;
                router.push("/dashboard");
            }
        } catch {
            setError("An error occurred during login");
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-in">
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        OpsKings
                    </h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: 14 }}>
                        Sign in to your account
                    </p>
                </div>

                {error && (
                    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#f87171", fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Email</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ paddingLeft: 36 }} required />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Password</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                            <input className="input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingLeft: 36, paddingRight: 36 }} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px 20px", marginTop: 8 }} disabled={loading}>
                        {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><LogIn size={16} /> Sign In</>}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-secondary)" }}>
                    Don&apos;t have an account?{" "}
                    <Link href="/register" style={{ color: "var(--accent-blue)", textDecoration: "none", fontWeight: 500 }}>Register</Link>
                </p>
            </div>
        </div>
    );
}
