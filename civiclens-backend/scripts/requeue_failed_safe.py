
import asyncio
import redis.asyncio as aioredis
from app.config import settings
import sys

# Windows console encoding fix
sys.stdout.reconfigure(encoding='utf-8')

async def requeue_failed():
    print("Connecting to Redis...")
    # Ensure we use 127.0.0.1 for Windows
    redis_url = settings.REDIS_URL.replace("localhost", "127.0.0.1")
    redis = await aioredis.from_url(redis_url, decode_responses=True)
    
    count = 0
    print("Checking 'queue:ai_failed' for failed reports...")
    
    while True:
        item = await redis.rpop("queue:ai_failed")
        if not item:
            break
        
        print(f"Re-queuing report: {item}")
        await redis.lpush("queue:ai_processing", item)
        count += 1
        
    print(f"Re-queued {count} reports.")
    await redis.close()

if __name__ == "__main__":
    try:
        asyncio.run(requeue_failed())
    except Exception as e:
        print(f"Error: {e}")
