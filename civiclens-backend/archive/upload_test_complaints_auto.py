#!/usr/bin/env python
"""
Automated Test Complaints Upload Script
Uploads all test complaints automatically without user interaction
"""

import asyncio
import json
import httpx
import sys
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"
TEST_COMPLAINTS_FILE = "test_ai_complaints.json"

# Test user credentials
TEST_USER_PHONE = "+919326852646"
TEST_USER_PASSWORD = "Password@901"

# Upload settings
UPLOAD_LIMIT = None  # None = all, or set to number like 10
DELAY_BETWEEN_UPLOADS = 0.5  # seconds

class ComplaintsUploader:
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.user_id: Optional[int] = None
        self.client = httpx.AsyncClient(timeout=30.0)
        self.uploaded_count = 0
        self.failed_count = 0
        self.skipped_count = 0
        self.uploaded_reports = []
        
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
    
    async def login(self) -> bool:
        """Login to the system and get access token"""
        print("🔐 Authenticating...")
        
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
                print(f"   {response.text}")
                return False
            
            data = response.json()
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token")
            self.user_id = data.get("user_id")
            
            if not self.access_token:
                print("❌ No access token in response")
                return False
            
            print(f"✅ Authenticated as user {self.user_id}")
            return True
            
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def get_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    async def create_report(self, complaint: Dict[str, Any]) -> Optional[int]:
        """Create a report from complaint data"""
        try:
            # Prepare report data
            report_data = {
                "title": complaint.get("title", ""),
                "description": complaint.get("description", ""),
                "latitude": complaint.get("latitude", 19.0760),
                "longitude": complaint.get("longitude", 72.8777),
                "address": complaint.get("address", ""),
                "ward_number": complaint.get("ward_number", ""),
                "pincode": complaint.get("pincode", ""),
                "landmark": complaint.get("landmark", ""),
                "severity": complaint.get("expected_severity", "medium").lower(),
                "category": complaint.get("expected_category", "other").lower(),
            }
            
            # Validate required fields
            if not report_data["title"] or not report_data["description"]:
                return None
            
            # Create report
            response = await self.client.post(
                f"{self.base_url}/reports/",
                json=report_data,
                headers=self.get_headers()
            )
            
            if response.status_code == 201:
                data = response.json()
                return data.get("id")
            else:
                return None
                
        except Exception as e:
            print(f"   Error: {e}")
            return None
    
    async def upload_complaint(self, complaint: Dict[str, Any], index: int) -> bool:
        """Upload a single complaint"""
        complaint_id = complaint.get("id", index)
        title = complaint.get("title", "Unknown")[:50]
        
        print(f"  [{index:2d}] {title}...", end=" ", flush=True)
        
        # Create report
        report_id = await self.create_report(complaint)
        
        if report_id:
            self.uploaded_count += 1
            self.uploaded_reports.append({
                "complaint_id": complaint_id,
                "report_id": report_id,
                "title": complaint.get("title", "")
            })
            print("✅")
            return True
        else:
            self.failed_count += 1
            print("❌")
            return False
    
    async def upload_all_complaints(self, limit: Optional[int] = None) -> None:
        """Upload all test complaints"""
        # Load test complaints
        try:
            with open(TEST_COMPLAINTS_FILE, 'r') as f:
                data = json.load(f)
                complaints = data.get("test_complaints", [])
        except FileNotFoundError:
            print(f"❌ File not found: {TEST_COMPLAINTS_FILE}")
            return
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON in {TEST_COMPLAINTS_FILE}")
            return
        
        if not complaints:
            print("❌ No complaints found in test file")
            return
        
        # Limit complaints if specified
        if limit:
            complaints = complaints[:limit]
        
        print(f"\n📤 Uploading {len(complaints)} complaints...\n")
        
        # Upload each complaint
        for index, complaint in enumerate(complaints, 1):
            await self.upload_complaint(complaint, index)
            
            # Add delay between uploads
            if index < len(complaints):
                await asyncio.sleep(DELAY_BETWEEN_UPLOADS)
        
        # Print summary
        print("\n" + "="*80)
        print("UPLOAD COMPLETE")
        print("="*80)
        print(f"✅ Uploaded: {self.uploaded_count}")
        print(f"❌ Failed: {self.failed_count}")
        print(f"📊 Total: {len(complaints)}")
        print(f"⏱️  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)
        
        # Print uploaded reports
        if self.uploaded_reports:
            print("\n📋 Uploaded Reports:")
            for report in self.uploaded_reports[:10]:  # Show first 10
                print(f"   - Report #{report['report_id']}: {report['title'][:50]}")
            if len(self.uploaded_reports) > 10:
                print(f"   ... and {len(self.uploaded_reports) - 10} more")


async def main():
    """Main entry point"""
    print("\n" + "="*80)
    print("CIVICLENS - AUTOMATED COMPLAINTS UPLOADER")
    print("="*80)
    print(f"API: {API_BASE_URL}")
    print(f"User: {TEST_USER_PHONE}")
    print(f"Limit: {UPLOAD_LIMIT or 'All'}")
    print()
    
    # Check if backend is running
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Try multiple health check endpoints
            health_endpoints = [
                f"{API_BASE_URL}/health",
                f"http://localhost:8000/health",
                f"http://localhost:8000/api/v1/health",
            ]
            
            backend_ok = False
            for endpoint in health_endpoints:
                try:
                    response = await client.get(endpoint)
                    if response.status_code == 200:
                        backend_ok = True
                        break
                except:
                    continue
            
            if not backend_ok:
                # Try a simple auth endpoint to verify backend is responding
                try:
                    response = await client.post(
                        f"{API_BASE_URL}/auth/login",
                        json={"phone": "test", "password": "test", "portal_type": "citizen"},
                        timeout=5.0
                    )
                    # 422 or 401 means backend is responding
                    if response.status_code in [401, 422]:
                        backend_ok = True
                except:
                    pass
            
            if not backend_ok:
                print("❌ Backend is not responding")
                print(f"   Make sure backend is running at http://localhost:8000")
                return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        print(f"   Make sure backend is running at http://localhost:8000")
        return
    
    print("✅ Backend is online\n")
    
    # Create uploader
    uploader = ComplaintsUploader()
    
    try:
        # Login
        if not await uploader.login():
            print("❌ Authentication failed")
            return
        
        # Upload complaints
        await uploader.upload_all_complaints(limit=UPLOAD_LIMIT)
        
    finally:
        await uploader.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Upload interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
