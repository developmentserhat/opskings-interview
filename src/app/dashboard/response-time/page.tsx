"use client";

import { useState } from "react";
import { useResponseTime } from "@/hooks/use-dashboard";
import { FilterBar } from "@/components/filters/FilterBar";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
} from "recharts";
import { AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: "rgba(26,26,46,0.95)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "12px 16px" }}>
                <p style={{ fontWeight: 600, marginBottom: 8, textTransform: "capitalize" }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ fontSize: 13, color: p.color }}>
                        {p.name}: {p.value.toFixed(1)}h
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function ResponseTimePage() {
    const [filters, setFilters] = useState<Record<string, string | undefined>>({});
    const { data, isLoading } = useResponseTime(filters);

    const handleFilterChange = (key: string, value: string | undefined) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="animate-in">
            <h1 className="page-title">Response Time Analysis</h1>
            <p className="page-subtitle">Resolution time distribution and overdue ticket tracking</p>

            <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                showDateFilter
                showTeamMemberFilter
                showTicketTypeFilter={false}
                showPriorityFilter={false}
            />

            {isLoading ? (
                <div className="loading-center"><div className="spinner" /></div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div className="grid-4" style={{ marginBottom: 24 }}>
                        {data?.statistics.map((stat) => (
                            <div key={stat.priority} className="card">
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                    <span className={`badge badge-${stat.priority}`}>{stat.priority}</span>
                                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{stat.count} tickets</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                                    <div>
                                        <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>Min</div>
                                        <div style={{ fontWeight: 600 }}>{stat.minHours}h</div>
                                    </div>
                                    <div>
                                        <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>Max</div>
                                        <div style={{ fontWeight: 600 }}>{stat.maxHours}h</div>
                                    </div>
                                    <div>
                                        <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>Avg</div>
                                        <div style={{ fontWeight: 600, color: stat.avgHours > stat.expectedHours ? "var(--accent-red)" : "var(--accent-green)" }}>
                                            {stat.avgHours}h
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>Median</div>
                                        <div style={{ fontWeight: 600 }}>{stat.medianHours}h</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border-color)", fontSize: 12, color: "var(--text-secondary)" }}>
                                    Expected: {stat.expectedHours}h
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Actual vs Expected Resolution Time</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.statistics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,74,0.5)" />
                                    <XAxis dataKey="priority" stroke="#8888aa" fontSize={12} tickLine={false} style={{ textTransform: "capitalize" }} />
                                    <YAxis stroke="#8888aa" fontSize={12} tickLine={false} axisLine={false} label={{ value: "Hours", angle: -90, position: "insideLeft", style: { fill: "#8888aa", fontSize: 12 } }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 13 }} />
                                    <Bar dataKey="avgHours" fill="#6366f1" radius={[6, 6, 0, 0]} name="Avg Actual" />
                                    <Bar dataKey="expectedHours" fill="#10b981" radius={[6, 6, 0, 0]} name="Expected" />
                                    <Bar dataKey="medianHours" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Median" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Overdue Tickets Table */}
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertTriangle size={18} style={{ color: "var(--accent-amber)" }} />
                            <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                                Overdue Tickets ({data?.overdueTickets.length})
                            </h3>
                        </div>
                        <div className="table-container" style={{ border: "none" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Priority</th>
                                        <th>Actual</th>
                                        <th>Expected</th>
                                        <th>Overdue By</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.overdueTickets.slice(0, 20).map((t) => (
                                        <tr key={t.id}>
                                            <td style={{ fontFamily: "monospace", fontSize: 12 }}>#{t.id}</td>
                                            <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</td>
                                            <td style={{ fontSize: 13 }}>{t.typeName}</td>
                                            <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                                            <td style={{ color: "var(--accent-red)", fontWeight: 600 }}>{t.actualHours}h</td>
                                            <td>{t.expectedHours}h</td>
                                            <td style={{ color: "var(--accent-amber)", fontWeight: 600 }}>
                                                +{(t.actualHours - (t.expectedHours || 0)).toFixed(1)}h
                                            </td>
                                            <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                                {format(new Date(t.createdAt), "MMM d")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
