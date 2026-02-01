#!/usr/bin/env python
"""Master seed script - runs all seeds in the correct order"""

import asyncio
import sys
from pathlib import Path

async def run_seed(module_name: str, description: str):
    """Run a seed module"""
    print(f"\n{'='*80}")
    print(f"Running: {description}")
    print(f"{'='*80}")
    
    try:
        if module_name == "navimumbai_departments":
            from app.db.seeds.navimumbai_departments import seed_departments
            await seed_departments()
        elif module_name == "create_ai_system_user":
            from app.db.seeds.create_ai_system_user import create_ai_system_user
            await create_ai_system_user()
        elif module_name == "seed_navimumbai_data":
            from app.db.seeds.seed_navimumbai_data import seed_navimumbai_data
            await seed_navimumbai_data()
        else:
            print(f"❌ Unknown seed module: {module_name}")
            return False
        
        print(f"✅ {description} completed successfully")
        return True
    except Exception as e:
        print(f"❌ Error in {description}: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("\n" + "="*80)
    print("CIVICLENS - MASTER SEED SCRIPT")
    print("="*80)
    print("\nThis script will seed all initial data in the correct order:\n")
    
    seeds = [
        ("navimumbai_departments", "1. Seeding Departments"),
        ("create_ai_system_user", "2. Creating AI System User"),
        ("seed_navimumbai_data", "3. Seeding Navi Mumbai Data (Super Admin, Officers, etc.)"),
    ]
    
    results = []
    for module_name, description in seeds:
        success = await run_seed(module_name, description)
        results.append((description, success))
    
    # Summary
    print(f"\n{'='*80}")
    print("SEEDING SUMMARY")
    print(f"{'='*80}\n")
    
    all_success = True
    for description, success in results:
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{status}: {description}")
        if not success:
            all_success = False
    
    print(f"\n{'='*80}")
    if all_success:
        print("✅ ALL SEEDS COMPLETED SUCCESSFULLY!")
        print("\nYou can now:")
        print("  1. Start the backend: uv run uvicorn app.main:app --reload")
        print("  2. Check users: uv run python check_users.py")
        print("  3. Login to admin: http://localhost:3001")
    else:
        print("❌ SOME SEEDS FAILED - Check errors above")
        sys.exit(1)
    
    print(f"{'='*80}\n")

if __name__ == "__main__":
    asyncio.run(main())
