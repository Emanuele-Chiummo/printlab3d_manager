"""add printers table

Revision ID: a0017_add_printers
Revises: a0016
Create Date: 2026-02-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a0017'
down_revision = 'a0016'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'printers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('modello', sa.String(), nullable=False),
        sa.Column('potenza_w', sa.Numeric(10, 2), nullable=False),
        sa.Column('costo_macchina_eur', sa.Numeric(10, 2), nullable=False),
        sa.Column('vita_stimata_h', sa.Numeric(10, 2), nullable=False, server_default='8000'),
        sa.Column('manutenzione_eur_h', sa.Numeric(10, 4), nullable=False, server_default='0.20'),
        sa.Column('stato', sa.Enum('ATTIVA', 'MANUTENZIONE', 'INATTIVA', name='printerstatus'), nullable=False, server_default='ATTIVA'),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_printers_id'), 'printers', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_printers_id'), table_name='printers')
    op.drop_table('printers')
    op.execute('DROP TYPE IF EXISTS printerstatus')
