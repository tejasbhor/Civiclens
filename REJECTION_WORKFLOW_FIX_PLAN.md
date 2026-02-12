# Rejection Workflow - State Management & UX Issues

**Date:** February 11, 2026 15:29  
**Issue:** Rejection state changes not handled well on admin dashboard and citizen portal

---

## 🔍 CURRENT FLOW

### When Admin Rejects Officer's Work:

1. ✅ **VerifyWorkModal** (admin component)
   - Officer submits work → Report status = `PENDING_VERIFICATION`
   - Admin opens VerifyWorkModal
   - Admin clicks "Request Rework" and provides rejection reason
   - Calls: `reportsApi.rejectResolution(report.id, rejectionReason)`
   
2. ✅ **Backend** (`rejectResolution` API)
   - Changes report status from `PENDING_VERIFICATION` → `IN_PROGRESS`
   - Stores `rejection_reason` on report
   - **Sends notification** to officer
   - Returns updated report

3. ⚠️ **LifecycleManager** (admin component)
   - Gets `updatedReport` from modal
   - Calls `onUpdate()` callback
   - **Problem:** Only refreshes data, doesn't show feedback

4. ⚠️ **Admin Dashboard**
   - Report list refreshes
   - **Problem:** No toast/feedback showing rejection was successful
   - **Problem:** Lifecycle stage may not update immediately
   
5. ⚠️ **Citizen Portal**
   - Citizen receives notification
   - **Problem:** Report status changes but UI doesn't reflect "needs improvement"
   - **Problem:** No clear indication of what needs to be fixed
   - **Problem:** Rejection reason not prominently displayed

---

## 🐛 SPECIFIC ISSUES IDENTIFIED

### Issue 1: No Success Feedback (Admin)
**Location:** `LifecycleManager.tsx` line 743-746  
**Problem:**
```typescript
onSuccess={(updatedReport) => {
  setShowVerifyWorkModal(false);
  onUpdate(); // Just refreshes - NO USER FEEDBACK!
}}
```

**Missing:** Toast notification confirming rejection was sent

---

### Issue 2: Lifecycle UI Doesn't Update Immediately (Admin)
**Location:** `LifecycleManager.tsx` lines 61-128 (`getWorkflowStage`)  
**Problem:** The workflow

 stage calculation depends on `report.status` prop  
**Issue:** If parent doesn't update the `report` prop immediately, lifecycle shows old state

**Example:**
- Status WAS: `PENDING_VERIFICATION` (stage 5)
- Status NOW: `IN_PROGRESS` (stage 4)
- UI shows: Still at stage 5 until parent refreshes

---

### Issue 3: No Rejection Reason Display (Citizen)
**Location:** Citizen portal `TrackReport.tsx`  
**Problem:** Report has `rejection_reason` field but citizen doesn't see it prominently

**Missing:**
- ❌ Alert banner showing "Work needs improvement"
- ❌ Display of rejection reason
- ❌ Clear action items for officer

---

### Issue 4: No Real-Time Update (Citizen)
**Problem:** Citizen uses polling (60s interval)  
**Impact:** Citizen won't see rejection notification for up to 60 seconds

---

## ✅ SOLUTION PLAN

### Fix 1: Add Toast Notifications (Admin)
**File:** `LifecycleManager.tsx`  
**Change:**

```typescript
// Line 743-746 - UPDATE THIS:
onSuccess={(updatedReport) => {
  setShowVerifyWorkModal(false);
  
  // ADD TOAST FEEDBACK:
  if (updatedReport.status === 'in_progress') {
    toast.success('Rework Requested', {
      description: 'Officer has been notified to improve their work.'
    });
  } else if (updated Report.status === 'resolved') {
    toast.success('Resolution Approved', {
      description: 'The report has been marked as resolved.'
    });
  }
  
  onUpdate(); // Refresh data
}}
```

**Benefit:** Admin gets immediate feedback

---

### Fix 2: Update Lifecycle Stage Immediately (Admin)
**File:** `LifecycleManager.tsx`  
**Change:** Accept `updatedReport` from modal and update local state

```typescript
// Add state at top:
const [localReport, setLocalReport] = useState(report);

// Update useEffect to sync with prop:
useEffect(() => {
  setLocalReport(report);
}, [report]);

// Update onSuccess callbacks:
onSuccess={(updatedReport) => {
  setShowVerifyWorkModal(false);
  setLocalReport(updatedReport); // UPDATE LOCAL STATE IMMEDIATELY
  toast.success('...');
  onUpdate(); // Still refresh from server
}}

// Use localReport instead of report in component:
const stages = getWorkflowStage(localReport); // Use local state
```

**Benefit:** UI updates immediately, no waiting for server refresh

---

### Fix 3: Show Rejection Banner (Citizen)
**File:** `TrackReport.tsx` (citizen portal)  
**Change:** Add rejection alert banner

