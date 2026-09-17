#!/usr/bin/env bash
#
# Deploy the Ruko PWA to AWS Amplify Hosting by uploading a zip.
#
# Manual deployment on purpose: it needs no GitHub OAuth and no console clicks,
# so the whole thing runs from a laptop (or from Claude Code on a phone).
#
#   scripts/deploy-frontend.sh --api https://xxxx.execute-api.us-east-1.amazonaws.com/prod
#   scripts/deploy-frontend.sh --dry-run        # show what it would do, touch nothing
#
set -euo pipefail

APP_NAME="${RUKO_APP_NAME:-ruko}"
BRANCH="${RUKO_BRANCH:-main}"
REGION="${AWS_REGION:-us-east-1}"
API_URL=""
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api) API_URL="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --region) REGION="$2"; shift 2 ;;
    --app-name) APP_NAME="$2"; shift 2 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND="$ROOT/frontend"
ZIP="$FRONTEND/ruko-site.zip"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
note() { printf '  %s\n' "$*"; }

# --- 1. build ---------------------------------------------------------------

if [[ -z "$API_URL" && $DRY_RUN -eq 0 ]]; then
  echo "error: pass --api <backend url>, or the site will ship in demo mode." >&2
  echo "       (use --dry-run to inspect without building or deploying)" >&2
  exit 2
fi

say "1. Building the site"
note "API URL: ${API_URL:-<none: demo mode>}"
if [[ $DRY_RUN -eq 0 ]]; then
  ( cd "$FRONTEND" && VITE_API_URL="$API_URL" npm run build )
  rm -f "$ZIP"
  ( cd "$FRONTEND/dist" && zip -q -r "$ZIP" . )
  note "packaged $(du -h "$ZIP" | cut -f1) -> $ZIP"
else
  note "(dry run: would run npm run build and zip frontend/dist)"
fi

# --- 2. find or create the Amplify app --------------------------------------

# Each page is a real file; these rewrites only cover the extensionless paths.
# Anything unknown falls back to the landing page rather than an Amplify error.
CUSTOM_RULES='[
  {"source":"/check","target":"/check/index.html","status":"200"},
  {"source":"/guardian","target":"/guardian/index.html","status":"200"},
  {"source":"/<*>","target":"/index.html","status":"404-200"}
]'

say "2. Amplify app"
APP_ID="$(aws amplify list-apps --region "$REGION" \
  --query "apps[?name=='$APP_NAME'].appId | [0]" --output text 2>/dev/null || echo "None")"

if [[ "$APP_ID" == "None" || -z "$APP_ID" ]]; then
  note "no app named '$APP_NAME' yet — it will be created"
  if [[ $DRY_RUN -eq 1 ]]; then
    note "(dry run: stopping here, nothing created)"
    exit 0
  fi
  # /check is a real file, so the only rewrite needed is the extensionless path.
  # Anything unknown falls back to the landing page rather than an Amplify error.
  APP_ID="$(aws amplify create-app \
    --region "$REGION" \
    --name "$APP_NAME" \
    --platform WEB \
    --description "Ruko — before you pay, click, or call back" \
    --custom-rules "$CUSTOM_RULES" \
    --query 'app.appId' --output text)"
  note "created app $APP_ID"
else
  note "reusing app $APP_ID"
  if [[ $DRY_RUN -eq 1 ]]; then
    note "(dry run: stopping here, nothing changed)"
    exit 0
  fi
  # Keep the rewrites in step with the pages that exist now.
  aws amplify update-app --region "$REGION" --app-id "$APP_ID" \
    --custom-rules "$CUSTOM_RULES" --no-cli-pager >/dev/null
  note "rewrite rules refreshed"
fi

if ! aws amplify get-branch --region "$REGION" --app-id "$APP_ID" --branch-name "$BRANCH" \
     >/dev/null 2>&1; then
  aws amplify create-branch --region "$REGION" --app-id "$APP_ID" --branch-name "$BRANCH" \
    --no-cli-pager >/dev/null
  note "created branch $BRANCH"
fi

# --- 3. upload and release --------------------------------------------------

say "3. Uploading"
DEPLOYMENT="$(aws amplify create-deployment --region "$REGION" \
  --app-id "$APP_ID" --branch-name "$BRANCH" --output json)"
JOB_ID="$(echo "$DEPLOYMENT" | python3 -c 'import json,sys; print(json.load(sys.stdin)["jobId"])')"
UPLOAD_URL="$(echo "$DEPLOYMENT" | python3 -c 'import json,sys; print(json.load(sys.stdin)["zipUploadUrl"])')"

curl -sS -X PUT -T "$ZIP" -H "Content-Type: application/zip" "$UPLOAD_URL"
note "uploaded, job $JOB_ID"

aws amplify start-deployment --region "$REGION" \
  --app-id "$APP_ID" --branch-name "$BRANCH" --job-id "$JOB_ID" --no-cli-pager >/dev/null

# --- 4. wait ----------------------------------------------------------------

say "4. Releasing"
for _ in $(seq 1 60); do
  STATUS="$(aws amplify get-job --region "$REGION" --app-id "$APP_ID" \
    --branch-name "$BRANCH" --job-id "$JOB_ID" \
    --query 'job.summary.status' --output text 2>/dev/null || echo PENDING)"
  case "$STATUS" in
    SUCCEED) note "deployment succeeded"; break ;;
    FAILED|CANCELLED) echo "  deployment $STATUS" >&2; exit 1 ;;
    *) printf '  %s...\r' "$STATUS"; sleep 5 ;;
  esac
done

DOMAIN="$(aws amplify get-app --region "$REGION" --app-id "$APP_ID" \
  --query 'app.defaultDomain' --output text)"

say "Live"
echo "  https://${BRANCH}.${DOMAIN}"
echo "  https://${BRANCH}.${DOMAIN}/check"
echo
echo "Remember to allow that origin on the API:"
echo "  sam deploy --parameter-overrides AllowedOrigins=\"https://${BRANCH}.${DOMAIN},http://localhost:5173\" ..."
