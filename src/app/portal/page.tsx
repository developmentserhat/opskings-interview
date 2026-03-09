"use client";

import { useState } from "react";
import { useTickets, useMetadata } from "@/hooks/use-dashboard";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Search, Ticket, ArrowRight } from "lucide-react";

export default function PortalPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const { data, isLoading } = useTickets({ page, status, search });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }} className="animate-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">My Tickets</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>View and manage your support tickets</p>
                </div>
                <Link href="/portal/new-ticket" className="btn btn-primary" style={{ textDecoration: "none" }}>
                    <Plus size={16} /> New Ticket
                </Link>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 200, position: "relative" }}>
                    <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input className="input" placeholder="Search tickets..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ paddingLeft: 36 }} />
                </form>
                <select className="input" style={{ width: 160 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {isLoading ? (
                <div className="loading-center"><div className="spinner" /></div>
            ) : data?.data.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: 60 }}>
                    <Ticket size={48} style={{ color: "var(--text-secondary)", marginBottom: 16 }} />
                    <p style={{ fontSize: 16, fontWeight: 500 }}>No tickets found</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Create a new ticket to get started</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {data?.data.map((ticket) => (
                        <Link
                            key={ticket.id}
                            href={`/portal/tickets/${ticket.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>#{ticket.id}</span>
                                        <span className={`badge badge-${ticket.status}`}>{ticket.status?.replace("_", " ")}</span>
                                        <span className={`badge badge-${ticket.priority}`}>{ticket.priority}</span>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{ticket.title}</div>
                                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                        {ticket.typeName} &middot; {ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d, yyyy") : ""}
                                        {ticket.assigneeName && <span> &middot; Assigned to {ticket.assigneeName.replace("_", " ")}</span>}
                                    </div>
                                </div>
                                <ArrowRight size={18} style={{ color: "var(--text-secondary)" }} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {data && data.pagination.totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
                    {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, Math.min(page - 2, data.pagination.totalPages - 4));
                        const p = startPage + i;
                        return <button key={p} className={p === page ? "active" : ""} onClick={() => setPage(p)}>{p}</button>;
                    })}
                    <button onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages}>Next</button>
                </div>
            )}
        </div>
    );
}
