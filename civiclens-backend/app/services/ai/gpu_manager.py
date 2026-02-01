"""
GPU Manager - Intelligent GPU/CPU Device Management
Detects available GPUs and optimizes model loading for RTX 4060 and fallback to CPU
"""

import logging
import torch
import psutil
from typing import Optional, Dict, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class DeviceInfo:
    """Device information"""
    device_type: str  # "cuda", "cpu"
    device_name: str
    device_index: int
    memory_total_gb: float
    memory_available_gb: float
    is_available: bool
    compute_capability: Optional[Tuple[int, int]] = None


class GPUManager:
    """
    Intelligent GPU/CPU device management
    - Detects RTX 4060 and other GPUs
    - Falls back to CPU if GPU unavailable
    - Optimizes memory usage
    - Provides device recommendations
    """
    
    def __init__(self):
        self.device = None
        self.device_info = None
        self.use_gpu = False
        self.use_fp16 = False  # Mixed precision
        self.batch_size = 8
        self._initialize_device()
    
    def _initialize_device(self):
        """Initialize and detect available devices"""
        logger.info("Detecting available devices...")
        
        # Check CUDA availability
        cuda_available = torch.cuda.is_available()
        logger.info(f"CUDA available: {cuda_available}")
        
        if cuda_available:
            gpu_count = torch.cuda.device_count()
            logger.info(f"GPU count: {gpu_count}")
            
            for i in range(gpu_count):
                gpu_name = torch.cuda.get_device_name(i)
                logger.info(f"  GPU {i}: {gpu_name}")
            
            # Try to use GPU
            try:
                self.device = torch.device("cuda:0")
                self.use_gpu = True
                
                # Get GPU info
                gpu_name = torch.cuda.get_device_name(0)
                try:
                    total_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
                except:
                    total_memory = 0.0
                
                self.device_info = DeviceInfo(
                    device_type="cuda",
                    device_name=gpu_name,
                    device_index=0,
                    memory_total_gb=total_memory,
                    memory_available_gb=total_memory, # Approximation
                    is_available=True,
                    compute_capability=torch.cuda.get_device_capability(0)
                )
                
                logger.info(f"Using GPU: {gpu_name}")
                logger.info(f"   Total Memory: {total_memory:.2f} GB")
                
                # Check if RTX 4060 (supports FP16)
                if "4060" in gpu_name.upper() or "RTX" in gpu_name.upper():
                    self.use_fp16 = True
                    logger.info("   FP16 (Mixed Precision) enabled")
                
                # Optimize batch size based on GPU memory
                self.batch_size = self._calculate_batch_size(total_memory)
                logger.info(f"   Batch size: {self.batch_size}")
                
            except Exception as e:
                logger.warning(f"Failed to initialize GPU: {e}")
                self._fallback_to_cpu()
        else:
            logger.info("CUDA not available, using CPU")
            self._fallback_to_cpu()
    
    def _fallback_to_cpu(self):
        """Fallback to CPU"""
        self.device = torch.device("cpu")
        self.use_gpu = False
        self.use_fp16 = False
        
        # Get CPU info
        cpu_count = psutil.cpu_count()
        total_memory = psutil.virtual_memory().total / 1e9
        
        self.device_info = DeviceInfo(
            device_type="cpu",
            device_name=f"CPU ({cpu_count} cores)",
            device_index=-1,
            memory_total_gb=total_memory,
            memory_available_gb=psutil.virtual_memory().available / 1e9,
            is_available=True
        )
        
        logger.info(f"Using CPU: {cpu_count} cores")
        logger.info(f"   Total Memory: {total_memory:.2f} GB")
        
        # Conservative batch size for CPU
        self.batch_size = 2
        logger.info(f"   Batch size: {self.batch_size}")
    
    def _calculate_batch_size(self, gpu_memory_gb: float) -> int:
        """Calculate optimal batch size based on GPU memory"""
        # RTX 4060 has 8GB VRAM
        # Estimate: ~1.5GB per batch for sentence-transformers
        if gpu_memory_gb >= 8:
            return 32 # Increased for 4060
        elif gpu_memory_gb >= 6:
            return 16
        elif gpu_memory_gb >= 4:
            return 8
        else:
            return 4
    
    def get_device(self) -> torch.device:
        """Get torch device"""
        return self.device
    
    def get_device_info(self) -> DeviceInfo:
        """Get device information"""
        return self.device_info
    
    def should_use_gpu(self) -> bool:
        """Check if GPU should be used"""
        return self.use_gpu
    
    def should_use_fp16(self) -> bool:
        """Check if FP16 (mixed precision) should be used"""
        return self.use_fp16
    
    def get_batch_size(self) -> int:
        """Get optimal batch size"""
        return self.batch_size
    
    def get_device_index(self) -> int:
        """Get device index for transformers library (-1 for CPU, 0+ for GPU)"""
        return 0 if self.use_gpu else -1
    
    def get_model_kwargs(self) -> Dict:
        """Get kwargs for model initialization"""
        kwargs = {
            "device": self.device,
        }
        
        if self.use_gpu and self.use_fp16:
            kwargs["torch_dtype"] = torch.float16
        
        return kwargs
    
    def clear_cache(self):
        """Clear GPU cache if using GPU"""
        if self.use_gpu:
            torch.cuda.empty_cache()
            logger.info("GPU cache cleared")
    
    def get_memory_usage(self) -> Dict:
        """Get current memory usage"""
        usage = {
            "ram_used_gb": psutil.virtual_memory().used / 1e9,
            "ram_total_gb": psutil.virtual_memory().total / 1e9
        }
        
        if self.use_gpu:
            try:
                usage["gpu_allocated_gb"] = torch.cuda.memory_allocated(0) / 1e9
                usage["gpu_reserved_gb"] = torch.cuda.memory_reserved(0) / 1e9
            except:
                pass
                
        return usage