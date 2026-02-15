"""
Convert user.role column from enum to VARCHAR
Revision ID: a0002
Revises: a0001
Create Date: 2026-02-13
"""
from alembic import op
import sqlalchemy as sa
revision = 'a0002'
down_revision = 'a0001'
branch_labels = None
depends_on = None

def upgrade():
    # Drop default and constraints
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20) USING role::text")
    op.execute("DROP TYPE IF EXISTS userrole")

def downgrade():
    op.execute("CREATE TYPE userrole AS ENUM ('ADMIN', 'OPERATORE', 'COMMERCIALE', 'VIEWER')")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::userrole")
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'VIEWER'")
