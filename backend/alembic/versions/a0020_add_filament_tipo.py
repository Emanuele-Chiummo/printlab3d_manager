"""add filament tipo

Revision ID: a0020
Revises: a0019
Create Date: 2026-02-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a0020'
down_revision = 'a0019'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('filaments', sa.Column('tipo', sa.String(50), server_default='', nullable=False))


def downgrade():
    op.drop_column('filaments', 'tipo')
