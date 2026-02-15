"""peso materiale to numeric

Revision ID: a0012
Revises: a0011
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a0012'
down_revision = 'a0011'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Cambia peso_materiale_g da Integer a Numeric per supportare decimali
    op.alter_column('quote_lines', 'peso_materiale_g',
                    existing_type=sa.Integer(),
                    type_=sa.Numeric(precision=10, scale=2),
                    existing_nullable=False)


def downgrade() -> None:
    op.alter_column('quote_lines', 'peso_materiale_g',
                    existing_type=sa.Numeric(precision=10, scale=2),
                    type_=sa.Integer(),
                    existing_nullable=False)
