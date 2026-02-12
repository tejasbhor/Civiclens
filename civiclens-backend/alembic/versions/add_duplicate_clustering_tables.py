"""Add duplicate clustering tables

Revision ID: add_duplicate_clustering
Revises: previous_revision
Create Date: 2026-02-11 01:05:00

Production-ready duplicate detection with proper clustering support
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_duplicate_clustering'
down_revision = '7a2751c30c52'
branch_labels = None
depends_on = None


def upgrade():
    # Create duplicate_clusters table
    op.create_table(
        'duplicate_clusters',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cluster_hash', sa.String(length=64), nullable=False),
        sa.Column('primary_report_id', sa.Integer(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('severity', sa.String(length=50), nullable=True),
        sa.Column('centroid_latitude', sa.Numeric(precision=10, scale=7), nullable=True),
        sa.Column('centroid_longitude', sa.Numeric(precision=10, scale=7), nullable=True),
        sa.Column('cluster_size', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('avg_similarity_score', sa.Numeric(precision=4, scale=3), nullable=True),
        sa.Column('confidence_score', sa.Numeric(precision=4, scale=3), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('reviewed_by_user_id', sa.Integer(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['primary_report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cluster_hash')
    )
    
    # Create indexes for duplicate_clusters
    op.create_index('idx_clusters_status', 'duplicate_clusters', ['status'])
    op.create_index('idx_clusters_category', 'duplicate_clusters', ['category'])
    op.create_index('idx_clusters_created', 'duplicate_clusters', ['created_at'])
    
    # Create cluster_members table
    op.create_table(
        'cluster_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cluster_id', sa.Integer(), nullable=False),
        sa.Column('report_id', sa.Integer(), nullable=False),
        sa.Column('similarity_score', sa.Numeric(precision=4, scale=3), nullable=True),
        sa.Column('distance_to_centroid_meters', sa.Integer(), nullable=True),
        sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('added_by', sa.String(length=50), nullable=False, server_default='AI'),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['cluster_id'], ['duplicate_clusters.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cluster_id', 'report_id', name='uq_cluster_report')
    )
    
    # Create indexes for cluster_members
    op.create_index('idx_members_cluster', 'cluster_members', ['cluster_id'])
    op.create_index('idx_members_report', 'cluster_members', ['report_id'])
    op.create_index('idx_members_primary', 'cluster_members', ['is_primary'])
    
    # Create report_embeddings table for fast similarity search
    op.create_table(
        'report_embeddings',
        sa.Column('report_id', sa.Integer(), nullable=False),
        sa.Column('embedding', postgresql.ARRAY(sa.Float()), nullable=False),
        sa.Column('embedding_dimension', sa.Integer(), nullable=False, server_default='384'),
        sa.Column('model_name', sa.String(length=100), nullable=False),
        sa.Column('model_version', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('report_id')
    )
    
    # Create index for embeddings
    op.create_index('idx_embeddings_model', 'report_embeddings', ['model_name', 'model_version'])
    
    # Create cluster_feedback table for active learning
    op.create_table(
        'cluster_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cluster_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('approved', sa.Boolean(), nullable=False),
        sa.Column('feedback_type', sa.String(length=50), nullable=False),  # 'false_positive', 'false_negative', 'correct'
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['cluster_id'], ['duplicate_clusters.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for cluster_feedback
    op.create_index('idx_feedback_cluster', 'cluster_feedback', ['cluster_id'])
    op.create_index('idx_feedback_type', 'cluster_feedback', ['feedback_type'])


def downgrade():
    op.drop_table('cluster_feedback')
    op.drop_table('report_embeddings')
    op.drop_table('cluster_members')
    op.drop_table('duplicate_clusters')
