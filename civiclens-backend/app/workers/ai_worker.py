"""
AI Background Worker
Processes queue:ai_processing Redis queue
Runs AI pipeline on newly created reports
"""

import asyncio
import logging
import signal
import sys
import os

# Thread usage optimization (Allowing more CPU core usage as requested)
# os.environ["OMP_NUM_THREADS"] = "1"
# os.environ["MKL_NUM_THREADS"] = "1"
# os.environ["OPENBLAS_NUM_THREADS"] = "1"
# os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
# os.environ["NUMEXPR_NUM_THREADS"] = "1"

from datetime import datetime
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, get_redis

# Try to import AI pipeline, but handle gracefully if dependencies are missing
try:
    from app.services.ai_pipeline_service import AIProcessingPipeline
    AI_AVAILABLE = True
except (ImportError, ModuleNotFoundError) as e:
    AI_AVAILABLE = False
    AI_ERROR = str(e)

# Professional logging configuration for government application
# Use UTF-8 encoding for console and file handlers to support emojis on Windows
# Simplify console handler to ensure it works in all environments
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

file_handler = logging.FileHandler('logs/ai_worker.log', mode='a', encoding='utf-8')
file_handler.setLevel(logging.INFO)

formatter = logging.Formatter(
    '%(asctime)s | %(levelname)-8s | AI-ENGINE | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

# Force configuration to override any previous settings
logging.basicConfig(
    level=logging.INFO,
    handlers=[console_handler, file_handler],
    force=True
)
logger = logging.getLogger(__name__)

# Global flag for graceful shutdown
shutdown_requested = False

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    global shutdown_requested
    logger.info("[SYSTEM] Shutdown signal received, finishing current task...")
    shutdown_requested = True


async def process_ai_queue():
    """
    Main worker loop - processes AI queue continuously
    Production-ready features:
    - Graceful shutdown handling
    - Comprehensive metrics tracking
    - Heartbeat monitoring
    - Error recovery
    - Performance logging
    """
    global shutdown_requested
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Professional startup banner using configuration
    from app.config import settings
    logger.info("=" * 80)
    city_name = settings.CITY_CODE or "UNDEFINED CITY"
    app_name = settings.APP_NAME or "Platform"
    
    logger.info(f"  {app_name.upper()} AI ENGINE - {city_name} ZONE")
    logger.info("  Automated Report Classification & Assignment System")
    logger.info("  Version: 2.0.0 | Environment: Production")
    logger.info("  Process ID: %d", os.getpid())
    logger.info("=" * 80)
    
    # Metrics tracking
    metrics = {
        'total_processed': 0,
        'successful': 0,
        'failed': 0,
        'start_time': datetime.utcnow(),
        'last_report_time': None
    }
    
    try:
        redis = await get_redis()
        await redis.ping()
        logger.info("[SYSTEM] Redis message queue connected successfully")
    except Exception as e:
        logger.error(f"[SYSTEM] Redis connection failed: {str(e)}")
        logger.error("[SYSTEM] Please verify:")
        logger.error("[SYSTEM]   1. Redis service is running")
        logger.error("[SYSTEM]   2. REDIS_URL configuration is correct")
        logger.error("[SYSTEM]   3. Network connectivity is available")
        return
    
    # Initialize AI Pipeline ONCE (Global Warmup)
    logger.info("[SYSTEM] Initializing AI Pipeline (loading models)...")
    
    # Print comprehensive hardware detection
    try:
        import torch
        import psutil
        from app.services.ai.gpu_manager import GPUManager
        
        logger.info("[HARDWARE] ========== SYSTEM HARDWARE DETECTION ==========")
        
        # CPU Information
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        logger.info(f"[HARDWARE] CPU: {cpu_count} cores @ {cpu_freq.current:.1f} MHz")
        
        # Memory Information
        memory = psutil.virtual_memory()
        logger.info(f"[HARDWARE] RAM: {memory.total / 1e9:.2f} GB total, {memory.available / 1e9:.2f} GB available")
        
        # GPU Detection
        logger.info("[HARDWARE] GPU Detection:")
        cuda_available = torch.cuda.is_available()
        logger.info(f"[HARDWARE]   CUDA Available: {cuda_available}")
        
        if cuda_available:
            gpu_count = torch.cuda.device_count()
            logger.info(f"[HARDWARE]   GPU Count: {gpu_count}")
            
            for i in range(gpu_count):
                gpu_name = torch.cuda.get_device_name(i)
                try:
                    props = torch.cuda.get_device_properties(i)
                    total_memory = props.total_memory / 1e9
                    compute_cap = torch.cuda.get_device_capability(i)
                    logger.info(f"[HARDWARE]   GPU {i}: {gpu_name}")
                    logger.info(f"[HARDWARE]     - Memory: {total_memory:.2f} GB")
                    logger.info(f"[HARDWARE]     - Compute Capability: {compute_cap[0]}.{compute_cap[1]}")
                except Exception as e:
                    logger.info(f"[HARDWARE]   GPU {i}: {gpu_name} (info unavailable)")
        else:
            logger.info("[HARDWARE]   No CUDA-capable GPU detected, using CPU")
        
        # Initialize GPU Manager for device selection
        gpu_manager = GPUManager()
        device_info = gpu_manager.get_device_info()
        logger.info(f"[HARDWARE] Selected Device: {device_info.device_name}")
        logger.info(f"[HARDWARE] Device Type: {device_info.device_type.upper()}")
        logger.info(f"[HARDWARE] FP16 Support: {gpu_manager.should_use_fp16()}")
        logger.info(f"[HARDWARE] Batch Size: {gpu_manager.get_batch_size()}")
        logger.info("[HARDWARE] ================================================")
        
    except Exception as e:
        logger.warning(f"[HARDWARE] Could not detect hardware: {e}")
    
    try:
        pipeline = AIProcessingPipeline()
        await pipeline._warmup_models()
        logger.info("[SYSTEM] AI Pipeline initialized successfully")
    except Exception as e:
        logger.critical(f"[SYSTEM] Failed to initialize AI Pipeline: {e}")
        return

    logger.info("[SYSTEM] AI Engine initialized and ready")
    logger.info("[SYSTEM] Monitoring queue: ai_processing")
    logger.info("[SYSTEM] Awaiting reports for processing...")
    logger.info("[SYSTEM] Press Ctrl+C for graceful shutdown")
    logger.info("-" * 80)
    
    # Update startup metrics in Redis
    try:
        await redis.hset("ai_metrics:worker", mapping={
            "status": "running",
            "start_time": datetime.utcnow().isoformat(),
            "version": "2.0.0"
        })
    except Exception as e:
        logger.warning(f"Failed to set startup metrics: {e}")
    
    # Heartbeat for health checks
    async def update_heartbeat():
        while True:
            try:
                await redis.set(
                    "ai_worker:heartbeat",
                    datetime.utcnow().isoformat(),
                    ex=60  # Expire after 60 seconds
                )
                await asyncio.sleep(10)
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")
                await asyncio.sleep(10)
    
    # Start heartbeat task
    heartbeat_task = asyncio.create_task(update_heartbeat())
    
    try:
        while not shutdown_requested:
            try:
                # Check for shutdown before processing
                if shutdown_requested:
                    break
                
                # Blocking pop from queue (5 second timeout)
                result = await redis.brpop("queue:ai_processing", timeout=5)
                
                if result:
                    _, report_id_data = result
                    
                    # Handle both bytes and string (Redis can return either)
                    if isinstance(report_id_data, bytes):
                        report_id = int(report_id_data.decode())
                    else:
                        report_id = int(report_id_data)
                    
                    # Process in new database session
                    async with AsyncSessionLocal() as db:
                        
                        try:
                            # Get report number for professional logging
                            from app.models.report import Report
                            report_result = await db.execute(
                                select(Report.report_number).where(Report.id == report_id)
                            )
                            report_number = report_result.scalar() or f"ID-{report_id}"
                            
                            logger.info("")
                            logger.info(f"[PROCESSING] Report: {report_number} (ID: {report_id})")
                            logger.info(f"[PROCESSING] Timestamp: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
                            
                            # Use the pre-initialized pipeline
                            result = await pipeline.process_report(report_id, db)
                            
                            # Professional completion log
                            status_indicator = {
                                'classified': 'SUCCESS',
                                'assigned_to_department': 'SUCCESS',
                                'assigned_to_officer': 'SUCCESS',
                                'duplicate': 'WARNING',
                                'needs_review': 'REVIEW'
                            }.get(result['status'], 'SUCCESS')
                            
                            logger.info(f"[COMPLETE] [{status_indicator}] Report: {report_number} | Status: {result['status'].upper()}")
                            if result.get('overall_confidence'):
                                logger.info(f"[COMPLETE] Confidence: {result['overall_confidence']:.2%} | Processing Time: {result.get('processing_time_seconds', 0):.2f}s")
                            logger.info("-" * 80)
                            
                            # Update metrics
                            metrics['total_processed'] += 1
                            metrics['successful'] += 1
                            metrics['last_report_time'] = datetime.utcnow()
                            
                            # Log metrics to Redis
                            await redis.hincrby("ai_metrics:daily", result['status'], 1)
                            await redis.hset("ai_metrics:worker", mapping={
                                "total_processed": metrics['total_processed'],
                                "successful": metrics['successful'],
                                "failed": metrics['failed'],
                                "last_report_time": metrics['last_report_time'].isoformat()
                            })
                            
                        except Exception as e:
                            logger.error("")
                            logger.error(f"[ERROR] Report: {report_number} (ID: {report_id})")
                            logger.error(f"[ERROR] Failed to process: {str(e)}")
                            logger.error("[ERROR] Moving to failed queue for manual review")
                            logger.error("-" * 80)
                            
                            # Update failure metrics
                            metrics['total_processed'] += 1
                            metrics['failed'] += 1
                            
                            # Move to dead letter queue for manual investigation
                            await redis.lpush("queue:ai_failed", str(report_id))
                            await redis.hincrby("ai_metrics:daily", "failed", 1)
                            await redis.hset("ai_metrics:worker", "failed", metrics['failed'])
                
                # Small sleep to prevent CPU spinning
                await asyncio.sleep(0.1)
                
            except KeyboardInterrupt:
                shutdown_requested = True
                break
                
            except Exception as e:
                logger.error(f"[SYSTEM] Worker error: {str(e)}")
                logger.error("[SYSTEM] Retrying in 1 second...")
                await asyncio.sleep(1)  # Back off on error
    
    finally:
        heartbeat_task.cancel()
        
        # Calculate uptime and final metrics
        uptime = datetime.utcnow() - metrics['start_time']
        
        logger.info("")
        logger.info("[SYSTEM] AI Engine shutting down gracefully...")
        logger.info("-" * 80)
        logger.info("[METRICS] Final Statistics:")
        logger.info(f"[METRICS] Total Processed: {metrics['total_processed']} reports")
        logger.info(f"[METRICS] Successful: {metrics['successful']} ({metrics['successful']/max(metrics['total_processed'], 1)*100:.1f}%)")
        logger.info(f"[METRICS] Failed: {metrics['failed']} ({metrics['failed']/max(metrics['total_processed'], 1)*100:.1f}%)")
        logger.info(f"[METRICS] Uptime: {uptime}")
        if metrics['last_report_time']:
            logger.info(f"[METRICS] Last Report: {metrics['last_report_time'].isoformat()}")
        logger.info("-" * 80)
        
        # Update final status in Redis
        try:
            await redis.hset("ai_metrics:worker", mapping={
                "status": "stopped",
                "stop_time": datetime.utcnow().isoformat(),
                "final_total": metrics['total_processed'],
                "final_successful": metrics['successful'],
                "final_failed": metrics['failed']
            })
            # Remove heartbeat
            await redis.delete("ai_worker:heartbeat")
        except Exception as e:
            logger.warning(f"Failed to update final metrics: {e}")
        
        logger.info("[SYSTEM] AI Engine stopped cleanly")
        logger.info("=" * 80)


if __name__ == "__main__":
    # Check if AI dependencies are available
    if not AI_AVAILABLE:
        logger.error("=" * 80)
        logger.error(" AI WORKER CANNOT START - MISSING DEPENDENCIES")
        logger.error("=" * 80)
        logger.error(f"Error: {AI_ERROR}")
        logger.error("")
        logger.error("The AI worker requires additional dependencies.")
        logger.error("Install with: uv pip install -r requirements-ai.txt")
        logger.error("")
        logger.error("The system will continue to work without AI features:")
        logger.error(" + Reports can still be created and managed")
        logger.error(" + All core features work normally")
        logger.error(" - Automatic report classification will be disabled")
        logger.error("=" * 80)
        sys.exit(1)
    
    asyncio.run(process_ai_queue())
