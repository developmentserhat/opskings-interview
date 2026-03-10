# OpsKings — Support Analytics Dashboard

A full-stack support analytics dashboard built for the OpsKings development interview. It fetches data from a PostgreSQL database (via Supabase), performs real-time aggregations, and displays actionable insights through interactive charts, tables, and a client portal — all secured with Row Level Security (RLS) and BetterAuth.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Test Users](#test-users)
- [Features](#features)
- [Row Level Security (RLS)](#row-level-security-rls)
- [RLS with BetterAuth](#rls-with-betterauth)
- [Database Indexing Strategy](#database-indexing-strategy)
- [Performance Optimizations](#performance-optimizations)
- [Performance Testing Results](#performance-testing-results)
- [Scaling to 100k+ Tickets](#scaling-to-100k-tickets)
- [Assumptions](#assumptions)
- [Future Improvements](#future-improvements)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **Language** | TypeScript | 5.x |
| **Database** | PostgreSQL via Supabase | — |
| **ORM** | Drizzle ORM | 0.45.1 |
| **Authentication** | BetterAuth | 1.5.4 |
| **Data Fetching** | TanStack React Query | 5.90.21 |
| **Charts** | Recharts | 3.8.0 |
| **Icons** | Lucide React | 0.577.0 |
| **Styling** | Tailwind CSS + Custom CSS | 4.x |
| **Date Utilities** | date-fns | 4.1.0 |
| **Deployment** | Vercel | — |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **yarn**
- A free **Supabase** account (https://supabase.com)
- **Git**

### Clone the Repository

```bash
git clone <repository-url>
cd opskings-interview
npm install
```

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase / PostgreSQL
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>

# BetterAuth
BETTER_AUTH_SECRET=<your-random-secret-key-min-32-chars>
BETTER_AUTH_URL=http://localhost:3000

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Your Supabase PostgreSQL connection string (found in Supabase → Settings → Database → Connection string → URI) |
| `BETTER_AUTH_SECRET` | A random secret string (min 32 characters) for signing auth tokens |
| `BETTER_AUTH_URL` | The base URL of your application |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL (same as above for local dev) |

---

## Database Setup

Run the SQL scripts in order inside the Supabase SQL Editor:

```
1. database/schema.sql     → Creates all tables (clients, tickets, team_members, etc.)
2. database/seed.sql       → Seeds ~42,900 tickets, 50 clients, 15 team members, messages, feedback, payments
3. database/users.sql      → Creates BetterAuth tables, seeds 53 auth users, enables RLS policies, adds indexes
```

> **Important:** Run them in this exact order. `seed.sql` depends on `schema.sql`, and `users.sql` depends on both.

---

## Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

The app will be available at `http://localhost:3000`.

- **Internal team members** are redirected to `/dashboard`
- **Client users** are redirected to `/portal`

---

## Deployment

The application is deployed on **Vercel**.

1. Push your code to GitHub
2. Connect the repository to Vercel
3. Add the same environment variables from `.env.local` to Vercel's project settings
4. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL
5. Deploy

---

## Test Users

> **All users share the same password:** `password123`

### Internal Team Members (Dashboard Access)

These users have full access to all analytics, charts, tables, and the admin dashboard.

| # | Name | Email | Department | Team Member ID |
|---|---|---|---|---|
| 1 | John Smith | `john.smith@company.com` | Support | 1 |
| 2 | Sarah Jones | `sarah.jones@company.com` | Support | 2 |
| 3 | Emily Brown | `emily.brown@company.com` | Technical | 4 |

> **Note:** There are 15 team members in the database, but only 3 have login accounts. The other 12 are visible in the Team Performance table but don't have auth credentials.

### Client Users (Portal Access)

These users can only see their own tickets, create new tickets, send messages, and leave feedback. They cannot access the analytics dashboard.

| # | Client Name | Email | Plan | Status |
|---|---|---|---|---|
| 1 | TechStart Inc | `admin@techstart.com` | Professional | Active |
| 2 | GrowthCo | `contact@growthco.io` | Enterprise | Active |
| 3 | SmallBiz LLC | `owner@smallbiz.com` | Starter | Active |
| 4 | MegaCorp | `support@megacorp.com` | Enterprise | Active |
| 5 | StartupHub | `hello@startuphub.co` | Professional | Active |
| 6 | EcomStore | `team@ecomstore.com` | Professional | Active |
| 7 | DigitalAgency | `ops@digitalagency.com` | Enterprise | Active |
| 8 | LocalShop | `info@localshop.com` | Starter | Inactive |
| 9 | GlobalTech | `admin@globaltech.com` | Enterprise | Active |
| 10 | QuickStart | `contact@quickstart.io` | Starter | Active |
| 11 | InnovateLabs | `team@innovatelabs.com` | Professional | Active |
| 12 | RetailPro | `support@retailpro.com` | Professional | Active |
| 13 | CloudServices | `hello@cloudservices.io` | Enterprise | Active |
| 14 | WebStudio | `info@webstudio.com` | Starter | Active |
| 15 | DataCorp | `admin@datacorp.com` | Enterprise | Active |
| 16 | MarketingPro | `team@marketingpro.com` | Professional | Active |
| 17 | FinanceHub | `contact@financehub.io` | Enterprise | Active |
| 18 | CreativeStudio | `hello@creativestudio.com` | Professional | Active |
| 19 | TechSolutions | `support@techsolutions.com` | Professional | Active |
| 20 | StartupX | `team@startupx.io` | Starter | Active |
| 21 | EnterpriseOne | `admin@enterpriseone.com` | Enterprise | Active |
| 22 | AgileTeam | `contact@agileteam.com` | Professional | Active |
| 23 | SaasPlatform | `info@saasplatform.io` | Enterprise | Active |
| 24 | DevShop | `hello@devshop.com` | Starter | Active |
| 25 | ScaleUp | `team@scaleup.io` | Professional | Active |
| 26 | ProductCo | `support@productco.com` | Enterprise | Active |
| 27 | DesignHub | `admin@designhub.com` | Professional | Active |
| 28 | MediaGroup | `contact@mediagroup.io` | Enterprise | Active |
| 29 | BizStarter | `hello@bizstarter.com` | Starter | Active |
| 30 | GrowthEngine | `team@growthengine.io` | Professional | Active |
| 31 | PremiumCo | `support@premiumco.com` | Enterprise | Active |
| 32 | FastTrack | `admin@fasttrack.com` | Professional | Active |
| 33 | InnovateCo | `contact@innovateco.io` | Professional | Active |
| 34 | BetaLabs | `hello@betalabs.com` | Starter | Inactive |
| 35 | AlphaGroup | `team@alphagroup.io` | Enterprise | Active |
| 36 | Velocity | `support@velocity.com` | Professional | Active |
| 37 | NextGen | `admin@nextgen.io` | Enterprise | Active |
| 38 | QuickGrow | `contact@quickgrow.com` | Starter | Active |
| 39 | ProSolutions | `hello@prosolutions.io` | Professional | Active |
| 40 | UltraCorp | `team@ultracorp.com` | Enterprise | Active |
| 41 | SwiftStart | `support@swiftstart.com` | Starter | Active |
| 42 | PowerHub | `admin@powerhub.io` | Professional | Active |
| 43 | EliteServices | `contact@eliteservices.com` | Enterprise | Active |
| 44 | RapidGrowth | `hello@rapidgrowth.io` | Professional | Active |
| 45 | MicroBiz | `team@microbiz.com` | Starter | Active |
| 46 | MaxCorp | `support@maxcorp.io` | Enterprise | Active |
| 47 | AgileWorks | `admin@agileworks.com` | Professional | Active |
| 48 | TurboStart | `contact@turbostart.io` | Starter | Active |
| 49 | PeakPerformance | `hello@peakperformance.com` | Professional | Active |
| 50 | ZenithCo | `team@zenithco.io` | Enterprise | Active |

---

## Features

### 1. Dashboard Overview Cards
Summary statistics with real-time filtering:
- **Total Tickets** — count of all tickets matching current filters
- **Open Tickets** — tickets with `status = 'open'`
- **Avg Resolution Time** — average hours from creation to resolution
- **Customer Satisfaction** — average rating from ticket feedback (1-5 scale)

**Filters:** Date (exact date, date range, on or before, on or after) • Team Member (is, is not, is any of, is none of) • Ticket Type (is, is not, is any of, is none of) • Priority (is, is not, is any of, is none of)

### 2. Tickets Over Time Chart
Line chart showing monthly ticket volume for 2025 with two series:
- **Created tickets** per month
- **Resolved tickets** per month

X-axis: Jan–Dec 2025 • Y-axis: Ticket count • Same filter options as Dashboard

### 3. Team Performance Table
Sortable and filterable table showing per-agent metrics:
- Tickets Assigned, Tickets Resolved, Avg Resolution Time (hours), Avg Rating
- Includes ALL 15 team members (even those with 0 tickets via LEFT JOIN)
- Top performer highlighting (trophy icon for highest resolved count)
- Column-level text search for member names
- Client-side sorting by any column and filtering by department/status

### 4. Ticket Distribution Charts
Two complementary visualizations:
- **Pie/Donut Chart** — ticket distribution by type with percentages and counts
- **Stacked Bar Chart** — tickets by priority (low/medium/high/urgent) split by status (open vs closed)

**Filters:** Date • Team Member

### 5. Client Analysis View
Table showing top 20 clients ranked by ticket volume:
- Client Name, Plan Type, Total Tickets, Open Tickets, Total Spent ($), Last Ticket Date
- Searchable by client name
- Paginated (capped at top 20 per spec)
- **Internal-only** — client users receive 403 Forbidden

### 6. Response Time Analysis
Statistical analysis of resolution times:
- **Statistics cards** — min, max, median, average hours per priority level
- **Bar chart** — actual vs expected vs median resolution times
- **Overdue tickets table** — tickets that exceeded `avg_resolution_hours` from `ticket_types`

**Filters:** Date • Team Member

### 7. Client Portal
Simplified view for client users:
- View their own tickets (with status, priority, created date)
- Create new tickets (selecting ticket type and priority)
- View ticket details, conversation history, and messages
- Leave feedback (rating + text) on resolved tickets
- **Cannot access** dashboard, analytics, team performance, or other clients' data

### 8. Bonus: BetterAuth Integration ✅
- BetterAuth email/password authentication with scrypt password hashing
- `app_user_profile` table linking auth users → clients or team members
- Role-based middleware: `/dashboard/*` → internal only, `/portal/*` → clients only
- Role-based UI rendering (sidebar navigation adapts to user type)
- RLS policies adjusted to work with BetterAuth user IDs

---

## Row Level Security (RLS)

### Architecture

RLS is enforced at the **PostgreSQL database level** using native Postgres policies. This provides defense-in-depth beyond application-level access checks.

### Policy Design

| Table | Internal Team Members | Client Users |
|---|---|---|
| `tickets` | SELECT all, UPDATE all | SELECT own (by `client_id`), INSERT own |
| `ticket_messages` | SELECT all | SELECT/INSERT own (via ticket ownership) |
| `ticket_feedback` | SELECT all | SELECT/INSERT own (via ticket ownership) |
| `clients` | SELECT all | SELECT own record only |
| `payments` | SELECT all | SELECT own payments only |
| `team_members` | SELECT all | SELECT all (public info) |
| `ticket_types` | SELECT all | SELECT all |

### Helper Functions

Two PostgreSQL functions drive the policies:

```sql
-- Determines the role (internal/client) of the current user
get_user_role(user_auth_id TEXT) → TEXT

-- Gets the client_id linked to the current user (NULL for internal users)
get_user_client_id(user_auth_id TEXT) → INTEGER
```

These functions query the `app_user_profile` bridge table, which links BetterAuth's `user.id` to either a `client_id` or `team_member_id`.

### Policy Examples

```sql
-- Internal team: full read access to tickets
CREATE POLICY "tickets_internal_read" ON tickets
  FOR SELECT USING (
    get_user_role(current_setting('app.current_user_id', true)) = 'internal'
  );

-- Client users: can only read their own tickets
CREATE POLICY "tickets_client_read" ON tickets
  FOR SELECT USING (
    client_id = get_user_client_id(current_setting('app.current_user_id', true))
  );

-- Client users: can only insert tickets for their own client_id
CREATE POLICY "tickets_client_insert" ON tickets
  FOR INSERT WITH CHECK (
    client_id = get_user_client_id(current_setting('app.current_user_id', true))
  );
```

---

## RLS with BetterAuth

### The Challenge

BetterAuth manages its own `user`, `session`, and `account` tables. Postgres RLS policies need to know _who_ is making the query, but Drizzle ORM connects with a single database user — not per-request sessions.

### The Solution: `withRLS()` Transaction Wrapper

We bridge BetterAuth and Postgres RLS using a custom transaction wrapper in `src/db/index.ts`:

```typescript
export async function withRLS<T>(
  userId: string | null,
  fn: (tx: typeof db) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    if (userId) {
      await tx.execute(
        sql`SELECT set_config('app.current_user_id', ${userId}, true)`
      );
    }
    return fn(tx as any);
  });
}
```

**How it works:**

1. Every API route calls `getAuthUser()` to extract the authenticated BetterAuth user from the session cookie
2. The user's `auth_user_id` is passed to `withRLS()`
3. Inside a Postgres transaction, `SET LOCAL app.current_user_id = '<id>'` is executed (the `true` parameter to `set_config` makes it transaction-local)
4. All subsequent queries in that transaction are filtered by Postgres RLS policies, which call `current_setting('app.current_user_id')` to identify the user
5. When the transaction ends, the session variable is automatically cleared

**Every single API route** uses `withRLS()`:
- `/api/dashboard`
- `/api/tickets-over-time`
- `/api/team-performance`
- `/api/ticket-distribution`
- `/api/client-analysis`
- `/api/response-time`
- `/api/tickets` (GET + POST)
- `/api/tickets/[id]`
- `/api/tickets/[id]/messages`
- `/api/tickets/[id]/feedback`

---

## Database Indexing Strategy

### Indexes from Schema (`schema.sql`)

| Index | Table | Column(s) | Purpose |
|---|---|---|---|
| `idx_tickets_client_id` | tickets | `client_id` | Fast lookup of tickets by client (RLS, client portal) |
| `idx_tickets_assigned_to` | tickets | `assigned_to` | Team performance queries, filter by team member |
| `idx_tickets_status` | tickets | `status` | Dashboard open ticket count, status-based filtering |
| `idx_tickets_created_at` | tickets | `created_at` | Time-series chart, date range filtering |
| `idx_tickets_resolved_at` | tickets | `resolved_at` | Resolution time calculations |
| `idx_ticket_messages_ticket_id` | ticket_messages | `ticket_id` | Fast message lookup for ticket detail view |
| `idx_payments_client_id` | payments | `client_id` | Client analysis payment aggregation |

### Indexes from Users (`users.sql`)

| Index | Table | Column(s) | Purpose |
|---|---|---|---|
| `idx_tickets_priority` | tickets | `priority` | Priority filter performance |
| `idx_tickets_ticket_type_id` | tickets | `ticket_type_id` | Ticket type filter performance |
| `idx_tickets_composite_status_created` | tickets | `(status, created_at)` | Compound filter: status + date range |
| `idx_tickets_composite_assigned_created` | tickets | `(assigned_to, created_at)` | Compound filter: team member + date range |
| `idx_ticket_feedback_ticket_id` | ticket_feedback | `ticket_id` | Join performance for satisfaction queries |
| `idx_ticket_feedback_rating` | ticket_feedback | `rating` | Rating aggregation |
| `idx_payments_status` | payments | `status` | Payment status filtering |
| `idx_clients_plan_type` | clients | `plan_type` | Client analysis plan-type grouping |
| `idx_clients_status` | clients | `status` | Client status filtering |
| `idx_app_user_profile_auth_user_id` | app_user_profile | `auth_user_id` | RLS helper function lookups (called on every query) |
| `idx_app_user_profile_client_id` | app_user_profile | `client_id` | Reverse lookup: client → auth user |
| `idx_session_user_id` | session | `user_id` | BetterAuth session validation |
| `idx_session_token` | session | `token` | BetterAuth token lookup |

### Why Composite Indexes?

The two composite indexes (`status + created_at` and `assigned_to + created_at`) are critical because the most common dashboard queries combine these columns. A composite index lets Postgres satisfy both the filter and the sort/range in a single index scan instead of two separate scans + merge.

---

## Performance Optimizations

### Database Level
- **13+ indexes** covering all common query patterns (see above)
- **Server-side aggregation** — all COUNT, AVG, SUM, PERCENTILE_CONT computations happen in PostgreSQL, not in JavaScript
- **Offset-based pagination** on all list endpoints (tickets, client analysis)
- **RLS helper functions** marked as `SECURITY DEFINER STABLE`, allowing Postgres to cache their results within a transaction

### Application Level
- **React Query caching** with `staleTime` to prevent unnecessary re-fetches:
  - Dashboard/chart data: 60 seconds
  - Ticket lists: 30 seconds
  - Metadata (team members, ticket types): 5 minutes
- **Selective data fetching** — each page only fetches what it needs via dedicated API endpoints
- **Debounced filter updates** — filter changes trigger API calls with query parameters, not full page reloads

### Frontend Level
- **Responsive charts** using Recharts with `ResponsiveContainer`
- **Skeleton loading states** for all components
- **CSS animations** for smooth page transitions

---

## Performance Testing Results

Measured from the dev server logs (`npm run dev`) with ~42,900 tickets:

| Endpoint | Response Time | Target | Status |
|---|---|---|---|
| `GET /api/dashboard` | ~600ms | < 500ms | ⚠️ Close |
| `GET /api/dashboard?filters` | ~590ms | < 1s | ✅ |
| `GET /api/tickets-over-time` | ~610-890ms | < 800ms | ✅ (after warm-up) |
| `GET /api/team-performance` | ~560-645ms | < 800ms | ✅ |
| `GET /api/ticket-distribution` | ~250ms | < 800ms | ✅ |
| `GET /api/client-analysis` | ~825ms | < 1s | ✅ |
| `GET /api/response-time` | ~640ms | < 1s | ✅ |
| `GET /api/tickets?page=N` | ~300ms | < 300ms | ✅ |
| `GET /api/metadata` | ~190ms | < 300ms | ✅ |

> **Note:** First-hit times include Next.js compilation overhead (~30-130ms). Subsequent requests (warm cache) are significantly faster. Production builds (`next build`) eliminate compilation overhead entirely.

---

## Scaling to 100k+ Tickets

### Current Architecture Readiness

The current design handles 42,900 tickets efficiently. Here's how it would scale to 100k+:

### Database Strategies
1. **Existing indexes** already cover the critical query patterns — no changes needed until 500k+
2. **Partitioning** — partition the `tickets` table by `created_at` month using Postgres declarative partitioning. This would allow queries filtering by date range to only scan relevant partitions
3. **Materialized Views** — for the dashboard overview and team performance queries, create materialized views that pre-compute aggregations. Refresh them on a schedule (e.g., every 5 minutes) or via triggers

### Application Strategies
4. **Cursor-based pagination** — replace offset-based pagination with cursor-based (keyset) pagination for consistent performance regardless of page depth
5. **Aggressive caching** — increase React Query `staleTime` for analytics data that doesn't need real-time freshness (e.g., 5 minutes for charts)
6. **API response caching** — add Redis or Vercel Edge caching for expensive aggregation queries with a 60-second TTL
7. **Connection pooling** — use Supabase's built-in PgBouncer connection pooler for handling concurrent connections

### Infrastructure Strategies
8. **Read replicas** — route analytics queries (read-heavy) to a read replica, keeping the primary for writes (ticket creation, messages)
9. **Background jobs** — move heavy aggregations to background workers that update cached results, rather than computing on every request
10. **CDN caching** — cache static metadata (ticket types, team members list) at the CDN level with appropriate `Cache-Control` headers

---

## Assumptions

1. **Password hashing** — Used BetterAuth's native scrypt hashing. All seed users share `password123` for testing purposes only
2. **Date handling** — All dates are stored and compared in UTC. The frontend displays them in the user's local timezone
3. **Ticket assignment** — Every ticket is assigned to exactly one team member (no unassigned tickets in the seed data)
4. **Client isolation** — Client users see ONLY their own data. Even if they manipulate API requests, RLS policies at the database level prevent unauthorized access
5. **Top 20 clients** — The Client Analysis view strictly limits results to the top 20 clients by ticket volume, as specified in the requirements
6. **Resolution time** — Calculated as `resolved_at - created_at` in hours. Only tickets with a non-null `resolved_at` are included in averages
7. **Feedback scope** — Only resolved tickets can receive feedback. The rating scale is 1-5

---

## Future Improvements

1. **Real-time updates** — Add WebSocket/SSE support for live ticket updates on the dashboard and client portal
2. **Email notifications** — Notify clients when their ticket status changes or a team member replies
3. **Advanced analytics** — Add trend analysis, SLA compliance tracking, and predictive models for ticket volume
4. **Proper role management** — Add an admin panel for managing user roles, creating new team members, and assigning permissions
5. **Ticket search** — Add full-text search across ticket titles and messages using PostgreSQL's `tsvector` and `GIN` indexes
6. **Export functionality** — Allow exporting dashboard data and reports to CSV/PDF
7. **Dark/light theme toggle** — Currently dark mode only; add a theme switcher
8. **Audit logging** — Track all user actions (login, ticket creation, status changes) for compliance
9. **Rate limiting** — Add API rate limiting to prevent abuse
10. **E2E tests** — Add Playwright or Cypress end-to-end tests for critical user flows
11. **Materialized views** — Pre-compute expensive aggregations for the dashboard to reduce query time to near-zero
12. **Cursor pagination** — Replace offset-based pagination with cursor-based for better performance at scale

---

## Project Structure

```
opskings-interview/
├── database/
│   ├── schema.sql          # Table definitions
│   ├── seed.sql            # Sample data (~42,900 tickets)
│   └── users.sql           # Auth users, RLS policies, indexes
├── src/
│   ├── app/
│   │   ├── api/            # API routes (all use withRLS)
│   │   │   ├── dashboard/
│   │   │   ├── tickets/
│   │   │   ├── tickets-over-time/
│   │   │   ├── team-performance/
│   │   │   ├── ticket-distribution/
│   │   │   ├── client-analysis/
│   │   │   ├── response-time/
│   │   │   └── metadata/
│   │   ├── dashboard/      # Internal team pages
│   │   │   ├── page.tsx              # Overview cards
│   │   │   ├── tickets-chart/        # Time series chart
│   │   │   ├── team-performance/     # Performance table
│   │   │   ├── distribution/         # Pie + bar charts
│   │   │   ├── clients/              # Client analysis
│   │   │   └── response-time/        # Response time stats
│   │   ├── portal/         # Client portal pages
│   │   │   ├── page.tsx              # Ticket list
│   │   │   ├── new-ticket/           # Create ticket
│   │   │   └── tickets/[id]/         # Ticket detail
│   │   ├── login/          # Auth page
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── filters/FilterBar.tsx     # Reusable filter component
│   │   └── layout/                   # Sidebar, header
│   ├── db/
│   │   ├── index.ts        # Drizzle instance + withRLS()
│   │   └── schema.ts       # Drizzle table definitions
│   ├── hooks/
│   │   └── use-dashboard.ts          # TanStack Query hooks
│   ├── lib/
│   │   ├── auth.ts         # BetterAuth configuration
│   │   ├── auth-utils.ts   # Auth helper functions
│   │   └── filters.ts      # Filter parsing + SQL building
│   └── middleware.ts       # Role-based route protection
├── .env.local              # Environment variables (not committed)
├── package.json
├── tsconfig.json
└── README.md               # This file
```

---

## License

This project was built as part of the OpsKings development interview process.