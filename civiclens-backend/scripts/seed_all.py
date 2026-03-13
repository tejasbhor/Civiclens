#!/usr/bin/env python
"""Master seed script - runs all seeds in the correct order"""

import asyncio
import sys
import os
from pathlib import Path

# Add project root to sys.path to allow importing 'app'
root_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(root_dir))

async def main():
    print("\n" + "="*80)
    print("CIVICLENS - MASTER SEED SCRIPT")
    print("="*80)

    # Smart Check: Skip if database already has users
    try:
        from app.core.database import AsyncSessionLocal
        from sqlalchemy import text
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1 FROM users LIMIT 1"))
            if result.fetchone():
                print("\n✅ Database already contains data. Skipping seed process.")
                print("="*80 + "\n")
                return
    except Exception as e:
        print(f"⚠️  Could not verify database state ({e}). Proceeding carefully...")

    print("\nThis script will seed all initial data (Departments, Officers, Admin, AI User)...\n")
    
    try:
        # Ensure database tables exist
        from app.core.database import init_db
        print("🛠️  Initializing database tables...")
        await init_db()
        print("✅ Database initialization complete.\n")
        
        from app.db.seeds.seed_navimumbai_data import seed_navimumbai_data
        await seed_navimumbai_data()
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
