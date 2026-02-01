# 📤 Test Complaints Upload Guide

This guide explains how to upload test complaints to CivicLens using the provided scripts.

---

## 📋 Overview

Two scripts are provided for uploading test complaints:

1. **Interactive Script** (`upload_test_complaints_interactive.py`)
   - User-friendly with menu options
   - Choose how many complaints to upload
   - Best for manual testing and exploration

2. **Automated Script** (`upload_test_complaints_auto.py`)
   - Uploads all complaints automatically
   - No user interaction required
   - Best for CI/CD pipelines and batch processing

---

## 🔧 Prerequisites

### 1. Backend Running
Make sure the backend is running:
```powershell
cd D:\Civiclens\civiclens-backend
& D:\Civiclens\.venv\Scripts\Activate.ps1
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Test User Account
The scripts use this test user:
- **Phone**: +919326852646
- **Password**: Password@901

Make sure this user exists in the database. If not, create it:
```powershell
# Run the seed script
uv run python seed_all.py
```

### 3. Test Complaints File
The scripts read from `test_ai_complaints.json` which contains 35 test complaints.

---

## 🚀 Quick Start

### Option 1: Interactive Upload (Recommended for Testing)

```powershell
cd D:\Civiclens\civiclens-backend
& D:\Civiclens\.venv\Scripts\Activate.ps1
uv run python upload_test_complaints_interactive.py
```

**What happens**:
1. Authenticates with the test user
2. Shows a menu with upload options
3. You choose how many complaints to upload
4. Uploads them one by one
5. Shows summary with results

**Menu Options**:
```
1. Upload all complaints (35 total)
2. Upload first 5 complaints
3. Upload first 10 complaints
4. Upload first 20 complaints
5. Custom number
6. Exit
```

---

### Option 2: Automated Upload (For Batch Processing)

```powershell
cd D:\Civiclens\civiclens-backend
& D:\Civiclens\.venv\Scripts\Activate.ps1
uv run python upload_test_complaints_auto.py
```

**What happens**:
1. Authenticates automatically
2. Uploads all 35 complaints
3. Shows progress and summary
4. Exits automatically

**To customize**:
Edit the script and change these settings:
```python
UPLOAD_LIMIT = 10  # Upload only first 10 (None = all)
DELAY_BETWEEN_UPLOADS = 0.5  # Delay between uploads in seconds
```

---

## 📊 Understanding the Upload Flow

### 1. Authentication
```
User Phone: +919326852646
Password: Password@901
Portal Type: citizen
↓
Backend validates credentials
↓
Returns access_token + refresh_token
```

### 2. Report Creation
For each complaint:
```
Complaint Data:
  - title
  - description
  - latitude/longitude
  - address
  - ward_number
  - pincode
  - landmark
  - severity (low/medium/high/critical)
  - category (roads/water/sanitation/etc)
↓
POST /api/v1/reports/
↓
Backend creates report
↓
Returns report_id + report_number
```

### 3. Summary
```
✅ Uploaded: 10
❌ Failed: 0
� Total: 10
```

---

## 📝 Test Complaints Structure

Each complaint in `test_ai_complaints.json` has:

```json
{
  "id": 1,
  "title": "Big pothole on Palm Beach Road",
  "description": "There is a large pothole...",
  "latitude": 19.0728,
  "longitude": 73.0016,
  "address": "Palm Beach Road, Vashi, Navi Mumbai",
  "ward_number": "15",
  "pincode": "400703",
  "landmark": "Near Vashi Railway Station",
  "expected_category": "roads",
  "expected_severity": "high",
  "expected_department": "Public Works Department",
  "expected_confidence": ">0.70",
  "keywords_present": ["pothole", "road", "damaged"],
  "image_requirements": ["pothole_closeup.jpg", ...]
}
```

---

## 🎯 Test Scenarios

### Scenario 1: Quick Test (5 Complaints)
```powershell
# Interactive
uv run python upload_test_complaints_interactive.py
# Select option 2

# Or automated
# Edit script: UPLOAD_LIMIT = 5
uv run python upload_test_complaints_auto.py
```

### Scenario 2: Full Test (All 35 Complaints)
```powershell
# Interactive
uv run python upload_test_complaints_interactive.py
# Select option 1

