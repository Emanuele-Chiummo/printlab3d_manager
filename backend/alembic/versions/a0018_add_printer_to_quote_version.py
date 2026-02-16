"""add printer to quote version

Revision ID: a0018_add_printer_to_quote_version
Revises: a0017
Create Date: 2026-02-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a0018'
down_revision = 'a0017'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('quote_versions', sa.Column('printer_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_quote_versions_printer_id', 'quote_versions', 'printers', ['printer_id'], ['id'])


def downgrade():
    op.drop_constraint('fk_quote_versions_printer_id', 'quote_versions', type_='foreignkey')
    op.drop_column('quote_versions', 'printer_id')
