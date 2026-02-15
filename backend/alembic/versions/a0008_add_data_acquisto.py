"""add data_acquisto to filaments

Revision ID: a0008
Revises: a0007
Create Date: 2026-02-15

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a0008'
down_revision: Union[str, None] = 'a0007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('filaments', sa.Column('data_acquisto', sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column('filaments', 'data_acquisto')
