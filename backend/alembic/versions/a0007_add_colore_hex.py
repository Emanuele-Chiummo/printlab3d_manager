
"""add colore_hex to filaments
Revision ID: a0007
Revises: a0006
Create Date: 2026-02-15
"""
from alembic import op
import sqlalchemy as sa

revision = 'a0007'
down_revision = 'a0006'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'filaments',
        sa.Column('colore_hex', sa.String(7), nullable=False, server_default='')
    )


def downgrade():
    op.drop_column('filaments', 'colore_hex')
