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

echo "→ Configuring sign-in emails (6-digit code instead of a link)"
EMAIL_HTML='<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;color:#0a0805"><h1 style="font-family:Georgia,serif;color:#1a4a47;font-weight:600">Makoma</h1><p>Your sign-in code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1a4a47">{{ .Token }}</p><p style="color:#3d3530">It expires in 1 hour. If you didn’t ask for it, you can ignore this email.</p></div>'
TMPJSON=$(mktemp)
python3 - "$EMAIL_HTML" > "$TMPJSON" <<'PY'
import json, sys
html = sys.argv[1]
print(json.dumps({
  "mailer_otp_length": 6,
  "mailer_subjects_magic_link": "Your Makoma code",
  "mailer_templates_magic_link_content": html,
  "mailer_subjects_confirmation": "Your Makoma code",
  "mailer_templates_confirmation_content": html,
}))
PY
if curl -fsS -X PATCH "https://api.supabase.com/v1/projects/${REF}/config/auth" \
     -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" -H "Content-Type: application/json" \
     --data @"$TMPJSON" >/dev/null; then
  echo "  done"
else
  echo "  ! Couldn't update automatically. In the dashboard: Authentication > Emails > 'Magic Link' and 'Confirm signup':"
  echo "    put {{ .Token }} in the message, and set Email OTP length to 6 (Authentication > Providers > Email)."
fi
rm -f "$TMPJSON"

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
echo "  Sign-in uses email codes. For SMS later: Authentication > Sign In / Providers > Phone, then set EXPO_PUBLIC_SIGN_IN_METHOD=phone."
