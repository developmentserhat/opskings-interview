"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { FilterBar } from "@/components/filters/FilterBar";
import { Ticket, TicketCheck, Clock, Star } from "lucide-react";

export default function DashboardPage() {
    const [filters, setFilters] = useState<Record<string, string | undefined>>({});

    const handleFilterChange = (key: string, value: string | undefined) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const { data, isLoading } = useDashboard(filters);

    const cards = [
        {
            label: "Total Tickets",
            value: data?.totalTickets?.toLocaleString() || "—",
            icon: Ticket,
            colorClass: "cyan",
            iconColor: "var(--accent-cyan)",
        },
        {
            label: "Open Tickets",
            value: data?.openTickets?.toLocaleString() || "—",
            icon: TicketCheck,
            colorClass: "green",
            iconColor: "var(--accent-green)",
        },
        {
            label: "Avg Resolution Time",
            value: data?.avgResolutionTime ? `${data.avgResolutionTime}h` : "—",
            icon: Clock,
            colorClass: "amber",
            iconColor: "var(--accent-amber)",
        },
        {
            label: "Customer Satisfaction",
            value: data?.avgSatisfaction ? `${data.avgSatisfaction}/5` : "—",
            icon: Star,
            colorClass: "pink",
            iconColor: "var(--accent-pink)",
        },
    ];

    return (
        <div className="animate-in">
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">
                Key metrics and insights for your support operations
            </p>

            <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                showDateFilter
                showTeamMemberFilter
                showTicketTypeFilter
                showPriorityFilter
            />

            <div className="grid-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className={`stat-card ${card.colorClass}`}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                                    {card.label}
                                </span>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${card.iconColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon size={20} style={{ color: card.iconColor }} />
                                </div>
                            </div>
                            {isLoading ? (
                                <div className="skeleton" style={{ height: 36, width: "60%" }} />
                            ) : (
                                <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>
                                    {card.value}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
