"use client";

import { useState, useMemo } from "react";
import { useTeamPerformance } from "@/hooks/use-dashboard";
import { ArrowUpDown, Trophy } from "lucide-react";

type SortKey = "username" | "ticketsAssigned" | "ticketsResolved" | "avgResolutionTime" | "avgRating";

export default function TeamPerformancePage() {
    const { data, isLoading } = useTeamPerformance();
    const [sortKey, setSortKey] = useState<SortKey>("ticketsAssigned");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [nameFilter, setNameFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("desc"); }
    };

    const filtered = useMemo(() => {
        if (!data) return [];
        let result = [...data];
        if (nameFilter) {
            const lowerFilter = nameFilter.toLowerCase();
            result = result.filter((r) => r.username.toLowerCase().includes(lowerFilter));
        }
        if (deptFilter) result = result.filter((r) => r.department === deptFilter);
        if (statusFilter) result = result.filter((r) => r.status === statusFilter);
        result.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (typeof aVal === "string") return sortDir === "asc" ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
            return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        });
        return result;
    }, [data, sortKey, sortDir, nameFilter, deptFilter, statusFilter]);

    const topPerformer = useMemo(() => {
        if (!data || data.length === 0) return null;
        return [...data].sort((a, b) => b.avgRating - a.avgRating)[0];
    }, [data]);

    const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
        <th onClick={() => toggleSort(sortKeyName)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {label}
                <ArrowUpDown size={12} style={{ opacity: sortKey === sortKeyName ? 1 : 0.3 }} />
            </div>
        </th>
    );

    return (
        <div className="animate-in">
            <h1 className="page-title">Team Performance</h1>
            <p className="page-subtitle">Performance metrics for each support team member</p>

            <div className="filter-bar" style={{ marginBottom: 24, flexWrap: "wrap" }}>
                <div className="filter-group">
                    <label className="filter-label">Member Name</label>
                    <input className="input" style={{ width: 180 }} placeholder="Search name..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
                </div>
                <div className="filter-group">
                    <label className="filter-label">Department</label>
                    <select className="input" style={{ width: 160 }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="support">Support</option>
                        <option value="technical">Technical</option>
                        <option value="finance">Finance</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select className="input" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {topPerformer && (
                <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(236,72,153,0.05))", borderColor: "rgba(245,158,11,0.2)" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trophy size={24} style={{ color: "var(--accent-amber)" }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Top Performer</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                            {topPerformer.username.replace("_", " ")}
                            <span style={{ fontSize: 14, fontWeight: 400, color: "var(--accent-amber)", marginLeft: 8 }}>
                                ★ {topPerformer.avgRating}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {isLoading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <SortHeader label="Team Member" sortKeyName="username" />
                                    <th>Department</th>
                                    <SortHeader label="Assigned" sortKeyName="ticketsAssigned" />
                                    <SortHeader label="Resolved" sortKeyName="ticketsResolved" />
                                    <SortHeader label="Avg Resolution" sortKeyName="avgResolutionTime" />
                                    <SortHeader label="Avg Rating" sortKeyName="avgRating" />
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((tm) => (
                                    <tr key={tm.id}>
                                        <td style={{ fontWeight: 600 }}>{tm.username.replace("_", " ")}</td>
                                        <td><span className="badge" style={{ textTransform: 'capitalize' }}>{tm.department}</span></td>
                                        <td>{tm.ticketsAssigned.toLocaleString()}</td>
                                        <td>{tm.ticketsResolved.toLocaleString()}</td>
                                        <td>{tm.avgResolutionTime}h</td>
                                        <td>
                                            <span style={{ color: tm.avgRating >= 4 ? "var(--accent-green)" : tm.avgRating >= 3 ? "var(--accent-amber)" : "var(--accent-red)" }}>
                                                ★ {tm.avgRating}
                                            </span>
                                        </td>
                                        <td><span className={`badge badge-${tm.status}`}>{tm.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
