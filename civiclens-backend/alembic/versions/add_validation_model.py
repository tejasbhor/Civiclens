"""Add validation model

Revision ID: add_validation_model
Revises: add_report_bookmarks
Create Date: 2025-05-18 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_validation_model'
down_revision = 'add_report_bookmarks'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create validations table
    op.create_table(
        'validations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('report_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('is_valid', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Indexes
    op.create_index('ix_validations_id', 'validations', ['id'], unique=False)
    op.create_index('ix_validations_report_id', 'validations', ['report_id'], unique=False)
    op.create_index('ix_validations_user_id', 'validations', ['user_id'], unique=False)
    op.create_index('idx_validation_report_user', 'validations', ['report_id', 'user_id'], unique=True)


def downgrade() -> None:
    op.drop_index('idx_validation_report_user', table_name='validations')
    op.drop_index('ix_validations_user_id', table_name='validations')
    op.drop_index('ix_validations_report_id', table_name='validations')
    op.drop_index('ix_validations_id', table_name='validations')
    op.drop_table('validations')
