# 🔄 Complete Upload Flow Explanation

This document explains the complete flow of uploading test complaints, from authentication to report creation.

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    UPLOAD FLOW OVERVIEW                         │
└─────────────────────────────────────────────────────────────────┘

1. INITIALIZATION
   ├─ Check backend is running (health check)
   ├─ Load test_ai_complaints.json
   └─ Initialize HTTP client

2. AUTHENTICATION
   ├─ POST /auth/login
   │  ├─ Phone: +919326852646
   │  ├─ Password: Password@901
   │  └─ Portal: citizen
   ├─ Receive access_token + refresh_token
   └─ Store tokens for subsequent requests

3. FOR EACH COMPLAINT
   ├─ Extract complaint data
   ├─ Validate required fields
   ├─ POST /reports/
   │  ├─ Title
   │  ├─ Description
   │  ├─ Location (lat/lng)
   │  ├─ Address details
   │  ├─ Severity
   │  └─ Category
   ├─ Receive report_id + report_number
   └─ Store result

4. SUMMARY
   ├─ Count uploaded
   ├─ Count failed
   └─ Display results
```

---

## 🔐 Step 1: Authentication

### What Happens
The script authenticates as a citizen user to get an access token.

### Request
```http
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "phone": "+919326852646",
  "password": "Password@901",
  "portal_type": "citizen"
}
```

### Response (Success)
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user_id": 2,
  "role": "citizen"
}
```

### What the Backend Does
1. Validates phone number format
2. Checks if user exists
3. Verifies password
4. Checks if user is active
5. Checks rate limiting (max 5 attempts per 15 minutes)
6. Generates JWT access token (expires in 24 hours)
7. Generates refresh token (expires in 30 days)
8. Creates session record
9. Logs login attempt in audit log

### Error Handling
```
❌ 401 Unauthorized
   - Invalid phone/password
   - User not found
   - User is inactive

❌ 429 Too Many Requests
   - Rate limit exceeded
   - Wait 15 minutes before retrying

❌ 422 Unprocessable Entity
   - Invalid phone format
   - Missing required fields
```

---

## 📝 Step 2: Load Test Complaints

### File Structure
```json
{
  "test_complaints": [
    {
      "id": 1,
      "title": "Big pothole on Palm Beach Road near Vashi Railway Station",
      "description": "There is a large pothole on Palm Beach Road...",
      "latitude": 19.0728,
      "longitude": 73.0016,
      "address": "Palm Beach Road, Vashi, Navi Mumbai, 400703",
      "ward_number": "15",
      "pincode": "400703",
      "landmark": "Near Vashi Railway Station",
      "expected_category": "roads",
      "expected_severity": "high",
      "expected_department": "Public Works Department",
      "expected_confidence": ">0.70",
      "keywords_present": ["pothole", "road", "damaged", "repair"],
      "image_requirements": ["pothole_closeup.jpg", "pothole_wide_angle.jpg"]
    },
    ...
  ],
  "test_categories": { ... },
  "test_severity": { ... },
  "edge_cases": { ... }
}
```

### Data Mapping
The script maps complaint data to report fields:

| Complaint Field | Report Field | Required | Notes |
|---|---|---|---|
| title | title | ✅ | Min 5 chars |
| description | description | ✅ | Min 10 chars |
| latitude | latitude | ✅ | -90 to 90 |
| longitude | longitude | ✅ | -180 to 180 |
| address | address | ❌ | Optional |
| ward_number | ward_number | ❌ | Optional |
| pincode | pincode | ❌ | Optional |
| landmark | landmark | ❌ | Optional |
| expected_severity | severity | ✅ | low/medium/high/critical |
| expected_category | category | ✅ | roads/water/sanitation/etc |

---

## 📤 Step 3: Create Report

### For Each Complaint

#### Request
```http
POST http://localhost:8000/api/v1/reports/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "title": "Big pothole on Palm Beach Road near Vashi Railway Station",
  "description": "There is a large pothole on Palm Beach Road near Vashi Railway Station causing traffic problems. The road is damaged and needs immediate repair. Many vehicles are getting damaged.",
  "latitude": 19.0728,
  "longitude": 73.0016,
  "address": "Palm Beach Road, Vashi, Navi Mumbai, 400703",
  "ward_number": "15",
  "pincode": "400703",
  "landmark": "Near Vashi Railway Station",
  "severity": "high",
  "category": "roads"
}
```

