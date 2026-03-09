-- ============================================================
-- BetterAuth Tables & App User Profiles
-- Run AFTER schema.sql and seed.sql
-- ============================================================

-- Password hash pre-computed using BetterAuth's hashPassword('password123')
-- BetterAuth uses scrypt hashing (NOT bcrypt), so we use a pre-computed hash

-- BetterAuth core tables
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  role TEXT NOT NULL DEFAULT 'client'  -- 'internal' or 'client'
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMP WITH TIME ZONE,
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Link auth users to app entities
CREATE TABLE IF NOT EXISTS app_user_profile (
  id SERIAL PRIMARY KEY,
  auth_user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('internal', 'client')),
  client_id INTEGER REFERENCES clients(id),
  team_member_id INTEGER REFERENCES team_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_user_profile_auth_user_id ON app_user_profile(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_app_user_profile_client_id ON app_user_profile(client_id);
CREATE INDEX IF NOT EXISTS idx_app_user_profile_team_member_id ON app_user_profile(team_member_id);
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);

-- ============================================================
-- Seed Auth Users
-- All passwords are: password123
-- Clean up existing auth data first (safe to re-run)
-- ============================================================
TRUNCATE TABLE app_user_profile, "account", "session", "verification", "user" RESTART IDENTITY CASCADE;

-- Internal team members (3 users)
-- john.smith@company.com, sarah.jones@company.com, emily.brown@company.com
DO $$
DECLARE
  v_user_id TEXT;
  v_hashed_pw TEXT;
  v_tm RECORD;
BEGIN
  -- Pre-computed BetterAuth scrypt hash for 'password123'
  v_hashed_pw := '0bbc97524402223744e1d1ae37cb86b0:c0c1eb6dca1c327e678e0da58e0c573411fc6f3479211b332dc0836feea2ad6572f0d84a379485c778ab1bb3624812d557d15d01bac832533f2e2cb90efd0cfe';

  -- Internal team member: john_smith (id=1)
  v_user_id := gen_random_uuid()::TEXT;
  INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
  VALUES (v_user_id, 'John Smith', 'john.smith@company.com', TRUE, 'internal', NOW(), NOW());
  INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
  VALUES (gen_random_uuid()::TEXT, v_user_id, 'credential', v_user_id, v_hashed_pw, NOW(), NOW());
  INSERT INTO app_user_profile (auth_user_id, role, team_member_id)
  VALUES (v_user_id, 'internal', 1);

  -- Internal team member: sarah_jones (id=2)
  v_user_id := gen_random_uuid()::TEXT;
  INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
  VALUES (v_user_id, 'Sarah Jones', 'sarah.jones@company.com', TRUE, 'internal', NOW(), NOW());
  INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
  VALUES (gen_random_uuid()::TEXT, v_user_id, 'credential', v_user_id, v_hashed_pw, NOW(), NOW());
  INSERT INTO app_user_profile (auth_user_id, role, team_member_id)
  VALUES (v_user_id, 'internal', 2);

  -- Internal team member: emily_brown (id=4, technical dept)
  v_user_id := gen_random_uuid()::TEXT;
  INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
  VALUES (v_user_id, 'Emily Brown', 'emily.brown@company.com', TRUE, 'internal', NOW(), NOW());
  INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
  VALUES (gen_random_uuid()::TEXT, v_user_id, 'credential', v_user_id, v_hashed_pw, NOW(), NOW());
  INSERT INTO app_user_profile (auth_user_id, role, team_member_id)
  VALUES (v_user_id, 'internal', 4);
END $$;

-- Client users (all 50 clients from the clients table)
-- Each client gets a user account with their email from the clients table
DO $$
DECLARE
  v_client RECORD;
  v_user_id TEXT;
  v_hashed_pw TEXT;
BEGIN
  -- Pre-computed BetterAuth scrypt hash for 'password123'
  v_hashed_pw := '0bbc97524402223744e1d1ae37cb86b0:c0c1eb6dca1c327e678e0da58e0c573411fc6f3479211b332dc0836feea2ad6572f0d84a379485c778ab1bb3624812d557d15d01bac832533f2e2cb90efd0cfe';

  FOR v_client IN
    SELECT id, client_name, email FROM clients ORDER BY id
  LOOP
    v_user_id := gen_random_uuid()::TEXT;

    INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
    VALUES (v_user_id, v_client.client_name, v_client.email, TRUE, 'client', NOW(), NOW());

    INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user_id, 'credential', v_user_id, v_hashed_pw, NOW(), NOW());

    INSERT INTO app_user_profile (auth_user_id, role, client_id)
    VALUES (v_user_id, 'client', v_client.id);
  END LOOP;
END $$;

-- ============================================================
-- Row Level Security Policies
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role(user_auth_id TEXT)
RETURNS TEXT AS $$
  SELECT role FROM app_user_profile WHERE auth_user_id = user_auth_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to get client_id for auth user
