#!/usr/bin/env bash
# Per-boot startup for KaamSetu: bring PostgreSQL online before the dev server.
# Idempotent and safe to run on every environment start.
set -euo pipefail

PG_VERSION="16"
PG_CLUSTER="main"

sudo pg_ctlcluster "${PG_VERSION}" "${PG_CLUSTER}" start 2>/dev/null || true

for _ in $(seq 1 30); do
  if pg_isready -h localhost -q; then
    echo "PostgreSQL is accepting connections."
    exit 0
  fi
  sleep 1
done

echo "PostgreSQL did not become ready in time." >&2
exit 1