```typescript
{/* ADD THIS SECTION - After status badge, before timeline */}
{report.status === 'in_progress' && report.rejection_reason && (
  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 mb-6">
    <div className="flex items-start gap-4">
      <div className="p-2 bg-orange-100 rounded-lg">
        <AlertTriangle className="w-6 h-6 text-orange-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-orange-900 mb-2">
          Work Needs Improvement
        </h3>
        <p className="text-sm text-orange-800 mb-3">
          The assigned officer has been asked to improve their work based on the feedback below:
        </p>
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Feedback:</p>
          <p className="text-sm text-gray-900 leading-relaxed">
            {report.rejection_reason}
          </p>
        </div>
        <p className="text-xs text-orange-700 mt-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          The officer will address this and resubmit their work.
        </p>
      </div>
    </div>
  </div>
)}
```

**Benefit:** Citizen sees clear feedback about what needs improvement

---

### Fix 4: Better Timeline Display (Citizen)
**File:** `TrackReport.tsx`  
**Change:** Add rejection event to timeline

```typescript
// In timeline rendering, add rejection event:
{report.rejection_reason && (
  <div className="timeline-event">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">
          Work Rework Requested
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {report.rejection_reason}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(report.updated_at)}
        </p>
      </div>
    </div>
  </div>
)}
```

**Benefit:** Timeline shows complete history including rejections

---

## 📋 IMPLEMENTATION CHECKLIST

### Admin Dashboard (Priority 1)
- [ ] Add toast notifications to LifecycleManager
  - [ ] Success toast when rework requested
  - [ ] Success toast when resolution approved
- [ ] Fix lifecycle stage immediate update
  - [ ] Add local state for report
  - [ ] Update on modal success
  - [ ] Sync with prop changes
- [ ] Test rejection flow end-to-end

### Citizen Portal (Priority 2)
- [ ] Add rejection banner to TrackReport
  - [ ] Show when status = IN_PROGRESS && rejection_reason exists
  - [ ] Display rejection reason prominently
  - [ ] Add helpful messaging
- [ ] Update timeline to show rejection events
- [ ] Test citizen view after rejection

### Backend (Already Working)
- [✅] rejectResolution API works
- [✅] Sends notifications
- [✅] Updates status correctly

---

## 🎯 EXPECTED BEHAVIOR AFTER FIX

### Admin Experience:
1. Admin opens VerifyWorkModal
2. Admin selects "Request Rework"
3. Admin provides detailed feedback
4. Admin clicks "Request Rework" button
5. ✅ **Modal closes**
6. ✅ **Toast appears: "Rework Requested - Officer has been notified"**
7. ✅ **Lifecycle stage immediately shows "Work Progress" (green)**
8. ✅ **Report list shows status as "IN_PROGRESS"**

### Citizen Experience:
1. Citizen opens TrackReport page
2. ✅ **See orange banner: "Work Needs Improvement"**
3. ✅ **Read rejection feedback clearly**
4. ✅ **Understand officer is working to fix**
5. ✅ **Timeline shows rejection event**
6. Citizen receives notification (already working)

---

## 🔧 ESTIMATED EFFORT

| Task | Time | Complexity |
 |------|------|------------|
| Add toast to LifecycleManager | 15 min | Low |
| Fix immediate UI update | 30 min | Medium |
| Add rejection banner (citizen) | 20 min | Low |
| Update timeline (citizen) | 15 min | Low |
| Testing (admin + citizen) | 30 min | Medium |
| **Total** | **~2 hours** | **Medium** |

---

## 🧪 TESTING PLAN

### Test Case 1: Admin Rejects Work
1. Create test report in `PENDING_VERIFICATION`
2. Log in as admin
3. Open report detail
4. Click "Review Work"
5. Select "Request Rework"
6. Provide feedback: "Please add before/after photos"
7. Submit

**Expected:**
- ✅ Toast: "Rework Requested"
- ✅ Lifecycle shows "Work Progress"  
- ✅ Status badge shows "IN_PROGRESS"
- ✅ Can see rejection in report details

### Test Case 2: Citizen Sees Rejection
1. Use report from Test Case 1
2. Log in as the citizen wh o created it
3. Navigate to track report page

**Expected:**
- ✅ Orange banner: "Work Needs Improvement"
- ✅ Rejection reason displayed
- ✅ Timeline shows rejection event
- ✅ Status shows "IN_PROGRESS"

### Test Case 3: Officer Sees Notification
1. Use report from Test Case 1
2. Log in as assigned officer
3. Check notifications

**Expected:**
- ✅ Notification: "Work needs improvement for Report #XXX"
- ✅ Clicking notification goes to task
- ✅ Can see rejection reason
- ✅ Can resubmit work

---

## 📝 NOTES

**Important:** The backend already handles everything correctly:
- ✅ Status transitions work
- ✅ Notifications are sent
- ✅ rejection_reason is stored

**The issue is purely UI/UX:**
- No immediate feedback for admin
- No clear display for citizen
- Lifecycle doesn't update immediately

All fixes are frontend-only and low-risk!

---

**Status:** 📋 **Ready to implement**  
**Priority:** 🔴 **High** (affects user experience)  
**Risk:** 🟢 **Low** (UI changes only)  
**Estimated completion:** 2 hours

---

Would you like me to proceed with implementing these fixes?
