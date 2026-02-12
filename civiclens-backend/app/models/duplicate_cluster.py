"""
Duplicate Clustering Models
Production-ready duplicate detection with proper clustering
"""
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
from app.models.base import BaseModel


class DuplicateCluster(BaseModel):
    """
    Represents a cluster of duplicate reports
    
    Uses HDBSCAN clustering algorithm to group similar reports
    Stores cluster-level metadata and quality metrics
    """
    __tablename__ = "duplicate_clusters"
    
    cluster_hash = Column(String(64), unique=True, nullable=False, index=True)
    primary_report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=True)
    
    # Cluster metadata
    category = Column(String(100), nullable=True, index=True)
    severity = Column(String(50), nullable=True)
    centroid_latitude = Column(Numeric(precision=10, scale=7), nullable=True)
    centroid_longitude = Column(Numeric(precision=10, scale=7), nullable=True)
    
    # Cluster quality metrics
    cluster_size = Column(Integer, nullable=False, default=1)
    avg_similarity_score = Column(Numeric(precision=4, scale=3), nullable=True)
    confidence_score = Column(Numeric(precision=4, scale=3), nullable=True)
    
    # Cluster status
    status = Column(String(50), nullable=False, default="active", index=True)  # active, merged, false_positive, archived
    
    # Review tracking
    reviewed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    review_notes = Column(Text, nullable=True)
    
    # Relationships
    primary_report = relationship("Report", foreign_keys=[primary_report_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_user_id])
    members = relationship("ClusterMember", back_populates="cluster", cascade="all, delete-orphan")
    feedback = relationship("ClusterFeedback", back_populates="cluster", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_clusters_status', 'status'),
        Index('idx_clusters_category', 'category'),
        Index('idx_clusters_created', 'created_at'),
    )
    
    def __repr__(self):
        return f"<DuplicateCluster(id={self.id}, size={self.cluster_size}, confidence={self.confidence_score})>"


class ClusterMember(BaseModel):
    """
    M:N relationship between clusters and reports
    Stores similarity scores and metadata for each cluster membership
    """
    __tablename__ = "cluster_members"
    
    cluster_id = Column(Integer, ForeignKey("duplicate_clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Membership metadata
    similarity_score = Column(Numeric(precision=4, scale=3), nullable=True)
    distance_to_centroid_meters = Column(Integer, nullable=True)
    added_by = Column(String(50), nullable=False, default="AI")  # 'AI' or 'admin' or user_id
    is_primary = Column(Boolean, nullable=False, default=False, index=True)
    
    # Relationships
    cluster = relationship("DuplicateCluster", back_populates="members")
    report = relationship("Report")
    
    __table_args__ = (
        Index('idx_members_cluster', 'cluster_id'),
        Index('idx_members_report', 'report_id'),
        Index('idx_members_primary', 'is_primary'),
        Index('uq_cluster_report', 'cluster_id', 'report_id', unique=True),
    )
    
    def __repr__(self):
        return f"<ClusterMember(cluster={self.cluster_id}, report={self.report_id}, similarity={self.similarity_score})>"


class ReportEmbedding(BaseModel):
    """
    Stores pre-computed embeddings for fast similarity search
    Supports incremental updates and version tracking
    """
    __tablename__ = "report_embeddings"
    
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), primary_key=True)
    
    # Embedding vector (384 dimensions for all-MiniLM-L6-v2)
    embedding = Column(ARRAY(sa.Float), nullable=False)
    embedding_dimension = Column(Integer, nullable=False, default=384)
    
    # Model tracking
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    
    # Relationships
    report = relationship("Report")
    
    __table_args__ = (
        Index('idx_embeddings_model', 'model_name', 'model_version'),
    )
    
    def __repr__(self):
        return f"<ReportEmbedding(report_id={self.report_id}, model={self.model_name})>"


class ClusterFeedback(BaseModel):
    """
    Stores human feedback on cluster quality for active learning
    Enables continuous improvement of clustering thresholds
    """
    __tablename__ = "cluster_feedback"
    
    cluster_id = Column(Integer, ForeignKey("duplicate_clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Feedback
    approved = Column(Boolean, nullable=False)
    feedback_type = Column(String(50), nullable=False, index=True)  # 'false_positive', 'false_negative', 'correct'
    notes = Column(Text, nullable=True)
    
    # Relationships
    cluster = relationship("DuplicateCluster", back_populates="feedback")
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_feedback_cluster', 'cluster_id'),
        Index('idx_feedback_type', 'feedback_type'),
    )
    
    def __repr__(self):
        return f"<ClusterFeedback(cluster={self.cluster_id}, type={self.feedback_type}, approved={self.approved})>"


# Import sqlalchemy here to avoid circular imports at module level
import sqlalchemy as sa
