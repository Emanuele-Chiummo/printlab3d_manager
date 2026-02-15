"""add cascade delete to quotes

Revision ID: a0014
Revises: a0013
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a0014'
down_revision = 'a0013'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add CASCADE to quote_versions.quote_id
    op.drop_constraint('quote_versions_quote_id_fkey', 'quote_versions', type_='foreignkey')
    op.create_foreign_key(
        'quote_versions_quote_id_fkey',
        'quote_versions', 'quotes',
        ['quote_id'], ['id'],
        ondelete='CASCADE'
    )
    
    # Add CASCADE to quote_lines.quote_version_id
    op.drop_constraint('quote_lines_quote_version_id_fkey', 'quote_lines', type_='foreignkey')
    op.create_foreign_key(
        'quote_lines_quote_version_id_fkey',
        'quote_lines', 'quote_versions',
        ['quote_version_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    # Remove CASCADE from quote_lines.quote_version_id
    op.drop_constraint('quote_lines_quote_version_id_fkey', 'quote_lines', type_='foreignkey')
    op.create_foreign_key(
        'quote_lines_quote_version_id_fkey',
        'quote_lines', 'quote_versions',
        ['quote_version_id'], ['id']
    )
    
    # Remove CASCADE from quote_versions.quote_id
    op.drop_constraint('quote_versions_quote_id_fkey', 'quote_versions', type_='foreignkey')
    op.create_foreign_key(
        'quote_versions_quote_id_fkey',
        'quote_versions', 'quotes',
        ['quote_id'], ['id']
    )
