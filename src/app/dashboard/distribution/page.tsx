"use client";

import { useState } from "react";
import { useTicketDistribution } from "@/hooks/use-dashboard";
import { FilterBar } from "@/components/filters/FilterBar";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";

const COLORS = [
    "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
    "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
    "#3b82f6", "#a855f7", "#22d3ee", "#facc15",
];

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div style={{ background: "rgba(26,26,46,0.95)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "12px 16px", backdropFilter: "blur(12px)" }}>
                <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{d.value.toLocaleString()} tickets ({d.percentage}%)</p>
            </div>
        );
    }
    return null;
};

const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: "rgba(26,26,46,0.95)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "12px 16px", backdropFilter: "blur(12px)" }}>
                <p style={{ fontWeight: 600, marginBottom: 8, color: "var(--text-primary)", textTransform: "capitalize" }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ fontSize: 13, color: p.color }}>
                        {p.dataKey === "open" ? "Open/In Progress" : "Resolved/Closed"}: {p.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DistributionPage() {
    const [filters, setFilters] = useState<Record<string, string | undefined>>({});
    const { data, isLoading } = useTicketDistribution(filters);

    const handleFilterChange = (key: string, value: string | undefined) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="animate-in">
            <h1 className="page-title">Ticket Distribution</h1>
            <p className="page-subtitle">Breakdown of tickets by type and priority</p>

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
                <div className="grid-2">
                    <div className="card">
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>By Ticket Type</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.byType}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        innerRadius={60}
                                        paddingAngle={2}
                                        strokeWidth={0}
                                    >
                                        {data?.byType.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                            {data?.byType.map((item, i) => (
                                <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], display: "inline-block" }} />
                                    {item.name} ({item.percentage}%)
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>By Priority</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.byPriority} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,74,0.5)" />
                                    <XAxis dataKey="priority" stroke="#8888aa" fontSize={12} tickLine={false} style={{ textTransform: "capitalize" }} />
                                    <YAxis stroke="#8888aa" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomBarTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 13 }} />
                                    <Bar dataKey="open" fill="#6366f1" radius={[6, 6, 0, 0]} name="Open/In Progress" />
                                    <Bar dataKey="closed" fill="#10b981" radius={[6, 6, 0, 0]} name="Resolved/Closed" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
