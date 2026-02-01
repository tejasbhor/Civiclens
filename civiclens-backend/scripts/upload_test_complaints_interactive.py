#!/usr/bin/env python
"""
Interactive Test Complaints Upload Script
Updates:
- Only sends valid fields (title, description, lat, lng, address, severity)
- Ignores 'id' from JSON to prevent backend errors
- clearly indicates queuing success
"""

import asyncio
import json
import httpx
import sys
from typing import Optional, Dict, Any
from datetime import datetime

import os

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"
TEST_COMPLAINTS_FILE = os.path.join(os.path.dirname(__file__), "test_ai_complaints.json")

# Test user credentials
TEST_USER_PHONE = "+919326852646"
TEST_USER_PASSWORD = "Password@901"

class ComplaintsUploader:
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.user_id: Optional[int] = None
        self.client = httpx.AsyncClient(timeout=30.0)
        self.uploaded_count = 0
        self.failed_count = 0
        
    async def close(self):
        await self.client.aclose()
    
    async def login(self) -> bool:
        print("\n" + "="*60)
        print("STEP 1: AUTHENTICATION")
        print("="*60)
        try:
            response = await self.client.post(
                f"{self.base_url}/auth/login",
                json={
                    "phone": TEST_USER_PHONE,
                    "password": TEST_USER_PASSWORD,
                    "portal_type": "citizen"
                }
            )
            
            if response.status_code != 200:
                print(f"❌ Login failed: {response.status_code}")
                return False
            
            data = response.json()
            self.access_token = data.get("access_token")
            self.user_id = data.get("user_id")
            print(f"✅ Login successful! (User ID: {self.user_id})")
            return True
            
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    async def create_report(self, complaint: Dict[str, Any]) -> bool:
        try:
            # STRICT PAYLOAD CONSTRUCTION
            # We ONLY send what the API expects for creation.
            # We do NOT send 'id', 'reference_id', or 'expected_category'.
            report_data = {
                "title": complaint.get("title"),
                "description": complaint.get("description"),
                "latitude": complaint.get("latitude"),
                "longitude": complaint.get("longitude"),
                "address": complaint.get("address", ""),
                "severity": complaint.get("severity", "medium").lower()
            }
            
            # Optional: Send category if you want to test manual category override,
            # but usually for AI testing we leave it blank or let the backend handle it.
            # strict_schema usually doesn't require category for citizen upload.
            
            response = await self.client.post(
                f"{self.base_url}/reports/",
                json=report_data,
                headers=self.get_headers()
            )
            
            if response.status_code == 201:
                data = response.json()
                report_id = data.get("id")
                report_number = data.get("report_number")
                print(f"   ✅ [QUEUED] Report Created: ID {report_id} | {report_number}")
                return True
            else:
                print(f"   ❌ Failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    async def run(self):
        # Check backend first
        try:
            await self.client.get(f"{API_BASE_URL}/health")
            print("✅ Backend is online")
        except:
            print("❌ Backend is OFFLINE. Please start it first.")
            return

        if not await self.login():
            return

        # Load complaints
        try:
            with open(TEST_COMPLAINTS_FILE, 'r') as f:
                data = json.load(f)
                complaints = data.get("test_complaints", [])
        except Exception as e:
            print(f"❌ Could not read {TEST_COMPLAINTS_FILE}: {e}")
            return

        print("\n" + "="*60)
        print("STEP 2: UPLOAD & QUEUE TEST")
        print("="*60)
        print(f"Load {len(complaints)} complaints from file.")
        
        limit_input = input(f"How many to upload? (Enter 1-{len(complaints)}, or 'all'): ").strip()
        if limit_input.lower() == 'all':
            limit = len(complaints)
        else:
            try:
                limit = int(limit_input)
            except:
                limit = 1
        
        subset = complaints[:limit]
        
        print(f"\n🚀 Uploading {len(subset)} complaints...")
        print("ℹ️  NOTE: If Backend is running but AI Worker is OFF, these will be QUEUED.")
        print("-" * 60)

        for i, c in enumerate(subset, 1):
            ref_id = c.get("reference_id", i)
            title = c.get("title", "Unknown")
            print(f"[{i}] Uploading '{title}'...")
            
            if await self.create_report(c):
                self.uploaded_count += 1
            else:
                self.failed_count += 1
            
            await asyncio.sleep(0.5)
            
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)
        print(f"Successful (Queued): {self.uploaded_count}")
        print(f"Failed:              {self.failed_count}")
        print("-" * 60)
        print("NEXT STEPS:")
        print("1. If AI Worker is RUNNING: Check its logs to see valid processing.")
        print("2. If AI Worker is OFF:     Start it now to see it 'catch up' on these queued reports.")

async def main():
    uploader = ComplaintsUploader()
    try:
        await uploader.run()
    finally:
        await uploader.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
