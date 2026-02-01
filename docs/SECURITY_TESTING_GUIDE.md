# 🧪 Security Features - Testing Guide

## Quick Start

**Prerequisites**:
- Backend running on `http://localhost:8000`
- Admin dashboard running on `http://localhost:3001`
- Super admin account seeded
- Google Authenticator app installed on phone

---

## Test 1: Rate Limit Feedback ⏱️

### **Objective**: Verify rate limit countdown displays correctly

### **Steps**:
1. Open admin dashboard: `http://localhost:3001/auth/login`
2. Enter phone: `+919999999999`
3. Enter wrong password 6 times
4. On 6th attempt, should see: "Too many attempts. Please try again in 15 minutes."

### **Expected Result**:
```
✅ Clear error message with countdown
✅ Login button disabled
✅ Message shows minutes, not seconds
```

### **Actual Result**:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 2: 2FA Setup Flow 🔐

### **Objective**: Verify complete 2FA setup process

### **Steps**:

#### **Step 1: Access Security Settings**
1. Login as super admin
   - Phone: `+919999999999`
   - Password: `Admin123!`
2. Navigate to Settings → Security
3. Verify 2FA status shows "Disabled"
4. Verify warning shows "2FA Required" (for super_admin role)

#### **Step 2: Start Setup**
1. Click "Enable 2FA" button
2. Verify intro screen appears with:
   - Why enable 2FA section
   - What you'll need section
   - Continue button

#### **Step 3: Scan QR Code**
1. Click "Continue"
2. Verify QR code displays
3. Verify manual secret key is shown
4. Open Google Authenticator app
5. Tap "+" → "Scan QR code"
6. Scan the QR code
7. Verify "CivicLens" account appears in app

#### **Step 4: Verify Code**
1. Enter 6-digit code from authenticator app
2. Click "Verify & Enable"
3. Verify success message appears
4. Verify redirected to security settings
5. Verify 2FA status shows "Enabled"

### **Expected Result**:
```
✅ QR code displays correctly
✅ Manual secret key works
✅ Code verification succeeds
✅ Status updates to "Enabled"
✅ No errors in console
```

### **Actual Result**:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 3: 2FA Disable Flow 🔓

### **Objective**: Verify 2FA can be disabled with code

### **Steps**:
1. Navigate to Settings → Security
2. Verify 2FA status shows "Enabled"
3. Click "Disable" button
4. Enter 6-digit code from authenticator app
5. Verify success message
6. Verify 2FA status shows "Disabled"

### **Expected Result**:
```
✅ Prompt appears for code
✅ Valid code disables 2FA
✅ Invalid code shows error
✅ Status updates correctly
```

### **Actual Result**:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 4: 2FA API Endpoints 🔌

### **Objective**: Verify all 2FA endpoints work correctly

### **Setup**:
```bash
# Get auth token first
TOKEN="your_access_token_here"
```

### **Test 4.1: Get 2FA Status**
```bash
curl -X GET http://localhost:8000/api/v1/auth/2fa/status \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**:
```json
{
  "enabled": false,
  "required": true
}
```

### **Test 4.2: Setup 2FA**
```bash
curl -X POST http://localhost:8000/api/v1/auth/2fa/setup \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**:
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,...",
  "issuer": "CivicLens"
}
```

### **Test 4.3: Enable 2FA**
```bash
curl -X POST http://localhost:8000/api/v1/auth/2fa/enable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

**Expected**:
```json
{
  "message": "Two-factor authentication enabled successfully"
}
```

### **Test 4.4: Verify 2FA**
```bash
curl -X POST http://localhost:8000/api/v1/auth/2fa/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

**Expected**:
```json
{
  "message": "2FA verification successful",
  "verified": true
}
```

### **Test 4.5: Disable 2FA**
```bash
curl -X POST http://localhost:8000/api/v1/auth/2fa/disable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

**Expected**:
```json
{
  "message": "Two-factor authentication disabled successfully"
}
```

### **Actual Result**:
- [ ] All endpoints work
- [ ] Some endpoints fail (list):

---

## Test 5: Audit Logging 📝

### **Objective**: Verify 2FA actions are logged

### **Steps**:
1. Enable 2FA (as tested above)
2. Check database for audit logs:

```sql
SELECT * FROM audit_logs 
WHERE action IN ('2fa_enabled', '2fa_disabled', '2fa_success', '2fa_failure')
ORDER BY created_at DESC 
LIMIT 10;
```

### **Expected Result**:
```
✅ 2fa_enabled log exists
✅ User ID matches
✅ Timestamp is correct
✅ IP address captured
```

### **Actual Result**:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 6: Error Handling 🚨

### **Objective**: Verify proper error messages

