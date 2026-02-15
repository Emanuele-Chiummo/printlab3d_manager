"""
Add tipo_cliente fields to customers
Revision ID: a0004
Revises: a0003
Create Date: 2026-02-13
"""
from alembic import op
import sqlalchemy as sa
revision = 'a0004'
down_revision = 'a0003'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('customers', sa.Column('tipo_cliente', sa.String(length=10), nullable=False, server_default='DITTA'))
    op.add_column('customers', sa.Column('nome', sa.String(length=100), nullable=False, server_default=''))
    op.add_column('customers', sa.Column('cognome', sa.String(length=100), nullable=False, server_default=''))
    op.add_column('customers', sa.Column('codice_fiscale', sa.String(length=16), nullable=False, server_default=''))


def downgrade():
    op.drop_column('customers', 'tipo_cliente')
    op.drop_column('customers', 'nome')
    op.drop_column('customers', 'cognome')
    op.drop_column('customers', 'codice_fiscale')