# Or automated
uv run python upload_test_complaints_auto.py
```

### Scenario 3: Custom Number
```powershell
# Interactive
uv run python upload_test_complaints_interactive.py
# Select option 5
# Enter: 15
```

---

## � Monitoring Uploads

### Check Backend Logs
The backend will show:
```
INFO:     127.0.0.1:XXXXX - "POST /api/v1/reports/ HTTP/1.1" 201 Created
```

### Check Database
```powershell
# Connect to database
psql -U civiclens_user -d civiclens_db

# Check reports
SELECT id, report_number, title, status, created_at FROM reports ORDER BY created_at DESC LIMIT 10;

# Check by user
SELECT id, report_number, title, status FROM reports WHERE user_id = (SELECT id FROM users WHERE phone = '+919326852646') ORDER BY created_at DESC;
```

### Check Admin Dashboard
1. Go to http://localhost:3001
2. Login as admin: +919999999999 / Admin123!
3. Navigate to "Manage Reports"
4. Filter by citizen user to see uploaded complaints

---

## ⚠️ Troubleshooting

### Error: "Cannot connect to backend"
**Solution**: Make sure backend is running
```powershell
cd D:\Civiclens\civiclens-backend
uv run uvicorn app.main:app --reload
```

### Error: "Login failed: 401"
**Solution**: Check test user credentials
```powershell
# Verify user exists
uv run python check_users.py

# If not, seed the database
uv run python seed_all.py
```

### Error: "File not found: test_ai_complaints.json"
**Solution**: Make sure you're in the correct directory
```powershell
cd D:\Civiclens\civiclens-backend
ls test_ai_complaints.json  # Should exist
```

### Error: "Invalid coordinates"
**Solution**: Some complaints don't have coordinates. They'll be skipped automatically.

### Error: "422 Unprocessable Entity"
**Solution**: Check the validation error message. Common issues:
- Title too short (min 5 chars)
- Description too short (min 10 chars)
- Invalid severity or category

---

## 📈 Performance

### Upload Speed
- **Per complaint**: ~0.5-1 second
- **5 complaints**: ~3-5 seconds
- **10 complaints**: ~6-10 seconds
- **35 complaints**: ~20-35 seconds

### Optimization Tips
1. Reduce `DELAY_BETWEEN_UPLOADS` for faster uploads
2. Use automated script for batch processing
3. Run multiple instances in parallel (if needed)

---

## 🧪 Testing AI Pipeline

After uploading complaints, the AI worker will automatically:
1. Classify complaints by category
2. Detect duplicate reports
3. Extract key information
4. Generate insights

**To monitor AI processing**:
```powershell
# Check AI worker logs
Get-Content civiclens-backend/logs/ai_worker.log -Tail 50

# Or in real-time
Get-Content civiclens-backend/logs/ai_worker.log -Wait
```

---

## 📚 API Reference

### Login Endpoint
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "phone": "+919326852646",
  "password": "Password@901",
  "portal_type": "citizen"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user_id": 2,
  "role": "citizen"
}
```

### Create Report Endpoint
```http
POST /api/v1/reports/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Big pothole on Palm Beach Road",
  "description": "There is a large pothole causing traffic problems...",
  "latitude": 19.0728,
  "longitude": 73.0016,
  "address": "Palm Beach Road, Vashi, Navi Mumbai",
  "ward_number": "15",
  "pincode": "400703",
  "landmark": "Near Vashi Railway Station",
  "severity": "high",
  "category": "roads"
}

Response:
{
  "id": 1,
  "report_number": "RNC-2026-001",
  "title": "Big pothole on Palm Beach Road",
  "status": "submitted",
  "created_at": "2026-01-27T10:30:00Z",
  ...
}
```

---

## 🎓 Next Steps

After uploading complaints:

1. **View in Admin Dashboard**
   - http://localhost:3001
   - Login as admin
   - Check "Manage Reports"

2. **Test AI Classification**
   - Start AI worker: `uv run python -m app.workers.ai_worker`
   - Check if complaints are auto-classified

3. **Test Officer Assignment**
   - Assign officers to complaints
   - Test workflow transitions

4. **Test Mobile App**
   - View complaints in mobile app
   - Test citizen features

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs
3. Check database directly
4. Review API documentation

---

**Created**: January 27, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

