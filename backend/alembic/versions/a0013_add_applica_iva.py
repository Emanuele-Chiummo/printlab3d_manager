"""add applica iva flag

Revision ID: a0013
Revises: a0012
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a0013'
down_revision = 'a0012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Aggiungi flag applica_iva a quote_versions (default True)
    op.add_column('quote_versions', sa.Column('applica_iva', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    op.drop_column('quote_versions', 'applica_iva')
