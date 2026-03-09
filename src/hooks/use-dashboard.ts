import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============ Types ============
export interface DashboardData {
    totalTickets: number;
    openTickets: number;
    avgResolutionTime: number;
    avgSatisfaction: number;
}

export interface TicketsOverTimeData {
    month: string;
    created: number;
    resolved: number;
}

export interface TeamPerformanceData {
    id: number;
    username: string;
    department: string;
    status: string;
    ticketsAssigned: number;
    ticketsResolved: number;
    avgResolutionTime: number;
    avgRating: number;
}

export interface TicketDistributionData {
    byType: { name: string; value: number; percentage: number }[];
    byPriority: { priority: string; open: number; closed: number }[];
}

export interface ClientAnalysisData {
    data: {
        id: number;
        clientName: string;
        planType: string;
        status: string;
        totalTickets: number;
        openTickets: number;
        totalSpent: number;
        lastTicketDate: string;
    }[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ResponseTimeData {
    statistics: {
        priority: string;
        count: number;
        minHours: number;
        maxHours: number;
        avgHours: number;
        medianHours: number;
        expectedHours: number;
    }[];
    overdueTickets: {
        id: number;
        title: string;
        priority: string;
        actualHours: number;
        expectedHours: number;
        typeName: string;
        createdAt: string;
        resolvedAt: string;
    }[];
}

export interface TicketListData {
    data: {
        id: number;
        title: string;
        status: string;
        priority: string;
        createdAt: string;
        resolvedAt: string | null;
        clientName: string;
        typeName: string;
        assigneeName: string | null;
    }[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface TicketDetailData {
    ticket: {
        id: number;
        title: string;
        status: string;
        priority: string;
        createdAt: string;
        resolvedAt: string | null;
        closedAt: string | null;
        clientId: number;
        clientName: string;
        typeName: string;
        assigneeName: string | null;
        assigneeId: number | null;
    };
    messages: {
        id: number;
        fromClient: boolean;
        fromTeamMemberId: number | null;
        messageText: string;
        createdAt: string;
        teamMemberName: string | null;
    }[];
    feedback: {
        id: number;
        rating: number;
        feedbackText: string;
        createdAt: string;
    } | null;
}

export interface MetadataData {
    teamMembers: { id: number; username: string; department: string }[];
    ticketTypes: { id: number; typeName: string; department: string; priority: string }[];
}

// ============ Query Hooks ============
function buildFilterQuery(filters: Record<string, string | undefined>): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
    });
    return params.toString();
}

export function useDashboard(filters: Record<string, string | undefined> = {}) {
    const query = buildFilterQuery(filters);
    return useQuery<DashboardData>({
        queryKey: ["dashboard", query],
        queryFn: async () => {
            const res = await fetch(`/api/dashboard?${query}`);
            if (!res.ok) throw new Error("Failed to fetch dashboard");
            return res.json();
        },
        staleTime: 60 * 1000, // 1 minute
    });
}

export function useTicketsOverTime(filters: Record<string, string | undefined> = {}) {
    const query = buildFilterQuery(filters);
    return useQuery<TicketsOverTimeData[]>({
        queryKey: ["ticketsOverTime", query],
        queryFn: async () => {
            const res = await fetch(`/api/tickets-over-time?${query}`);
            if (!res.ok) throw new Error("Failed to fetch tickets over time");
            return res.json();
        },
        staleTime: 60 * 1000,
    });
}

export function useTeamPerformance() {
    return useQuery<TeamPerformanceData[]>({
        queryKey: ["teamPerformance"],
        queryFn: async () => {
            const res = await fetch("/api/team-performance");
            if (!res.ok) throw new Error("Failed to fetch team performance");
            return res.json();
        },
        staleTime: 60 * 1000,
    });
}

export function useTicketDistribution(filters: Record<string, string | undefined> = {}) {
    const query = buildFilterQuery(filters);
    return useQuery<TicketDistributionData>({
        queryKey: ["ticketDistribution", query],
        queryFn: async () => {
            const res = await fetch(`/api/ticket-distribution?${query}`);
            if (!res.ok) throw new Error("Failed to fetch distribution");
            return res.json();
        },
        staleTime: 60 * 1000,
    });
}

export function useClientAnalysis(params: { page?: number; limit?: number; search?: string } = {}) {
    return useQuery<ClientAnalysisData>({
        queryKey: ["clientAnalysis", params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.page) searchParams.set("page", String(params.page));
            if (params.limit) searchParams.set("limit", String(params.limit));
            if (params.search) searchParams.set("search", params.search);
            const res = await fetch(`/api/client-analysis?${searchParams}`);
            if (!res.ok) throw new Error("Failed to fetch client analysis");
            return res.json();
        },
        staleTime: 60 * 1000,
    });
}

export function useResponseTime(filters: Record<string, string | undefined> = {}) {
    const query = buildFilterQuery(filters);
    return useQuery<ResponseTimeData>({
        queryKey: ["responseTime", query],
        queryFn: async () => {
            const res = await fetch(`/api/response-time?${query}`);
            if (!res.ok) throw new Error("Failed to fetch response time");
            return res.json();
        },
        staleTime: 60 * 1000,
    });
}

export function useTickets(params: { page?: number; clientId?: string; status?: string; search?: string } = {}) {
    return useQuery<TicketListData>({
        queryKey: ["tickets", params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.page) searchParams.set("page", String(params.page));
            if (params.clientId) searchParams.set("clientId", params.clientId);
            if (params.status) searchParams.set("status", params.status);
            if (params.search) searchParams.set("search", params.search);
            const res = await fetch(`/api/tickets?${searchParams}`);
            if (!res.ok) throw new Error("Failed to fetch tickets");
            return res.json();
        },
        staleTime: 30 * 1000, // 30 seconds for tickets list
    });
}

export function useTicketDetail(id: number) {
    return useQuery<TicketDetailData>({
        queryKey: ["ticket", id],
        queryFn: async () => {
            const res = await fetch(`/api/tickets/${id}`);
            if (!res.ok) throw new Error("Failed to fetch ticket");
            return res.json();
        },
        enabled: !!id,
        staleTime: 30 * 1000,
    });
}

export function useMetadata() {
    return useQuery<MetadataData>({
        queryKey: ["metadata"],
        queryFn: async () => {
            const res = await fetch("/api/metadata");
            if (!res.ok) throw new Error("Failed to fetch metadata");
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { clientId?: number; ticketTypeId: number; title: string; priority: string }) => {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create ticket");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}

export function useCreateMessage(ticketId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { messageText: string; fromClient: boolean }) => {
            const res = await fetch(`/api/tickets/${ticketId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create message");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
        },
    });
}

export function useCreateFeedback(ticketId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { rating: number; feedbackText: string }) => {
            const res = await fetch(`/api/tickets/${ticketId}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create feedback");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
        },
    });
}
