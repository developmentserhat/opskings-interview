"use client";

import { useState } from "react";
import { useClientAnalysis } from "@/hooks/use-dashboard";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function ClientsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const { data, isLoading } = useClientAnalysis({ page, search, limit: 20 });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <div className="animate-in">
            <h1 className="page-title">Client Analysis</h1>
            <p className="page-subtitle">Top clients by ticket volume with payment insights</p>

            <form onSubmit={handleSearch} style={{ marginBottom: 24, display: "flex", gap: 12, maxWidth: 400 }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input
                        className="input"
                        placeholder="Search clients..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {isLoading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Client Name</th>
                                    <th>Plan</th>
                                    <th>Total Tickets</th>
                                    <th>Open Tickets</th>
                                    <th>Total Spent</th>
                                    <th>Last Ticket</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.data.map((client) => (
                                    <tr key={client.id}>
                                        <td style={{ fontWeight: 600 }}>{client.clientName}</td>
                                        <td><span className={`badge badge-${client.planType}`}>{client.planType}</span></td>
                                        <td>{client.totalTickets.toLocaleString()}</td>
                                        <td>{client.openTickets.toLocaleString()}</td>
                                        <td style={{ fontFamily: "monospace" }}>${client.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                                            {client.lastTicketDate ? format(new Date(client.lastTicketDate), "MMM d, yyyy") : "—"}
                                        </td>
                                        <td><span className={`badge badge-${client.status}`}>{client.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {data && data.pagination.totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        Previous
                    </button>
                    {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, Math.min(page - 2, data.pagination.totalPages - 4));
                        const p = startPage + i;
                        return (
                            <button key={p} className={p === page ? "active" : ""} onClick={() => setPage(p)}>
                                {p}
                            </button>
                        );
                    })}
                    <button onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
