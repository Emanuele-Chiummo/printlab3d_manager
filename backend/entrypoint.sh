#!/usr/bin/env bash
set -e

# ensure python can find the application modules when running from the container
export PYTHONPATH=/app

echo "[backend] running migrations..."
alembic upgrade head

echo "[backend] seeding demo data (if empty)..."
python -c "from app.db.session import SessionLocal; from app.db.seed import seed_if_empty; db=SessionLocal(); seed_if_empty(db); db.close()"

echo "[backend] starting api..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