#### Response (Success)
```json
{
  "id": 1,
  "report_number": "RNC-2026-001",
  "title": "Big pothole on Palm Beach Road near Vashi Railway Station",
  "description": "There is a large pothole...",
  "latitude": 19.0728,
  "longitude": 73.0016,
  "address": "Palm Beach Road, Vashi, Navi Mumbai, 400703",
  "ward_number": "15",
  "pincode": "400703",
  "landmark": "Near Vashi Railway Station",
  "severity": "high",
  "category": "roads",
  "status": "submitted",
  "user_id": 2,
  "created_at": "2026-01-27T10:30:00Z",
  "updated_at": "2026-01-27T10:30:00Z"
}
```

### What the Backend Does
1. Validates authentication token
2. Checks user permissions (can_report)
3. Validates all required fields
4. Validates coordinate bounds
5. Validates title/description length
6. Validates severity and category
7. Generates unique report number (RNC-2026-001)
8. Creates report in database
9. Sets initial status to "submitted"
10. Logs report creation in audit log
11. Triggers AI processing (if enabled)

### Validation Rules
```
Title:
  - Min length: 5 characters
  - Max length: 500 characters
  - Required: Yes

Description:
  - Min length: 10 characters
  - Max length: 5000 characters
  - Required: Yes

Latitude:
  - Range: -90 to 90
  - Required: Yes

Longitude:
  - Range: -180 to 180
  - Required: Yes

Severity:
  - Valid values: low, medium, high, critical
  - Required: Yes

Category:
  - Valid values: roads, water, sanitation, streetlight, drainage, 
                  public_property, electricity, other
  - Required: Yes
```

### Error Handling
```
❌ 401 Unauthorized
   - Invalid or expired token
   - User not authenticated

❌ 403 Forbidden
   - User cannot create reports
   - User role doesn't have permission

❌ 422 Unprocessable Entity
   - Validation error (see details)
   - Invalid field values
   - Missing required fields

❌ 500 Internal Server Error
   - Database error
   - Unexpected server error
```

---

## 🔄 Complete Request/Response Cycle

### Example: Upload One Complaint

#### 1. Login
```
→ POST /auth/login
← 200 OK + access_token

Time: ~100ms
```

#### 2. Create Report
```
→ POST /reports/
  Authorization: Bearer <token>
  Body: complaint data
← 201 Created + report_id

Time: ~200ms
```

#### 3. Total Time Per Complaint
```
~300ms (0.3 seconds)
+ 0.5s delay between uploads
= ~0.8 seconds per complaint
```

