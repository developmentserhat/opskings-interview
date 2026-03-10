"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("client");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signUp.email({ name, email, password });
            if (result.error) {
                setError(result.error.message || "Registration failed");
                setLoading(false);
                return;
            }

            // After registration, create user profile link with role
            try {
                await fetch("/api/auth/setup-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role }),
                });
            } catch {
                // Profile setup can be retried later
            }

            document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
            router.push(role === "internal" ? "/dashboard" : "/portal");
        } catch {
            setError("An error occurred during registration");
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
                        Create your account
                    </p>
                </div>

                {error && (
                    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#f87171", fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Full Name</label>
                        <div style={{ position: "relative" }}>
                            <User size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" style={{ paddingLeft: 36 }} required />
                        </div>
                    </div>
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
                            <input className="input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" style={{ paddingLeft: 36, paddingRight: 36 }} required minLength={8} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Account Type</label>
                        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="client">Client</option>
                            <option value="internal">Internal Team Member</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px 20px", marginTop: 8 }} disabled={loading}>
                        {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><UserPlus size={16} /> Create Account</>}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-secondary)" }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "var(--accent-blue)", textDecoration: "none", fontWeight: 500 }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}
