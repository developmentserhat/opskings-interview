import { sql, and, eq, ne, inArray, notInArray, gte, lte, between, SQL } from "drizzle-orm";
import { tickets } from "@/db/schema";

export interface FilterParams {
    dateExact?: string;
    dateFrom?: string;
    dateTo?: string;
    teamMemberIs?: string;
    teamMemberIsNot?: string;
    teamMemberIsAnyOf?: string;
    teamMemberIsNoneOf?: string;
    ticketTypeIs?: string;
    ticketTypeIsNot?: string;
    ticketTypeIsAnyOf?: string;
    ticketTypeIsNoneOf?: string;
    priorityIs?: string;
    priorityIsNot?: string;
    priorityIsAnyOf?: string;
    priorityIsNoneOf?: string;
}

export function parseFilters(searchParams: URLSearchParams): FilterParams {
    return {
        dateExact: searchParams.get("dateExact") || undefined,
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
        teamMemberIs: searchParams.get("teamMemberIs") || undefined,
        teamMemberIsNot: searchParams.get("teamMemberIsNot") || undefined,
        teamMemberIsAnyOf: searchParams.get("teamMemberIsAnyOf") || undefined,
        teamMemberIsNoneOf: searchParams.get("teamMemberIsNoneOf") || undefined,
        ticketTypeIs: searchParams.get("ticketTypeIs") || undefined,
        ticketTypeIsNot: searchParams.get("ticketTypeIsNot") || undefined,
        ticketTypeIsAnyOf: searchParams.get("ticketTypeIsAnyOf") || undefined,
        ticketTypeIsNoneOf: searchParams.get("ticketTypeIsNoneOf") || undefined,
        priorityIs: searchParams.get("priorityIs") || undefined,
        priorityIsNot: searchParams.get("priorityIsNot") || undefined,
        priorityIsAnyOf: searchParams.get("priorityIsAnyOf") || undefined,
        priorityIsNoneOf: searchParams.get("priorityIsNoneOf") || undefined,
    };
}

export function buildFilterConditions(filters: FilterParams): SQL[] {
    const conditions: SQL[] = [];

    // Date filters
    if (filters.dateExact) {
        conditions.push(
            sql`DATE(${tickets.createdAt}) = ${filters.dateExact}`
        );
    }
    if (filters.dateFrom) {
        conditions.push(gte(tickets.createdAt, new Date(filters.dateFrom)));
    }
    if (filters.dateTo) {
        conditions.push(lte(tickets.createdAt, new Date(filters.dateTo + "T23:59:59.999Z")));
    }

    // Team member filters
    if (filters.teamMemberIs) {
        conditions.push(eq(tickets.assignedTo, parseInt(filters.teamMemberIs)));
    }
    if (filters.teamMemberIsNot) {
        conditions.push(ne(tickets.assignedTo, parseInt(filters.teamMemberIsNot)));
    }
    if (filters.teamMemberIsAnyOf) {
        const ids = filters.teamMemberIsAnyOf.split(",").map(Number);
        conditions.push(inArray(tickets.assignedTo, ids));
    }
    if (filters.teamMemberIsNoneOf) {
        const ids = filters.teamMemberIsNoneOf.split(",").map(Number);
        conditions.push(notInArray(tickets.assignedTo, ids));
    }

    // Ticket type filters
    if (filters.ticketTypeIs) {
        conditions.push(eq(tickets.ticketTypeId, parseInt(filters.ticketTypeIs)));
    }
    if (filters.ticketTypeIsNot) {
        conditions.push(ne(tickets.ticketTypeId, parseInt(filters.ticketTypeIsNot)));
    }
    if (filters.ticketTypeIsAnyOf) {
        const ids = filters.ticketTypeIsAnyOf.split(",").map(Number);
        conditions.push(inArray(tickets.ticketTypeId, ids));
    }
    if (filters.ticketTypeIsNoneOf) {
        const ids = filters.ticketTypeIsNoneOf.split(",").map(Number);
        conditions.push(notInArray(tickets.ticketTypeId, ids));
    }

    // Priority filters
    if (filters.priorityIs) {
        conditions.push(eq(tickets.priority, filters.priorityIs));
    }
    if (filters.priorityIsNot) {
        conditions.push(ne(tickets.priority, filters.priorityIsNot));
    }
    if (filters.priorityIsAnyOf) {
        const priorities = filters.priorityIsAnyOf.split(",");
        conditions.push(inArray(tickets.priority, priorities));
    }
    if (filters.priorityIsNoneOf) {
        const priorities = filters.priorityIsNoneOf.split(",");
        conditions.push(notInArray(tickets.priority, priorities));
    }

    return conditions;
}
