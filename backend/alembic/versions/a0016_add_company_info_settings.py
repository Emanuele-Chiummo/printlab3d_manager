"""add company info to preventivo settings

Revision ID: a0016
Revises: a0015
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a0016'
down_revision = 'a0015'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('preventivo_settings', sa.Column('company_name', sa.String(255), nullable=False, server_default='PRINTLAB3D'))
    op.add_column('preventivo_settings', sa.Column('company_address', sa.String(255), nullable=False, server_default='Via Esempio 123, 00100 Roma'))
    op.add_column('preventivo_settings', sa.Column('company_email', sa.String(100), nullable=False, server_default='info@printlab3d.local'))
    op.add_column('preventivo_settings', sa.Column('company_phone', sa.String(50), nullable=False, server_default='+39 0123 456789'))


def downgrade():
    op.drop_column('preventivo_settings', 'company_phone')
    op.drop_column('preventivo_settings', 'company_email')
    op.drop_column('preventivo_settings', 'company_address')
    op.drop_column('preventivo_settings', 'company_name')
