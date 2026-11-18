#!/usr/bin/env bash
# Connects Makoma to a Supabase project in one go.
#
#   SUPABASE_ACCESS_TOKEN=sbp_... ./scripts/connect-supabase.sh <project-ref> <anon-key>
#
# 1. Links this repo to the project and applies supabase/migrations (+ seed.sql).
# 2. Writes .env.local so `npx expo start` talks to Supabase.
# 3. If EXPO_TOKEN is set, saves the two public values to EAS (development,
#    preview, production) so builds and `eas update` use them too.
# Safe to re-run: migrations already applied are skipped.
set -euo pipefail
cd "$(dirname "$0")/.."

REF=${1:?usage: connect-supabase.sh <project-ref> <anon-key>}
ANON=${2:?usage: connect-supabase.sh <project-ref> <anon-key>}
URL="https://${REF}.supabase.co"
: "${SUPABASE_ACCESS_TOKEN:?set SUPABASE_ACCESS_TOKEN (supabase.com > Account > Access Tokens)}"
SB="npx -y supabase@2"

echo "→ Linking project ${REF}"
[ -f supabase/config.toml ] || $SB init --workdir . >/dev/null
$SB link --project-ref "$REF"

echo "→ Applying database migrations and seed data"
$SB db push --include-seed --yes

echo "→ Writing .env.local"
cat > .env.local <<ENV
EXPO_PUBLIC_SUPABASE_URL=${URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${ANON}
ENV

if [ -n "${EXPO_TOKEN:-}" ]; then
  echo "→ Saving public Supabase values to EAS environments"
  for envname in development preview production; do
    for kv in "EXPO_PUBLIC_SUPABASE_URL=${URL}" "EXPO_PUBLIC_SUPABASE_ANON_KEY=${ANON}"; do
      npx -y eas-cli@latest env:create --environment "$envname" --name "${kv%%=*}" --value "${kv#*=}" \
        --visibility plaintext --force --non-interactive >/dev/null
    done
  done
fi

echo "✓ Supabase connected: ${URL}"
echo "  Next: enable Phone sign-in in the dashboard (Authentication > Sign In / Providers > Phone)."
