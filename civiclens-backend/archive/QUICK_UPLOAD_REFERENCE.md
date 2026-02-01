# ⚡ Quick Upload Reference

## 🚀 Start Upload (Choose One)

### Interactive (Recommended)
```powershell
cd D:\Civiclens\civiclens-backend
& D:\Civiclens\.venv\Scripts\Activate.ps1
uv run python upload_test_complaints_interactive.py
```

### Automated
```powershell
cd D:\Civiclens\civiclens-backend
& D:\Civiclens\.venv\Scripts\Activate.ps1
uv run python upload_test_complaints_auto.py
```

---

## 📋 Test User Credentials

| Field | Value |
|-------|-------|
| Phone | +919326852646 |
| Password | Password@901 |
| Role | Citizen |

---

## 🔗 API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | Authenticate user |
| `/reports/` | POST | Create report |

---

## 📊 Test Data

| Item | Count | File |
|------|-------|------|
| Test Complaints | 35 | `test_ai_complaints.json` |
| Categories | 8 | roads, water, sanitation, etc |
| Severity Levels | 4 | low, medium, high, critical |

---

## ⏱️ Timing

| Operation | Time |
|-----------|------|
| Per complaint | ~0.8 seconds |
| 5 complaints | ~4 seconds |
| 10 complaints | ~8 seconds |
| 35 complaints | ~28 seconds |

---

## ✅ Success Indicators

```
✅ Backend running on http://localhost:8000
✅ Test user authenticated
✅ Reports created with IDs
✅ Status: 201 Created
```

---

## ❌ Common Errors

| Error | Solution |
|-------|----------|
| Cannot connect | Start backend |
| Login failed | Check user exists |
| 422 error | Check field validation |
| Rate limited | Wait 15 minutes |

---

## 📈 Monitoring

### Check Backend
```powershell
curl http://localhost:8000/health
```

### Check Database
```powershell
psql -U civiclens_user -d civiclens_db -c "SELECT COUNT(*) FROM reports;"
```

### Check Admin Dashboard
```
http://localhost:3001
Login: +919999999999 / Admin123!
Navigate: Manage Reports
```

---

## 🎯 Next Steps

1. ✅ Upload complaints
2. ✅ Check in admin dashboard
3. ✅ Start AI worker
4. ✅ Monitor classification
5. ✅ Test officer assignment

---

## 📚 Full Documentation

- **Setup Guide**: `UPLOAD_COMPLAINTS_GUIDE.md`
- **Flow Explanation**: `UPLOAD_FLOW_EXPLAINED.md`
- **API Reference**: Backend API docs at `/docs`

---

**Quick Reference v1.0** | January 27, 2026

