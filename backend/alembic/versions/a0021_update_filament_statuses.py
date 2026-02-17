"""update filament statuses to include NUOVO and rename IN_USO to IN_USO_AMS

Revision ID: a0021
Revises: a0020
Create Date: 2026-02-17
"""
from alembic import op
import sqlalchemy as sa


revision = 'a0021'
down_revision = 'a0020'
branch_labels = None
depends_on = None


def upgrade():
    # Update any existing IN_USO values to IN_USO_AMS
    op.execute(
        sa.text(
            "UPDATE filaments SET stato = 'IN_USO_AMS' WHERE stato = 'IN_USO'"
        )
    )


def downgrade():
    # Revert IN_USO_AMS back to IN_USO
    op.execute(
        sa.text(
            "UPDATE filaments SET stato = 'IN_USO' WHERE stato = 'IN_USO_AMS'"
        )
    )
