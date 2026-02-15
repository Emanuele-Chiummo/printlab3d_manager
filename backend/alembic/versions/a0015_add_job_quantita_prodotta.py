"""add job quantita prodotta

Revision ID: a0015
Revises: a0014
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a0015'
down_revision = 'a0014'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('jobs', sa.Column('quantita_prodotta', sa.Integer(), nullable=False, server_default='1'))


def downgrade():
    op.drop_column('jobs', 'quantita_prodotta')