CREATE OR REPLACE FUNCTION get_user_client_id(user_auth_id TEXT)
RETURNS INTEGER AS $$
  SELECT client_id FROM app_user_profile WHERE auth_user_id = user_auth_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============ TICKET_TYPES (public read) ============
DROP POLICY IF EXISTS "ticket_types_read_all" ON ticket_types;
CREATE POLICY "ticket_types_read_all" ON ticket_types
  FOR SELECT USING (true);

-- ============ TEAM_MEMBERS (public info) ============
DROP POLICY IF EXISTS "team_members_read_all" ON team_members;
CREATE POLICY "team_members_read_all" ON team_members
  FOR SELECT USING (true);

-- ============ CLIENTS ============
DROP POLICY IF EXISTS "clients_internal_read" ON clients;
CREATE POLICY "clients_internal_read" ON clients
  FOR SELECT USING (
    get_user_role(current_setting('app.current_user_id', true)) = 'internal'
  );

DROP POLICY IF EXISTS "clients_own_read" ON clients;
CREATE POLICY "clients_own_read" ON clients
  FOR SELECT USING (
    id = get_user_client_id(current_setting('app.current_user_id', true))
  );

-- ============ TICKETS ============
DROP POLICY IF EXISTS "tickets_internal_read" ON tickets;
CREATE POLICY "tickets_internal_read" ON tickets
  FOR SELECT USING (
    get_user_role(current_setting('app.current_user_id', true)) = 'internal'
  );

DROP POLICY IF EXISTS "tickets_client_read" ON tickets;
CREATE POLICY "tickets_client_read" ON tickets
  FOR SELECT USING (
    client_id = get_user_client_id(current_setting('app.current_user_id', true))
  );

DROP POLICY IF EXISTS "tickets_client_insert" ON tickets;
CREATE POLICY "tickets_client_insert" ON tickets
  FOR INSERT WITH CHECK (
    client_id = get_user_client_id(current_setting('app.current_user_id', true))
  );

DROP POLICY IF EXISTS "tickets_internal_update" ON tickets;
CREATE POLICY "tickets_internal_update" ON tickets
  FOR UPDATE USING (
    get_user_role(current_setting('app.current_user_id', true)) = 'internal'
  );

-- ============ TICKET_MESSAGES ============
DROP POLICY IF EXISTS "ticket_messages_internal_read" ON ticket_messages;
CREATE POLICY "ticket_messages_internal_read" ON ticket_messages
  FOR SELECT USING (
    get_user_role(current_setting('app.current_user_id', true)) = 'internal'
  );

DROP POLICY IF EXISTS "ticket_messages_client_read" ON ticket_messages;
CREATE POLICY "ticket_messages_client_read" ON ticket_messages
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM tickets
      WHERE client_id = get_user_client_id(current_setting('app.current_user_id', true))
    )
  );

DROP POLICY IF EXISTS "ticket_messages_client_insert" ON ticket_messages;
CREATE POLICY "ticket_messages_client_insert" ON ticket_messages
  FOR INSERT WITH CHECK (
    ticket_id IN (
      SELECT id FROM tickets
      WHERE client_id = get_user_client_id(current_setting('app.current_user_id', true))
    )
  );

-- ============ TICKET_FEEDBACK ============
DROP POLICY IF EXISTS "ticket_feedback_internal_read" ON ticket_feedback;
CREATE POLICY "ticket_feedback_internal_read" ON ticket_feedback
  FOR SELECT USING (
    get_user_role(current_setting('app.current_user_id', true)) = 'internal'
  );

DROP POLICY IF EXISTS "ticket_feedback_client_read" ON ticket_feedback;
CREATE POLICY "ticket_feedback_client_read" ON ticket_feedback
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM tickets
      WHERE client_id = get_user_client_id(current_setting('app.current_user_id', true))
    )
  );

DROP POLICY IF EXISTS "ticket_feedback_client_insert" ON ticket_feedback;
CREATE POLICY "ticket_feedback_client_insert" ON ticket_feedback
  FOR INSERT WITH CHECK (
    ticket_id IN (
      SELECT id FROM tickets
      WHERE client_id = get_user_client_id(current_setting('app.current_user_id', true))
    )
  );

-- ============ PAYMENTS ============
DROP POLICY IF EXISTS "payments_internal_read" ON payments;
CREATE POLICY "payments_internal_read" ON payments
  FOR SELECT USING (
    get_user_role(current_setting('app.current_user_id', true)) = 'internal'
  );

DROP POLICY IF EXISTS "payments_client_read" ON payments;
CREATE POLICY "payments_client_read" ON payments
  FOR SELECT USING (
    client_id = get_user_client_id(current_setting('app.current_user_id', true))
  );

-- ============ Additional Performance Indexes ============
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type_id ON tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_tickets_composite_status_created ON tickets(status, created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_composite_assigned_created ON tickets(assigned_to, created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_ticket_id ON ticket_feedback(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_rating ON ticket_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_clients_plan_type ON clients(plan_type);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);