"""add quote cost fields

Revision ID: a0009
Revises: a0008
Create Date: 2026-02-15

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a0009'
down_revision: Union[str, None] = 'a0008'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Aggiungi campi a quote_versions
    op.add_column('quote_versions', sa.Column('potenza_w', sa.Numeric(10, 2), nullable=False, server_default='200.0'))
    op.add_column('quote_versions', sa.Column('costo_energia_kwh', sa.Numeric(10, 4), nullable=False, server_default='0.15'))
    op.add_column('quote_versions', sa.Column('consumabili_fissi_eur', sa.Numeric(10, 2), nullable=False, server_default='0.5'))
    op.add_column('quote_versions', sa.Column('rischio_pct', sa.Numeric(5, 2), nullable=False, server_default='5.0'))
    
    # Aggiungi campi a quote_lines
    op.add_column('quote_lines', sa.Column('ore_manodopera_min', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('quote_lines', sa.Column('costo_energia_eur', sa.Numeric(10, 2), nullable=False, server_default='0.0'))
    op.add_column('quote_lines', sa.Column('costo_consumabili_eur', sa.Numeric(10, 2), nullable=False, server_default='0.0'))


def downgrade() -> None:
    op.drop_column('quote_lines', 'costo_consumabili_eur')
    op.drop_column('quote_lines', 'costo_energia_eur')
    op.drop_column('quote_lines', 'ore_manodopera_min')
    op.drop_column('quote_versions', 'rischio_pct')
    op.drop_column('quote_versions', 'consumabili_fissi_eur')
    op.drop_column('quote_versions', 'costo_energia_kwh')
    op.drop_column('quote_versions', 'potenza_w')
