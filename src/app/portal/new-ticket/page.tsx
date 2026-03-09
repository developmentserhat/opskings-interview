"use client";

import { useState } from "react";
import { useMetadata, useCreateTicket } from "@/hooks/use-dashboard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function NewTicketPage() {
    const router = useRouter();
    const { data: metadata } = useMetadata();
    const createTicket = useCreateTicket();

    const [title, setTitle] = useState("");
    const [ticketTypeId, setTicketTypeId] = useState("");
    const [priority, setPriority] = useState("medium");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !ticketTypeId) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            await createTicket.mutateAsync({
                ticketTypeId: parseInt(ticketTypeId),
                title,
                priority,
            });
            router.push("/portal");
        } catch {
            setError("Failed to create ticket. Please try again.");
        }
    };

    return (
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }} className="animate-in">
            <Link href="/portal" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, marginBottom: 24 }}>
                <ArrowLeft size={16} /> Back to Tickets
            </Link>

            <h1 className="page-title">Create New Ticket</h1>
            <p className="page-subtitle">Describe your issue and we&apos;ll help you resolve it</p>

            <div className="card">
                {error && (
                    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#f87171", fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Title *</label>
                        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of your issue" required />
                    </div>

                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Ticket Type *</label>
                        <select className="input" value={ticketTypeId} onChange={(e) => setTicketTypeId(e.target.value)} required>
                            <option value="">Select a type</option>
                            {metadata?.ticketTypes.map((t) => (
                                <option key={t.id} value={t.id}>{t.typeName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Priority</label>
                        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px 20px", marginTop: 4 }} disabled={createTicket.isPending}>
                        {createTicket.isPending ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Send size={16} /> Submit Ticket</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