### **Test 6.1: Invalid Code**
1. Try to enable 2FA with code: `000000`
2. Should show: "Invalid verification code"

### **Test 6.2: Setup Without Token**
```bash
curl -X POST http://localhost:8000/api/v1/auth/2fa/setup
```
Should return: `401 Unauthorized`

### **Test 6.3: Enable Without Setup**
1. Try to enable 2FA without calling setup first
2. Should show: "2FA not set up. Call /2fa/setup first."

### **Expected Result**:
```
✅ All errors handled gracefully
✅ Clear error messages
✅ No server crashes
```

### **Actual Result**:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 7: Client Portal Rate Limit 🌐

### **Objective**: Verify rate limit works on client portal too

### **Steps**:
1. Open client portal: `http://localhost:8080/citizen/login`
2. Enter phone: `+919876543210`
3. Request OTP 4 times rapidly
4. On 4th attempt, should see rate limit message

### **Expected Result**:
```
✅ Rate limit message appears
✅ Countdown shows correctly
✅ Can retry after timeout
```

### **Actual Result**:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 8: Mobile App (No Changes) 📱

### **Objective**: Verify mobile app still works

### **Steps**:
1. Open mobile app
2. Login as officer
3. Verify all features work
4. No 2FA prompts (not needed for officers)

### **Expected Result**:
```
✅ Mobile app works normally
✅ No breaking changes
✅ Biometric still works
```

### **Actual Result**:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 9: Performance Check ⚡

### **Objective**: Verify no performance degradation

### **Steps**:
1. Login 10 times with 2FA enabled
2. Measure average response time
3. Compare with login without 2FA

### **Expected Result**:
```
✅ 2FA adds <100ms overhead
✅ No memory leaks
✅ No database slowdown
```

### **Actual Result**:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 10: Security Validation 🔒

### **Objective**: Verify security best practices

### **Checklist**:
- [ ] TOTP secret is 32 characters
- [ ] QR code is base64 encoded
- [ ] Codes expire after use (time-based)
- [ ] Invalid codes don't crash server
- [ ] Audit logs capture all actions
- [ ] Secret is hashed in database
- [ ] 2FA can't be bypassed
- [ ] Rate limiting still works

### **Actual Result**:
- [ ] All checks pass
- [ ] Some checks fail (list):

---

## 🐛 Common Issues & Solutions

### **Issue 1: QR Code Not Displaying**
**Symptom**: Blank space where QR code should be

**Solution**:
```bash
# Check backend logs for errors
# Verify pyotp and qrcode packages installed
pip install pyotp qrcode pillow
```

### **Issue 2: Invalid Code Error**
**Symptom**: Valid code shows as invalid

**Solution**:
- Check phone time is synced
- Verify authenticator app is correct
- Try code from next time window

### **Issue 3: 2FA Required Warning Not Showing**
**Symptom**: No warning for super_admin

**Solution**:
```bash
# Check .env configuration
TWO_FA_ENABLED=true
TWO_FA_REQUIRED_FOR_ROLES=super_admin
```

### **Issue 4: Rate Limit Not Working**
**Symptom**: Can make unlimited attempts

**Solution**:
```bash
# Check Redis is running
docker ps | findstr redis

# Check backend logs for rate limiter errors
```

---

## 📊 Test Summary Template

```
Date: _______________
Tester: _______________
Environment: Development / Staging / Production

Test Results:
✅ Test 1: Rate Limit Feedback - PASS / FAIL
✅ Test 2: 2FA Setup Flow - PASS / FAIL
✅ Test 3: 2FA Disable Flow - PASS / FAIL
✅ Test 4: 2FA API Endpoints - PASS / FAIL
✅ Test 5: Audit Logging - PASS / FAIL
✅ Test 6: Error Handling - PASS / FAIL
✅ Test 7: Client Portal Rate Limit - PASS / FAIL
✅ Test 8: Mobile App - PASS / FAIL
✅ Test 9: Performance Check - PASS / FAIL
✅ Test 10: Security Validation - PASS / FAIL

Overall Status: PASS / FAIL

Notes:
_________________________________
_________________________________
_________________________________

Sign-off:
Developer: _______________
QA: _______________
Date: _______________
```

---

## 🎓 Next Steps After Testing

1. **If All Tests Pass**:
   - ✅ Mark as production-ready
   - ✅ Update documentation
   - ✅ Deploy to staging
   - ✅ Schedule production deployment

2. **If Tests Fail**:
   - ❌ Document issues
   - ❌ Create bug tickets
   - ❌ Fix and retest
   - ❌ Repeat until all pass

---

**Testing Checklist Complete**: _____ / 10 tests passed

**Ready for Production**: YES / NO

**Sign-off**: _______________ Date: _______________
