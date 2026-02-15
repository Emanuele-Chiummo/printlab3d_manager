
"""add preventivo_settings table
Revision ID: a0005
Revises: a0004
Create Date: 2026-02-15
"""
from alembic import op
import sqlalchemy as sa
revision = 'a0005'
down_revision = 'a0004'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'preventivo_settings',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('costo_kwh_eur', sa.Float(), nullable=False, default=0.15),
        sa.Column('costo_manodopera_eur_h', sa.Float(), nullable=False, default=10),
        sa.Column('margine_pct', sa.Float(), nullable=False, default=30),
        sa.Column('overhead_pct', sa.Float(), nullable=False, default=5),
        sa.Column('fattore_rischio_pct', sa.Float(), nullable=False, default=5),
        sa.Column('consumabili_eur_stampa', sa.Float(), nullable=False, default=0.5),
        sa.Column('soglia_filamento_basso_g', sa.Float(), nullable=False, default=150),
    )

def downgrade():
    op.drop_table('preventivo_settings')
