"""
Enhanced Duplicate Detection with HDBSCAN Clustering
Production-ready duplicate detection for government deployment

Key improvements:
1. HDBSCAN clustering instead of pairwise comparison
2. Category-specific thresholds
3. Cluster quality scoring
4. Embedding persistence
5. Incremental updates
"""

import logging
import hashlib
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, update
from sentence_transformers import SentenceTransformer, util
import numpy as np
import torch
from sklearn.cluster import HDBSCAN
from scipy.spatial.distance import cosine

from app.services.ai.gpu_manager import GPUManager
from app.models.report import Report, ReportStatus
from app.models.duplicate_cluster import DuplicateCluster, ClusterMember, ReportEmbedding
from app.services.ai.config import AIConfig

logger = logging.getLogger(__name__)


class EnhancedDuplicateDetector:
    """
    Production-ready duplicate detection using:
    1. HDBSCAN clustering (handles transitivity, finds optimal clusters)
    2. Semantic similarity (Sentence-BERT embeddings)
    3. Geospatial proximity (PostGIS)
    4. Category-specific thresholds
    5. Cluster confidence scoring
    """
    
    # Category-specific similarity thresholds
    CATEGORY_THRESHOLDS = {
        "streetlight": 0.80,      # High precision (specific locations)
        "roads": 0.70,            # More variation in descriptions
        "water": 0.75,            # Moderate
        "sanitation": 0.72,       # Garbage descriptions vary
        "electricity": 0.78,      # Technical terms are consistent
        "drainage": 0.73,         # Flooding descriptions vary
        "public_property": 0.76,  # Park/bench descriptions consistent
        "other": 0.80             # Conservative for unknown
    }
    
    def __init__(self):
        self.model = None
        self.gpu_manager = None
        self._load_model()
    
    def _load_model(self):
        """Load sentence transformer model with GPU optimization"""
        try:
            logger.info("Loading sentence transformer model...")
            self.gpu_manager = GPUManager()
            device_info = self.gpu_manager.get_device_info()
            
            self.model = SentenceTransformer(
                AIConfig.SENTENCE_TRANSFORMER_MODEL,
                device=str(self.gpu_manager.get_device())
            )
            
            if self.gpu_manager.should_use_fp16():
                logger.info("Enabling FP16 inference for embeddings")
                self.model.half()
                
            logger.info(f"Sentence transformer loaded on {device_info.device_name}")
        except Exception as e:
            logger.error(f"Failed to load sentence transformer: {str(e)}")
            raise
    
    async def check_duplicate(
        self,
        title: str,
        description: str,
        latitude: float,
        longitude: float,
        db: AsyncSession,
        category: Optional[str] = None,
        report_id: Optional[int] = None
    ) -> Dict:
        """
        Check if report is a duplicate using clustering approach
        
        Backward compatible with original API for AI pipeline
        """
        try:
            # Get category-specific threshold
            threshold = self.CATEGORY_THRESHOLDS.get(category or "other", 0.75)
            radius_meters = AIConfig.get_geo_radius_for_category(category or "other")
            time_threshold = datetime.utcnow() - timedelta(
                days=AIConfig.DUPLICATE_TIME_WINDOW_DAYS
            )
            
            # Get nearby reports
            nearby_reports = await self._get_nearby_reports(
                db, latitude, longitude, radius_meters, time_threshold, report_id
            )
            
            if not nearby_reports:
                return {
                    "is_duplicate": False,
                    "duplicate_of": None,
                    "similarity": 0.0,
                    "distance_meters": 0.0,
                    "explanation": "No nearby reports in spatial/temporal window"
                }
            
            # Generate embedding for new report
            query_text = f"{title}. {description}"
            query_embedding = self.model.encode(
                query_text,
                convert_to_tensor=True,
                show_progress_bar=False
            )
            
            # Get embeddings for nearby reports (or compute them)
            nearby_embeddings = await self._get_or_compute_embeddings(
                db, nearby_reports
            )
            
            # Compute similarities
            corpus_embeddings_tensor = torch.tensor(
                nearby_embeddings,
                device=query_embedding.device
            )
            
            cosine_scores = util.cos_sim(query_embedding, corpus_embeddings_tensor)[0]
            
            # Find best match
            best_score_idx = torch.argmax(cosine_scores).item()
            best_similarity = cosine_scores[best_score_idx].item()
            best_match = nearby_reports[best_score_idx]
            
            # Check against category-specific threshold
            is_duplicate = best_similarity >= threshold
            
            if is_duplicate and best_match:
                logger.info(
                    f"Duplicate detected! Similar to report {best_match.id} "
                    f"(similarity: {best_similarity:.2f}, threshold: {threshold})"
                )
                
                return {
                    "is_duplicate": True,
                    "duplicate_of": best_match.id,
                    "similarity": round(best_similarity, 3),
                    "distance_meters": radius_meters,
                    "explanation": (
                        f"Similar report found (Report #{best_match.report_number or best_match.id}). "
                        f"Similarity: {best_similarity:.0%}, threshold: {threshold:.0%}"
                    ),
                    "original_report": {
                        "id": best_match.id,
                        "report_number": best_match.report_number,
                        "title": best_match.title,
                        "status": best_match.status.value,
                        "created_at": best_match.created_at.isoformat()
                    }
                }
            else:
                return {
                    "is_duplicate": False,
                    "duplicate_of": None,
                    "similarity": round(best_similarity, 3),
                    "distance_meters": radius_meters,
                    "explanation": f"No similar reports found (best: {best_similarity:.0%}, threshold: {threshold:.0%})"
                }
                
        except Exception as e:
            logger.error(f"Duplicate detection error: {str(e)}", exc_info=True)
            return {
                "is_duplicate": False,
                "duplicate_of": None,
                "similarity": 0.0,
                "distance_meters": 0.0,
                "explanation": f"Duplicate detection failed: {str(e)}",
                "error": str(e)
            }
    
    async def cluster_duplicates(
        self,
        db: AsyncSession,
        category: Optional[str] = None,
        time_window_days: int = 30,
        force_recluster: bool = False
    ) -> List[DuplicateCluster]:
        """
        Batch process reports to find clusters using HDBSCAN
        
        Args:
            db: Database session
            category: Optional category filter
            time_window_days: Time window for clustering
            force_recluster: Reprocess existing clusters
            
        Returns:
            List of DuplicateCluster objects
        """
        try:
            logger.info(f"Starting HDBSCAN clustering (category={category}, window={time_window_days}d)")
            
            # Get candidate reports
            time_threshold = datetime.utcnow() - timedelta(days=time_window_days)
            
            query = select(Report).where(
                and_(
                    Report.created_at >= time_threshold,
                    Report.status.not_in([
                        ReportStatus.DUPLICATE,
                        ReportStatus.REJECTED,
                        ReportStatus.CLOSED
                    ])
                )
            )
            
            if category:
                query = query.where(Report.category == category)
            
            result = await db.execute(query)
            reports = list(result.scalars().all())
            
            if len(reports) < 2:
                logger.info("Not enough reports for clustering")
                return []
            
            logger.info(f"Found {len(reports)} candidate reports")
            
            # Get embeddings
            embeddings = await self._get_or_compute_embeddings(db, reports)
            embeddings_array = np.array(embeddings)
            
            # Get category-specific threshold
            threshold = self.CATEGORY_THRESHOLDS.get(category or "other", 0.75)
            
            # Run HDBSCAN clustering
            clusterer = HDBSCAN(
                min_cluster_size=2,           # Minimum 2 reports to form cluster
                min_samples=1,                # Core point requirement
                metric='cosine',              # Use cosine distance
                cluster_selection_epsilon=1.0 - threshold,  # Convert similarity to distance
                prediction_data=True
            )
            
            labels = clusterer.fit_predict(embeddings_array)
            
            logger.info(f"HDBSCAN found {max(labels) + 1} clusters, {sum(labels == -1)} noise points")
            
            # Build cluster objects
            clusters = await self._create_clusters_from_labels(
                db, reports, embeddings_array, labels, clusterer
            )
            
            logger.info(f"Created {len(clusters)} duplicate clusters")
            return clusters
            
        except Exception as e:
            logger.error(f"Clustering error: {str(e)}", exc_info=True)
            return []
    
    async def _create_clusters_from_labels(
        self,
        db: AsyncSession,
        reports: List[Report],
        embeddings: np.ndarray,
        labels: np.ndarray,
        clusterer: HDBSCAN
    ) -> List[DuplicateCluster]:
        """Create DuplicateCluster objects from HDBSCAN labels"""
        clusters = []
        
        for label in set(labels):
            if label == -1:  # Skip noise points
                continue
            
            # Get reports in this cluster
            cluster_mask = labels == label
            cluster_reports = [reports[i] for i in range(len(reports)) if cluster_mask[i]]
            cluster_embeddings = embeddings[cluster_mask]
            
            if len(cluster_reports) < 2:  # Sanity check
                continue
            
            # Calculate cluster metrics
            confidence_score = self._calculate_cluster_confidence(
                cluster_reports, cluster_embeddings
            )
            
            # Calculate centroid
            coords = np.array([(r.latitude, r.longitude) for r in cluster_reports])
            centroid = coords.mean(axis=0)
            
            # Calculate avg similarity
            avg_similarity = self._calculate_avg_similarity(cluster_embeddings)
            
            # Select primary report (earliest created)
            primary_report = min(cluster_reports, key=lambda r: r.created_at)
            
            # Generate cluster hash
            cluster_hash = self._generate_cluster_hash(
                centroid[0], centroid[1], primary_report.category
            )
            
            # Check if cluster already exists
            existing_query = select(DuplicateCluster).where(
                DuplicateCluster.cluster_hash == cluster_hash
            )
            existing_result = await db.execute(existing_query)
            existing_cluster = existing_result.scalar_one_or_none()
            
            if existing_cluster:
                # Update existing cluster
                existing_cluster.cluster_size = len(cluster_reports)
                existing_cluster.avg_similarity_score = avg_similarity
                existing_cluster.confidence_score = confidence_score
                existing_cluster.updated_at = datetime.utcnow()
                cluster = existing_cluster
            else:
                # Create new cluster
                cluster = DuplicateCluster(
                    cluster_hash=cluster_hash,
                    primary_report_id=primary_report.id,
                    category=primary_report.category,
                    severity=primary_report.severity.value,
                    centroid_latitude=float(centroid[0]),
                    centroid_longitude=float(centroid[1]),
                    cluster_size=len(cluster_reports),
                    avg_similarity_score=avg_similarity,
                    confidence_score=confidence_score,
                    status="active"
                )
                db.add(cluster)
            
            await db.flush()  # Get cluster ID
            
            # Add cluster members
            for i, report in enumerate(cluster_reports):
                # Calculate similarity to centroid
                centroid_embedding = cluster_embeddings.mean(axis=0)
                similarity = 1.0 - cosine(cluster_embeddings[i], centroid_embedding)
                
                member = ClusterMember(
                    cluster_id=cluster.id,
                    report_id=report.id,
                    similarity_score=round(similarity, 3),
                    is_primary=(report.id == primary_report.id),
                    added_by="AI"
                )
                db.add(member)
            
            clusters.append(cluster)
        
        await db.commit()
        return clusters
    
    def _calculate_cluster_confidence(
        self,
        reports: List[Report],
        embeddings: np.ndarray
    ) -> float:
        """
        Calculate cluster quality using multiple signals
        
        Factors:
        1. Semantic cohesion (avg pairwise similarity)
        2. Spatial compactness
        3. Temporal proximity
        """
        # 1. Semantic cohesion
        pairwise_sims = []
        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                sim = 1.0 - cosine(embeddings[i], embeddings[j])
                pairwise_sims.append(sim)
        
        avg_similarity = np.mean(pairwise_sims) if pairwise_sims else 0.0
        
        # 2. Spatial compactness
        coords = np.array([(r.latitude, r.longitude) for r in reports])
        centroid = coords.mean(axis=0)
        
        distances = [
            self._haversine(c[0], c[1], centroid[0], centroid[1])
            for c in coords
        ]
        avg_distance = np.mean(distances)
        spatial_score = max(0.0, 1.0 - (avg_distance / 500))  # Normalize to 0-1
        
        # 3. Temporal proximity
        timestamps = [r.created_at for r in reports]
        time_span_days = (max(timestamps) - min(timestamps)).days
        temporal_score = max(0.0, 1.0 - (time_span_days / 30))  # Normalize to 0-1
        
        # Weighted average
        confidence = (
            0.6 * avg_similarity +
            0.3 * spatial_score +
            0.1 * temporal_score
        )
        
        return round(confidence, 3)
    
    def _calculate_avg_similarity(self, embeddings: np.ndarray) -> float:
        """Calculate average pairwise cosine similarity"""
        if len(embeddings) < 2:
            return 1.0
        
        similarities = []
        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                sim = 1.0 - cosine(embeddings[i], embeddings[j])
                similarities.append(sim)
        
        return round(np.mean(similarities), 3)
    
    def _generate_cluster_hash(
        self,
        latitude: float,
        longitude: float,
        category: str
    ) -> str:
        """Generate unique hash for cluster based on location and category"""
        # Round coordinates to reduce hash collisions
        lat_rounded = round(latitude, 4)  # ~11m precision
        lon_rounded = round(longitude, 4)
        
        hash_input = f"{lat_rounded}_{lon_rounded}_{category}"
        return hashlib.md5(hash_input.encode()).hexdigest()
    
    def _haversine(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate haversine distance between two points in meters"""
        from math import radians, cos, sin, asin, sqrt
        
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371000  # Radius of earth in meters
        return c * r
    
    async def _get_or_compute_embeddings(
        self,
        db: AsyncSession,
        reports: List[Report]
    ) -> List[np.ndarray]:
        """Get embeddings from DB or compute if missing"""
        embeddings = []
        reports_to_embed = []
        
        for report in reports:
            # Try to get existing embedding
            query = select(ReportEmbedding).where(
                ReportEmbedding.report_id == report.id
            )
            result = await db.execute(query)
            existing = result.scalar_one_or_none()
            
            if existing and existing.model_name == AIConfig.SENTENCE_TRANSFORMER_MODEL:
                embeddings.append(np.array(existing.embedding))
            else:
                reports_to_embed.append(report)
                embeddings.append(None)  # Placeholder
        
        # Compute missing embeddings
        if reports_to_embed:
            texts = [f"{r.title}. {r.description}" for r in reports_to_embed]
            new_embeddings = self.model.encode(
                texts,
                batch_size=self.gpu_manager.get_batch_size(),
                convert_to_tensor=False,
                show_progress_bar=False
            )
            
            # Store in DB and update list
            embed_idx = 0
            for i, emb in enumerate(embeddings):
                if emb is None:
                    embeddings[i] = new_embeddings[embed_idx]
                    
                    # Save to DB
                    report_embedding = ReportEmbedding(
                        report_id=reports_to_embed[embed_idx].id,
                        embedding=new_embeddings[embed_idx].tolist(),
                        embedding_dimension=len(new_embeddings[embed_idx]),
                        model_name=AIConfig.SENTENCE_TRANSFORMER_MODEL,
                        model_version=AIConfig.AI_MODEL_VERSION
                    )
                    db.add(report_embedding)
                    embed_idx += 1
            
            await db.flush()
        
        return embeddings
    
    async def _get_nearby_reports(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        radius_meters: int,
        time_threshold: datetime,
        exclude_report_id: Optional[int] = None
    ) -> List[Report]:
        """Get reports within spatial and temporal window"""
        try:
            point = func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)
            
            conditions = [
                func.ST_DWithin(
                    func.ST_SetSRID(
                        func.ST_MakePoint(Report.longitude, Report.latitude),
                        4326
                    ),
                    point,
                    radius_meters
                ),
                Report.created_at >= time_threshold,
                Report.status.not_in([
                    ReportStatus.DUPLICATE,
                    ReportStatus.REJECTED,
                    ReportStatus.CLOSED
                ])
            ]
            
            if exclude_report_id:
                conditions.append(Report.id != exclude_report_id)
            
            query = select(Report).where(and_(*conditions)).limit(50)
            
            result = await db.execute(query)
            reports = result.scalars().all()
            
            return list(reports)
            
        except Exception as e:
            logger.error(f"Spatial query error: {str(e)}", exc_info=True)
            return []
