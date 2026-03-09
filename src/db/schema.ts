import {
    pgTable,
    serial,
    text,
    varchar,
    integer,
    boolean,
    decimal,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ Clients ============
export const clients = pgTable(
    "clients",
    {
        id: serial("id").primaryKey(),
        clientName: varchar("client_name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        status: varchar("status", { length: 50 }).default("active"),
        planType: varchar("plan_type", { length: 50 }),
        monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (table) => [index("idx_clients_plan_type").on(table.planType)]
);

// ============ Team Members ============
export const teamMembers = pgTable("team_members", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    department: varchar("department", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ============ Ticket Types ============
export const ticketTypes = pgTable("ticket_types", {
    id: serial("id").primaryKey(),
    typeName: varchar("type_name", { length: 100 }).notNull(),
    department: varchar("department", { length: 50 }).notNull(),
    priority: varchar("priority", { length: 20 }),
    avgResolutionHours: integer("avg_resolution_hours"),
});

// ============ Tickets ============
export const tickets = pgTable(
    "tickets",
    {
        id: serial("id").primaryKey(),
        clientId: integer("client_id")
            .notNull()
            .references(() => clients.id),
        assignedTo: integer("assigned_to").references(() => teamMembers.id),
        ticketTypeId: integer("ticket_type_id")
            .notNull()
            .references(() => ticketTypes.id),
        status: varchar("status", { length: 50 }).default("open"),
        priority: varchar("priority", { length: 20 }),
        title: varchar("title", { length: 255 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        resolvedAt: timestamp("resolved_at", { withTimezone: true }),
        closedAt: timestamp("closed_at", { withTimezone: true }),
    },
    (table) => [
        index("idx_tickets_client_id").on(table.clientId),
        index("idx_tickets_assigned_to").on(table.assignedTo),
        index("idx_tickets_status").on(table.status),
        index("idx_tickets_created_at").on(table.createdAt),
        index("idx_tickets_resolved_at").on(table.resolvedAt),
        index("idx_tickets_priority").on(table.priority),
        index("idx_tickets_ticket_type_id").on(table.ticketTypeId),
    ]
);

// ============ Ticket Messages ============
export const ticketMessages = pgTable(
    "ticket_messages",
    {
        id: serial("id").primaryKey(),
        ticketId: integer("ticket_id")
            .notNull()
            .references(() => tickets.id),
        fromClient: boolean("from_client").default(false),
        fromTeamMemberId: integer("from_team_member_id").references(
            () => teamMembers.id
        ),
        messageText: text("message_text").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (table) => [index("idx_ticket_messages_ticket_id").on(table.ticketId)]
);

// ============ Ticket Feedback ============
export const ticketFeedback = pgTable(
    "ticket_feedback",
    {
        id: serial("id").primaryKey(),
        ticketId: integer("ticket_id")
            .notNull()
            .references(() => tickets.id)
            .unique(),
        rating: integer("rating"),
        feedbackText: text("feedback_text"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (table) => [index("idx_ticket_feedback_ticket_id").on(table.ticketId)]
);

// ============ Payments ============
export const payments = pgTable(
    "payments",
    {
        id: serial("id").primaryKey(),
        clientId: integer("client_id")
            .notNull()
            .references(() => clients.id),
        amountUsd: decimal("amount_usd", { precision: 10, scale: 2 }).notNull(),
        paymentType: varchar("payment_type", { length: 50 }).notNull(),
        status: varchar("status", { length: 50 }).default("pending"),
        paidAt: timestamp("paid_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (table) => [
        index("idx_payments_client_id").on(table.clientId),
        index("idx_payments_paid_at").on(table.paidAt),
    ]
);

// ============ BetterAuth Tables ============
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    role: text("role").notNull().default("client"),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appUserProfile = pgTable(
    "app_user_profile",
    {
        id: serial("id").primaryKey(),
        authUserId: text("auth_user_id")
            .notNull()
            .unique()
            .references(() => user.id, { onDelete: "cascade" }),
        role: text("role").notNull(),
        clientId: integer("client_id").references(() => clients.id),
        teamMemberId: integer("team_member_id").references(() => teamMembers.id),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (table) => [
        index("idx_app_user_profile_auth_user_id").on(table.authUserId),
        index("idx_app_user_profile_client_id").on(table.clientId),
        index("idx_app_user_profile_team_member_id").on(table.teamMemberId),
    ]
);

// ============ Relations ============
export const clientsRelations = relations(clients, ({ many }) => ({
    tickets: many(tickets),
    payments: many(payments),
}));

export const teamMembersRelations = relations(teamMembers, ({ many }) => ({
    tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
    client: one(clients, { fields: [tickets.clientId], references: [clients.id] }),
    assignee: one(teamMembers, { fields: [tickets.assignedTo], references: [teamMembers.id] }),
    ticketType: one(ticketTypes, { fields: [tickets.ticketTypeId], references: [ticketTypes.id] }),
    messages: many(ticketMessages),
    feedback: many(ticketFeedback),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
    ticket: one(tickets, { fields: [ticketMessages.ticketId], references: [tickets.id] }),
}));

export const ticketFeedbackRelations = relations(ticketFeedback, ({ one }) => ({
    ticket: one(tickets, { fields: [ticketFeedback.ticketId], references: [tickets.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    client: one(clients, { fields: [payments.clientId], references: [clients.id] }),
}));
