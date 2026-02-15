"""add quantity to quote lines

Revision ID: a0010
Revises: a0009
Create Date: 2026-02-15

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a0010'
down_revision: Union[str, None] = 'a0009'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('quote_lines', sa.Column('quantita', sa.Integer(), nullable=False, server_default='1'))


def downgrade() -> None:
    op.drop_column('quote_lines', 'quantita')
