"""Add report bookmarks table

Revision ID: add_report_bookmarks
Revises: add_duplicate_clustering
Create Date: 2026-03-01 12:00:00

Adds a report_bookmarks table for many-to-many relationship between users and reports.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_report_bookmarks'
down_revision = 'add_duplicate_clustering'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create report_bookmarks table
    op.create_table(
        'report_bookmarks',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('report_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'report_id')
    )

    # Create index for faster lookups
    op.create_index('ix_report_bookmarks_user_id', 'report_bookmarks', ['user_id'], unique=False)
    op.create_index('ix_report_bookmarks_report_id', 'report_bookmarks', ['report_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_report_bookmarks_report_id', table_name='report_bookmarks')
    op.drop_index('ix_report_bookmarks_user_id', table_name='report_bookmarks')
    op.drop_table('report_bookmarks')
