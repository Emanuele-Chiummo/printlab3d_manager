"""add prezzo vendita

Revision ID: a0011
Revises: a0010
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a0011'
down_revision = 'a0010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Aggiungi campo prezzo_unitario_vendita (opzionale) a quote_versions
    op.add_column('quote_versions', sa.Column('prezzo_unitario_vendita', sa.Numeric(precision=10, scale=2), nullable=True))


def downgrade() -> None:
    op.drop_column('quote_versions', 'prezzo_unitario_vendita')
