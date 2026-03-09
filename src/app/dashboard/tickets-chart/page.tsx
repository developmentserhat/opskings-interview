"use client";

import { useState } from "react";
import { useTicketsOverTime } from "@/hooks/use-dashboard";
import { FilterBar } from "@/components/filters/FilterBar";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: "rgba(26, 26, 46, 0.95)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "12px 16px", backdropFilter: "blur(12px)" }}>
                <p style={{ fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ fontSize: 13, color: p.color, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
                        {p.dataKey === "created" ? "Created" : "Resolved"}: {p.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function TicketsChartPage() {
    const [filters, setFilters] = useState<Record<string, string | undefined>>({});
    const { data, isLoading } = useTicketsOverTime(filters);

    const handleFilterChange = (key: string, value: string | undefined) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="animate-in">
            <h1 className="page-title">Tickets Over Time</h1>
            <p className="page-subtitle">Monthly ticket volume for 2025 — created vs resolved</p>

            <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                showDateFilter
                showTeamMemberFilter
                showTicketTypeFilter
                showPriorityFilter
            />

            <div className="card">
                {isLoading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : (
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,74,0.5)" />
                                <XAxis dataKey="month" stroke="#8888aa" fontSize={12} tickLine={false} />
                                <YAxis stroke="#8888aa" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 13 }} />
                                <Line
                                    type="monotone"
                                    dataKey="created"
                                    stroke="#6366f1"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: "#6366f1" }}
                                    activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                                    name="Created"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="resolved"
                                    stroke="#10b981"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: "#10b981" }}
                                    activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                                    name="Resolved"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
