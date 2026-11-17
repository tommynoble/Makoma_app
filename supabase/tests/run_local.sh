#!/usr/bin/env bash
# Applies migrations to a throwaway database and runs the smoke test.
# Uses the standard libpq env vars: PGHOST, PGPORT, PGUSER (defaults: localhost, 5432, postgres).
set -euo pipefail
cd "$(dirname "$0")/.."
export PGUSER=${PGUSER:-postgres}
DB=makoma_test_$$
psql -d postgres -qc "create database $DB"
trap 'psql -d postgres -qc "drop database $DB"' EXIT
psql -d "$DB" -q -v ON_ERROR_STOP=1 -f tests/supabase_stubs.sql 2>&1 | grep -v -i "wal_level" || true
for f in migrations/*.sql; do psql -d "$DB" -q -v ON_ERROR_STOP=1 -f "$f"; done
psql -d "$DB" -q -v ON_ERROR_STOP=1 -f seed.sql
psql -d "$DB" -qtA -f tests/smoke_test.sql 2>&1
