"""ore_manodopera to numeric

Revision ID: a0019
Revises: a0018
Create Date: 2026-02-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a0019'
down_revision = 'a0018'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('quote_lines', 'ore_manodopera_min',
                    type_=sa.Numeric(10, 2),
                    existing_type=sa.Integer(),
                    existing_nullable=False)


def downgrade():
    op.alter_column('quote_lines', 'ore_manodopera_min',
                    type_=sa.Integer(),
                    existing_type=sa.Numeric(10, 2),
                    existing_nullable=False)
