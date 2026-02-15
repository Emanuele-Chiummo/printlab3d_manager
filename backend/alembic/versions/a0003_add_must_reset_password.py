"""
Add must_reset_password field to users
Revision ID: a0003
Revises: a0002
Create Date: 2026-02-13
"""
from alembic import op
import sqlalchemy as sa
revision = 'a0003'
down_revision = 'a0002'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('must_reset_password', sa.Boolean(), nullable=False, server_default='false'))

def downgrade():
    op.drop_column('users', 'must_reset_password')
