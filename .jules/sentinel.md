## 2025-10-19 - Fix PII Leak in Report Details
**Vulnerability:** The `serialize_report_with_details` function in `reports.py` blindly included the reporter's phone number in the response payload. This function was used by `get_reports` (public listing) and `get_report` (public detail view), allowing any user (even anonymous) to see the phone number of any citizen who filed a report.
**Learning:** Shared serialization logic is convenient but dangerous if it assumes a "trusted" context. When an internal serializer is exposed to public endpoints, it must become context-aware (i.e., aware of who is asking).
**Prevention:**
1.  Avoid serializing sensitive PII by default.
2.  Pass `current_user` to serialization functions.
3.  Explicitly check permissions (e.g., `is_owner` or `is_privileged`) before adding sensitive fields like phone numbers or emails.
