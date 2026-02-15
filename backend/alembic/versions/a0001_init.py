
"""init
Revision ID: a0001
Revises: 
Create Date: 2026-02-13
"""
from alembic import op
import sqlalchemy as sa
revision = 'a0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        # use varchar instead of postgres enum; values are validated in
        # application code.
        sa.Column("role", sa.String(length=20), nullable=False, server_default="VIEWER"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # locations
    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(length=120), nullable=False),
        sa.Column("tipo", sa.String(length=30), nullable=False, server_default="SLOT"),
        sa.Column("parent_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=True),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("parent_id","nome", name="uq_location_parent_nome"),
    )

    # filaments
    op.create_table(
        "filaments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("materiale", sa.String(length=50), nullable=False),
        sa.Column("marca", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("colore", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("diametro_mm", sa.Numeric(4,2), nullable=False, server_default="1.75"),
        sa.Column("peso_nominale_g", sa.Integer(), nullable=False, server_default="1000"),
        sa.Column("costo_spool_eur", sa.Numeric(10,2), nullable=False, server_default="0"),
        sa.Column("note", sa.Text(), nullable=False, server_default=""),
        sa.Column("peso_residuo_g", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("soglia_min_g", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("ubicazione_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=True),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # inventory movements
    op.create_table(
        "inventory_movements",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tipo", sa.Enum("CARICO","SCARICO","TRASFERIMENTO","RETTIFICA", name="movementtype"), nullable=False),
        sa.Column("filament_id", sa.Integer(), sa.ForeignKey("filaments.id"), nullable=False),
        sa.Column("delta_peso_g", sa.Integer(), nullable=False),
        sa.Column("from_location_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=True),
        sa.Column("to_location_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=True),
        sa.Column("note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # customers
    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("ragione_sociale", sa.String(length=255), nullable=False),
        sa.Column("piva", sa.String(length=30), nullable=False, server_default=""),
        sa.Column("email", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("telefono", sa.String(length=50), nullable=False, server_default=""),
        sa.Column("indirizzo", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_customers_ragione_sociale", "customers", ["ragione_sociale"], unique=False)

    # quotes
    op.create_table(
        "quotes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("codice", sa.String(length=30), nullable=False),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_quotes_codice", "quotes", ["codice"], unique=True)

    # quote_versions
    op.create_table(
        "quote_versions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("quote_id", sa.Integer(), sa.ForeignKey("quotes.id"), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", sa.Enum("BOZZA","INVIATO","ACCETTATO","RIFIUTATO", name="quotestatus"), nullable=False, server_default="BOZZA"),
        sa.Column("costo_macchina_eur_h", sa.Numeric(10,2), nullable=False, server_default="5.0"),
        sa.Column("costo_manodopera_eur_h", sa.Numeric(10,2), nullable=False, server_default="15.0"),
        sa.Column("overhead_pct", sa.Numeric(5,2), nullable=False, server_default="10.0"),
        sa.Column("margine_pct", sa.Numeric(5,2), nullable=False, server_default="20.0"),
        sa.Column("sconto_eur", sa.Numeric(10,2), nullable=False, server_default="0.0"),
        sa.Column("iva_pct", sa.Numeric(5,2), nullable=False, server_default="22.0"),
        sa.Column("totale_imponibile_eur", sa.Numeric(12,2), nullable=False, server_default="0.0"),
        sa.Column("totale_iva_eur", sa.Numeric(12,2), nullable=False, server_default="0.0"),
        sa.Column("totale_lordo_eur", sa.Numeric(12,2), nullable=False, server_default="0.0"),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # quote_lines
    op.create_table(
        "quote_lines",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("quote_version_id", sa.Integer(), sa.ForeignKey("quote_versions.id"), nullable=False),
        sa.Column("descrizione", sa.String(length=255), nullable=False),
        sa.Column("filament_id", sa.Integer(), sa.ForeignKey("filaments.id"), nullable=True),
        sa.Column("peso_materiale_g", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("costo_materiale_eur", sa.Numeric(10,2), nullable=False, server_default="0.0"),
        sa.Column("tempo_stimato_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("costo_macchina_eur", sa.Numeric(10,2), nullable=False, server_default="0.0"),
        sa.Column("costo_manodopera_eur", sa.Numeric(10,2), nullable=False, server_default="0.0"),
        sa.Column("totale_riga_eur", sa.Numeric(10,2), nullable=False, server_default="0.0"),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # jobs
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("quote_version_id", sa.Integer(), sa.ForeignKey("quote_versions.id"), nullable=False),
        # switch to varchar instead of Postgres enum to keep behaviour
        # consistent with how we treat user.role.  The enum values are still
        # defined in Python and the seed code writes the appropriate
        # uppercase string.
        sa.Column("status", sa.String(length=20), nullable=False, server_default="PIANIFICATO"),
        sa.Column("tempo_reale_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("energia_kwh", sa.Numeric(10,3), nullable=False, server_default="0"),
        sa.Column("scarti_g", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("note", sa.Text(), nullable=False, server_default=""),
        sa.Column("costo_finale_eur", sa.Numeric(12,2), nullable=False, server_default="0.0"),
        sa.Column("margine_eur", sa.Numeric(12,2), nullable=False, server_default="0.0"),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # job_consumptions
    op.create_table(
        "job_consumptions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("job_id", sa.Integer(), sa.ForeignKey("jobs.id"), nullable=False),
        sa.Column("filament_id", sa.Integer(), sa.ForeignKey("filaments.id"), nullable=False),
        sa.Column("peso_g", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # cost categories
    op.create_table(
        "cost_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(length=120), nullable=False),
        sa.Column("descrizione", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_unique_constraint("uq_cost_categories_nome", "cost_categories", ["nome"])

    # cost entries
    op.create_table(
        "cost_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("categoria_id", sa.Integer(), sa.ForeignKey("cost_categories.id"), nullable=False),
        sa.Column("importo_eur", sa.Numeric(12,2), nullable=False),
        sa.Column("periodo_yyyymm", sa.String(length=7), nullable=False),
        sa.Column("job_id", sa.Integer(), sa.ForeignKey("jobs.id"), nullable=True),
        sa.Column("note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # audit logs
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("actor_user_id", sa.Integer(), nullable=True),
        sa.Column("entity", sa.String(length=100), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("details", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("cost_entries")
    op.drop_table("cost_categories")
    op.drop_table("job_consumptions")
    op.drop_table("jobs")
    op.drop_table("quote_lines")
    op.drop_table("quote_versions")
    op.drop_index("ix_quotes_codice", table_name="quotes")
    op.drop_table("quotes")
    op.drop_index("ix_customers_ragione_sociale", table_name="customers")
    op.drop_table("customers")
    op.drop_table("inventory_movements")
    op.drop_table("filaments")
    op.drop_table("locations")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    # Enums
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS movementtype")
    op.execute("DROP TYPE IF EXISTS quotestatus")
    # enum type for jobstatus is no longer needed (we used varchar above)
    # op.execute("DROP TYPE IF EXISTS jobstatus")
