-- Phase B: RBAC System — Roles, Permissions, UserRoles
-- Remove role enum from users, add new RBAC tables

-- ─── 1. Create roles table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "roles" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "description" TEXT,
  "color"       TEXT NOT NULL DEFAULT '#1B4F8A',
  "is_system"   BOOLEAN NOT NULL DEFAULT false,
  "is_active"   BOOLEAN NOT NULL DEFAULT true,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "roles_slug_key" ON "roles"("slug");

-- ─── 2. Create permissions table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "permissions" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "module"      TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key" ON "permissions"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_slug_key" ON "permissions"("slug");

-- ─── 3. Create role_permissions table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "role_permissions" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "role_id"       TEXT NOT NULL,
  "permission_id" TEXT NOT NULL,
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
  CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- ─── 4. Create user_roles table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user_roles" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"     TEXT NOT NULL,
  "role_id"     TEXT NOT NULL,
  "assigned_by" TEXT,
  "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
  CONSTRAINT "user_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- ─── 5. Drop the old role column from users ──────────────────────────────────
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";

-- ─── 6. Drop the old Role enum type ──────────────────────────────────────────
DROP TYPE IF EXISTS "Role";