#### 4. Total Time for 35 Complaints
```
35 complaints × 0.8 seconds = 28 seconds
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT (Script)                           │
│  upload_test_complaints_interactive.py                       │
│  upload_test_complaints_auto.py                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
                    HTTP/HTTPS Request
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│                                                              │
│  1. Auth Endpoint (/auth/login)                             │
│     ├─ Validate credentials                                 │
│     ├─ Generate JWT token                                   │
│     └─ Create session                                       │
│                                                              │
│  2. Reports Endpoint (/reports/)                            │
│     ├─ Validate token                                       │
│     ├─ Validate report data                                 │
│     ├─ Generate report number                               │
│     ├─ Create report in DB                                  │
│     └─ Trigger AI processing                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
                    HTTP Response
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE                                  │
│                                                              │
│  Tables:                                                     │
│  - users (authentication)                                    │
│  - reports (complaint data)                                  │
│  - audit_logs (tracking)                                     │
│  - sessions (session management)                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Concepts

### 1. Authentication Token
- **Type**: JWT (JSON Web Token)
- **Expires**: 24 hours
- **Used for**: Authorizing subsequent requests
- **Format**: `Authorization: Bearer <token>`

### 2. Report Number
- **Format**: `RNC-2026-001`
- **Components**:
  - `RNC` = City code (Navi Mumbai)
  - `2026` = Year
  - `001` = Sequential number
- **Uniqueness**: Unique per city per year

### 3. Report Status
- **Initial**: `submitted`
- **Workflow**: submitted → assigned → acknowledged → in_progress → completed
- **Can be**: on_hold, rejected, etc.

### 4. Severity Levels
- **critical**: Immediate danger (e.g., live wire)
- **high**: Urgent (e.g., pothole on highway)
- **medium**: Important (e.g., broken bench)
- **low**: Minor (e.g., dim streetlight)

### 5. Categories
- **roads**: Potholes, cracks, broken footpaths
- **water**: Leaks, contamination, low pressure
- **sanitation**: Garbage, dirty areas, waste
- **streetlight**: Non-working, dim, damaged
- **drainage**: Blockage, waterlogging, sewage
- **public_property**: Parks, benches, fences
- **electricity**: Power outage, fluctuation, wires
- **other**: Miscellaneous

---

## 🧪 Testing Scenarios

### Scenario 1: Single Complaint
```
1. Login
2. Create 1 report
3. Verify in database
4. Check in admin dashboard
```

### Scenario 2: Batch Upload
```
1. Login
2. Create 10 reports
3. Verify all in database
4. Check AI classification
5. Verify in admin dashboard
```

### Scenario 3: Error Handling
```
1. Login with wrong password → 401
2. Create report with invalid data → 422
3. Create report without auth → 401
4. Create report with invalid coordinates → 422
```

---

## 📈 Performance Metrics

### Typical Response Times
```
Login:           ~100ms
Create Report:   ~200ms
Total per item:  ~300ms
```

### Throughput
```
Sequential:      ~3-4 reports/second
Batch (35):      ~28 seconds
```

### Database Impact
```
Queries per report:  ~5-10
Indexes used:        report_number, user_id, created_at
```

---

## 🔍 Monitoring & Debugging

### Backend Logs
```
INFO:     127.0.0.1:XXXXX - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:XXXXX - "POST /api/v1/reports/ HTTP/1.1" 201 Created
```

### Database Queries
```sql
-- Check uploaded reports
SELECT id, report_number, title, status, created_at 
FROM reports 
WHERE user_id = 2 
ORDER BY created_at DESC;

-- Check by category
SELECT category, COUNT(*) as count 
FROM reports 
WHERE user_id = 2 
GROUP BY category;

-- Check by severity
SELECT severity, COUNT(*) as count 
FROM reports 
WHERE user_id = 2 
GROUP BY severity;
```

### Script Output
```
✅ Uploaded: 10
❌ Failed: 0
📊 Total: 10
```

---

## 🎓 Learning Resources

### Understanding JWT
- JWT tokens contain encoded user information
- Tokens are verified by backend using secret key
- Tokens expire after 24 hours
- Refresh tokens can be used to get new access tokens

### Understanding REST API
- POST = Create new resource
- GET = Retrieve resource
- PUT/PATCH = Update resource
- DELETE = Delete resource

### Understanding HTTP Status Codes
- 200 = OK (success)
- 201 = Created (resource created)
- 400 = Bad Request (client error)
- 401 = Unauthorized (auth required)
- 403 = Forbidden (permission denied)
- 404 = Not Found (resource not found)
- 422 = Unprocessable Entity (validation error)
- 429 = Too Many Requests (rate limited)
- 500 = Internal Server Error (server error)

---

## 📞 Troubleshooting

### Issue: "Cannot connect to backend"
**Cause**: Backend not running  
**Solution**: Start backend with `uv run uvicorn app.main:app --reload`

### Issue: "Login failed: 401"
**Cause**: Invalid credentials  
**Solution**: Verify user exists with `uv run python check_users.py`

### Issue: "422 Unprocessable Entity"
**Cause**: Validation error  
**Solution**: Check error message for specific field

### Issue: "Slow uploads"
**Cause**: Network latency or server load  
**Solution**: Reduce delay or run during off-peak hours

---

**Created**: January 27, 2026  
**Version**: 1.0.0  
**Status**: Complete ✅

