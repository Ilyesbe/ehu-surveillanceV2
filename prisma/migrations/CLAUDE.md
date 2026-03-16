# prisma/migrations/

Auto-generated migration history managed by Prisma Migrate. Do not edit any files in this directory manually.

## Structure
Each subfolder represents one migration and is named with a timestamp + description, e.g.:
```
20240101120000_init/
  migration.sql     ← SQL statements for this migration
  migration.json    ← Prisma migration metadata
```

## How Migrations Work
- `npx prisma migrate dev` creates a new migration folder with the SQL diff and applies it to the dev database
- `npx prisma migrate deploy` applies all pending migrations in order (used in CI/CD and production)
- `npx prisma migrate status` shows which migrations have been applied

## Rules
- Never manually edit or delete migration files — this breaks the migration history checksum
- Never rename migration folders
- If a migration needs to be undone, create a new migration that reverses the change
- The `migration_lock.toml` file at the prisma root pins the database provider (postgresql) — do not change it
