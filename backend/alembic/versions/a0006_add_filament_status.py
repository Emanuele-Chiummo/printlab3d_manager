
"""add filament status column
Revision ID: a0006
Revises: a0005
Create Date: 2026-02-15
"""
from alembic import op
import sqlalchemy as sa

revision = 'a0006'
down_revision = 'a0005'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'filaments',
        sa.Column('stato', sa.String(20), nullable=False, server_default='DISPONIBILE')
    )


def downgrade():
    op.drop_column('filaments', 'stato')
