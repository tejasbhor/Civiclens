/**
 * Production-Ready PDF Export Service for CivicLens
 * 
 * Generates clean, professional government-grade PDF reports:
 * 1. SUMMARY     – Quick-glance citizen-facing report
 * 2. STANDARD    – Moderate-detail internal report
 * 3. COMPREHENSIVE – Full audit-trail compliance report
 */

import { Report } from '@/types';
import { APP_CONFIG, fallbackReportNumber, getCopyrightText, buildPdfFilename } from '@/lib/config/appConfig';

export enum PDFExportLevel {
  SUMMARY = 'summary',
  STANDARD = 'standard',
  COMPREHENSIVE = 'comprehensive'
}

export enum PDFExportFormat {
  COMPREHENSIVE = 'comprehensive',
  BULK = 'bulk'
}

interface BulkExportRequest {
  report_ids: number[];
  include_media: boolean;
  export_format: string;
}

interface PDFExportOptions {
  level: PDFExportLevel;
  report: Report;
  history?: any[];
  activityLogs?: any[];
  includePhotos?: boolean;
}

/**
 * Format label for display
 */
function toLabel(str: string): string {
  if (!str) return '';
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get severity color scheme
 */
function getSeverityStyle(severity: string): { bg: string; color: string; border: string } {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    low: { bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
    medium: { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
    high: { bg: '#fff7ed', color: '#9a3412', border: '#fdba74' },
    critical: { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
  };
  return map[severity?.toLowerCase()] || map.medium;
}

/**
 * Get status color scheme
 */
function getStatusStyle(status: string): { bg: string; color: string; border: string } {
  const s = status?.toLowerCase() || '';
  if (s.includes('resolved') || s.includes('completed') || s.includes('closed'))
    return { bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' };
  if (s.includes('progress') || s.includes('assigned') || s.includes('working'))
    return { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' };
  if (s.includes('reject') || s.includes('spam') || s.includes('cancel'))
    return { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' };
  if (s.includes('pending') || s.includes('submitted') || s.includes('review'))
    return { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' };
  return { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' };
}

/**
 * Core PDF stylesheet – professional, print-optimized
 */
function getPDFStyles(): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 48px 56px;
      color: #1a1a2e;
      line-height: 1.65;
      background: #ffffff;
      font-size: 14px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Document Header ──────────────────────── */
    .doc-header {
      border-bottom: 3px solid #1e3a5f;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .doc-header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .doc-header .org-name {
      font-size: 13px;
      font-weight: 600;
      color: #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 4px;
    }
    .doc-header .doc-title {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      margin: 8px 0 4px 0;
      letter-spacing: -0.3px;
    }
    .doc-header .report-number {
      font-size: 15px;
      font-weight: 600;
      color: #475569;
    }
    .doc-header .generation-meta {
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
    }
    .doc-level-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    .level-summary {
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    .level-standard {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .level-comprehensive {
      background: #faf5ff;
      color: #6b21a8;
      border: 1px solid #d8b4fe;
    }

    /* ── Confidential Banner ──────────────────── */
    .confidential-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #dc2626;
      padding: 10px 16px;
      margin-bottom: 28px;
      border-radius: 4px;
    }
    .confidential-banner p {
      font-size: 12px;
      font-weight: 600;
      color: #991b1b;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    /* ── Section ──────────────────────────────── */
    .section {
      margin: 28px 0;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .section-number {
      display: inline-block;
      background: #1e3a5f;
      color: #ffffff;
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 24px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      margin-right: 10px;
      vertical-align: middle;
    }

    /* ── Fields ───────────────────────────────── */
    .field {
      margin: 14px 0;
    }
    .field-label {
      font-weight: 600;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .field-value {
      color: #0f172a;
      font-size: 14px;
      line-height: 1.6;
    }

    /* ── Grid Layout ──────────────────────────── */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    /* ── Badges ───────────────────────────────── */
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
      border: 1px solid transparent;
    }

    /* ── Notes / Callout Box ──────────────────── */
    .notes-box {
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
      padding: 14px 18px;
      margin: 10px 0;
      border-radius: 0 4px 4px 0;
      font-size: 13px;
      color: #334155;
      line-height: 1.7;
    }

    /* ── Data Table ───────────────────────────── */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 13px;
    }
    .data-table th {
      background: #f1f5f9;
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }
    .data-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: top;
    }
    .data-table tr:last-child td {
      border-bottom: none;
    }
    .data-table tr:nth-child(even) {
      background: #fafbfc;
    }

    /* ── Timeline ─────────────────────────────── */
    .timeline {
      margin: 16px 0;
      position: relative;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
    }
    .timeline-item {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      position: relative;
      padding-left: 0;
    }
    .timeline-marker {
      width: 32px;
      height: 32px;
      background: #1e3a5f;
      border-radius: 50%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 12px;
      position: relative;
      z-index: 1;
    }
    .timeline-body {
      flex: 1;
      background: #f8fafc;
      padding: 14px 18px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .timeline-body-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    .timeline-status-label {
      font-weight: 700;
      color: #0f172a;
      font-size: 14px;
    }
    .timeline-timestamp {
      color: #64748b;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    .timeline-actor {
      color: #475569;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .timeline-notes {
      background: #ffffff;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 13px;
      color: #334155;
      margin-top: 8px;
      border: 1px solid #e2e8f0;
      line-height: 1.6;
    }

    /* ── Activity Log ─────────────────────────── */
    .activity-entry {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .activity-entry:last-child {
      border-bottom: none;
    }
    .activity-index {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .activity-content {
      flex: 1;
    }
    .activity-action {
      font-weight: 600;
      color: #0f172a;
      font-size: 13px;
      margin-bottom: 2px;
    }
    .activity-desc {
      color: #475569;
      font-size: 12px;
      margin-bottom: 2px;
    }
    .activity-meta {
      color: #94a3b8;
      font-size: 11px;
    }

    /* ── Footer ───────────────────────────────── */
    .doc-footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 2px solid #1e3a5f;
      font-size: 11px;
      color: #64748b;
    }
    .doc-footer .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .doc-footer .footer-org {
      font-weight: 600;
      color: #1e3a5f;
    }
    .doc-footer .footer-note {
      font-style: italic;
      color: #94a3b8;
      margin-top: 8px;
    }

    /* ── Print Actions ────────────────────────── */
    .print-actions {
      margin-top: 40px;
      text-align: center;
      padding: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .print-actions button {
      padding: 12px 28px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      margin: 0 6px;
      transition: opacity 0.15s;
    }
    .print-actions button:hover {
      opacity: 0.85;
    }
    .btn-print {
      background: #1e3a5f;
      color: #ffffff;
    }
    .btn-close {
      background: #e2e8f0;
      color: #475569;
    }

    /* ── Watermark ────────────────────────────── */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100px;
      color: rgba(0, 0, 0, 0.025);
      font-weight: 800;
      z-index: -1;
      pointer-events: none;
      letter-spacing: 12px;
      text-transform: uppercase;
    }

    /* ── Coordinates ──────────────────────────── */
    .coordinates {
      font-family: 'Courier New', 'Consolas', monospace;
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 13px;
      display: inline-block;
      border: 1px solid #e2e8f0;
    }

    /* ── Print Media ──────────────────────────── */
    @media print {
      body { padding: 24px 32px; }
      .no-print { display: none !important; }
      .section { page-break-inside: avoid; }
      .timeline-item { page-break-inside: avoid; }
      .activity-entry { page-break-inside: avoid; }
      .doc-footer { page-break-inside: avoid; }
    }
  `;
}

/**
 * Render a status badge with proper colors
 */
function renderStatusBadge(status: string): string {
  const style = getStatusStyle(status);
  return `<span class="badge" style="background:${style.bg};color:${style.color};border-color:${style.border}">${toLabel(status)}</span>`;
}

/**
 * Render a severity badge with proper colors
 */
function renderSeverityBadge(severity: string): string {
  const style = getSeverityStyle(severity);
  return `<span class="badge" style="background:${style.bg};color:${style.color};border-color:${style.border}">${toLabel(severity)} Priority</span>`;
}

/**
 * Build common document header
 */
function buildHeader(levelLabel: string, levelClass: string, reportNum: string): string {
  const generatedAt = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
  return `
    <div class="doc-header">
      <div class="doc-header-top">
        <div>
          <div class="org-name">${APP_CONFIG.orgName}</div>
          <div class="doc-title">${APP_CONFIG.appName} &mdash; ${levelLabel} Report</div>
          <div class="report-number">Report ${reportNum}</div>
        </div>
        <div class="doc-level-badge ${levelClass}">${levelLabel}</div>
      </div>
      <div class="generation-meta">Generated on ${generatedAt}</div>
    </div>
  `;
}

/**
 * Build common document footer
 */
function buildFooter(filename: string, levelNote: string): string {
  return `
    <div class="doc-footer">
      <div class="footer-row">
        <span class="footer-org">${getCopyrightText()}</span>
        <span>${filename}.pdf</span>
      </div>
      <div class="footer-note">${levelNote}</div>
    </div>
  `;
}

/**
 * Build print action buttons (hidden in print)
 */
function buildPrintActions(): string {
  return `
    <div class="print-actions no-print">
      <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      <button class="btn-close" onclick="window.close()">Close Window</button>
    </div>
  `;
}


// ═══════════════════════════════════════════════════════════════
//  SUMMARY PDF
// ═══════════════════════════════════════════════════════════════

function generateSummaryPDF(options: PDFExportOptions): string {
  const { report } = options;
  const reportNum = report.report_number || fallbackReportNumber(report.id);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = buildPdfFilename('Summary', reportNum, timestamp);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>${getPDFStyles()}</style>
    </head>
    <body>
      <div class="watermark">Summary</div>

      ${buildHeader('Summary', 'level-summary', reportNum)}

      <!-- Section 1: Report Information -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">1</span>Report Information
        </div>
        <div class="field">
          <div class="field-label">Title</div>
          <div class="field-value"><strong>${report.title}</strong></div>
        </div>
        <div class="field">
          <div class="field-label">Description</div>
          <div class="field-value">${report.description ?? 'N/A'}</div>
        </div>
        <div class="field">
          <div class="field-label">Status</div>
          <div class="field-value">${renderStatusBadge(report.status)}</div>
        </div>
        <div class="field">
          <div class="field-label">Category</div>
          <div class="field-value">${toLabel(report.category || '')}</div>
        </div>
      </div>

      <!-- Section 2: Location -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">2</span>Location
        </div>
        <div class="field">
          <div class="field-label">Address</div>
          <div class="field-value">${report.address || 'N/A'}</div>
        </div>
      </div>

      <!-- Section 3: Report Details -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">3</span>Report Details
        </div>
        <table class="data-table">
          <tbody>
            <tr>
              <td style="width:180px;"><strong>Report Number</strong></td>
              <td>${reportNum}</td>
            </tr>
            <tr>
              <td><strong>Date Reported</strong></td>
              <td>${new Date(report.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${buildFooter(filename, 'This is a summary report intended for citizen reference.')}
      ${buildPrintActions()}
    </body>
    </html>
  `;
}


// ═══════════════════════════════════════════════════════════════
//  STANDARD PDF
// ═══════════════════════════════════════════════════════════════

function generateStandardPDF(options: PDFExportOptions): string {
  const { report, history } = options;
  const reportNum = report.report_number || fallbackReportNumber(report.id);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = buildPdfFilename('Report', reportNum, timestamp);

  let sectionNum = 0;
  const nextSection = () => ++sectionNum;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>${getPDFStyles()}</style>
    </head>
    <body>
      <div class="watermark">Standard</div>

      ${buildHeader('Standard', 'level-standard', reportNum)}

      <!-- Report Information -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Report Information
        </div>
        <div class="field">
          <div class="field-label">Title</div>
          <div class="field-value"><strong>${report.title}</strong></div>
        </div>
        <div class="field">
          <div class="field-label">Description</div>
          <div class="field-value">${report.description ?? 'N/A'}</div>
        </div>
        <div class="field">
          <div class="field-label">Current Status &amp; Priority</div>
          <div class="field-value">
            ${renderStatusBadge(report.status)}
            ${renderSeverityBadge(report.severity)}
          </div>
        </div>
      </div>

      <!-- Classification -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Classification &amp; Processing
        </div>
        <div class="field">
          <div class="field-label">Category</div>
          <div class="field-value">${toLabel(report.category || '')}</div>
        </div>
        ${report.sub_category ? `
        <div class="field">
          <div class="field-label">Sub-Category</div>
          <div class="field-value">${toLabel(report.sub_category)}</div>
        </div>
        ` : ''}
        ${report.classification_notes ? `
        <div class="field">
          <div class="field-label">Processing Notes</div>
          <div class="notes-box">${report.classification_notes}</div>
        </div>
        ` : ''}
      </div>

      <!-- Location Details -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Location Details
        </div>
        <div class="grid-2">
          <div class="field">
            <div class="field-label">Address</div>
            <div class="field-value">${report.address || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="field-label">Coordinates</div>
            <div class="field-value">
              <span class="coordinates">${report.latitude?.toFixed(6)}&deg;N, ${report.longitude?.toFixed(6)}&deg;E</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Assignment Details -->
      ${report.department || report.task ? `
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Assignment Details
        </div>
        ${report.department ? `
        <div class="field">
          <div class="field-label">Assigned Department</div>
          <div class="field-value">${report.department.name}</div>
        </div>
        ` : ''}
        ${report.task?.officer ? `
        <div class="field">
          <div class="field-label">Assigned Officer</div>
          <div class="field-value">${report.task.officer.full_name} (${report.task.officer.email})</div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Status History -->
      ${history && history.length > 0 ? `
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Status History
        </div>
        <div class="timeline">
          ${history.map((h: any, idx: number) => `
            <div class="timeline-item">
              <div class="timeline-marker">${idx + 1}</div>
              <div class="timeline-body">
                <div class="timeline-body-header">
                  <div class="timeline-status-label">${toLabel(h.new_status)}</div>
                  <div class="timeline-timestamp">${new Date(h.changed_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
                ${h.changed_by_user ? `
                <div class="timeline-actor">Changed by: ${h.changed_by_user.full_name}</div>
                ` : ''}
                ${h.notes ? `
                <div class="timeline-notes">${h.notes}</div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Report Metadata -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Report Metadata
        </div>
        <table class="data-table">
          <tbody>
            <tr>
              <td style="width:180px;"><strong>Report ID</strong></td>
              <td>${report.id}</td>
            </tr>
            <tr>
              <td><strong>Report Number</strong></td>
              <td>${reportNum}</td>
            </tr>
            <tr>
              <td><strong>Created On</strong></td>
              <td>${new Date(report.created_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</td>
            </tr>
            <tr>
              <td><strong>Last Updated</strong></td>
              <td>${report.updated_at ? new Date(report.updated_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${buildFooter(filename, 'This is an official report generated from the ' + APP_CONFIG.appName + ' platform for internal use.')}
      ${buildPrintActions()}
    </body>
    </html>
  `;
}


// ═══════════════════════════════════════════════════════════════
//  COMPREHENSIVE PDF
// ═══════════════════════════════════════════════════════════════

function generateComprehensivePDF(options: PDFExportOptions): string {
  const { report, history, activityLogs } = options;
  const reportNum = report.report_number || fallbackReportNumber(report.id);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = buildPdfFilename('Comprehensive', reportNum, timestamp);

  let sectionNum = 0;
  const nextSection = () => ++sectionNum;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>${getPDFStyles()}</style>
    </head>
    <body>
      <div class="watermark">Confidential</div>

      ${buildHeader('Comprehensive', 'level-comprehensive', reportNum)}

      <div class="confidential-banner">
        <p>Confidential &mdash; For Internal Use and Audit Purposes Only</p>
      </div>

      <!-- Report Information -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Report Information
        </div>
        <div class="field">
          <div class="field-label">Title</div>
          <div class="field-value"><strong>${report.title}</strong></div>
        </div>
        <div class="field">
          <div class="field-label">Description</div>
          <div class="field-value">${report.description ?? 'N/A'}</div>
        </div>
        <div class="field">
          <div class="field-label">Current Status &amp; Priority</div>
          <div class="field-value">
            ${renderStatusBadge(report.status)}
            ${renderSeverityBadge(report.severity)}
          </div>
        </div>
      </div>

      <!-- Classification & Processing -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Classification &amp; Processing
        </div>
        <div class="grid-2">
          <div class="field">
            <div class="field-label">Category</div>
            <div class="field-value">${toLabel(report.category || '')}</div>
          </div>
          ${report.sub_category ? `
          <div class="field">
            <div class="field-label">Sub-Category</div>
            <div class="field-value">${toLabel(report.sub_category)}</div>
          </div>
          ` : ''}
        </div>
        ${report.classification_notes ? `
        <div class="field">
          <div class="field-label">Processing Notes</div>
          <div class="notes-box">${report.classification_notes}</div>
        </div>
        ` : ''}
      </div>

      <!-- Location Details -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Location Details
        </div>
        <div class="grid-2">
          <div class="field">
            <div class="field-label">Address</div>
            <div class="field-value">${report.address || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="field-label">Coordinates</div>
            <div class="field-value">
              <span class="coordinates">${report.latitude?.toFixed(6)}&deg;N, ${report.longitude?.toFixed(6)}&deg;E</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Assignment Details -->
      ${report.department || report.task ? `
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Assignment Details
        </div>
        <table class="data-table">
          <tbody>
            ${report.department ? `
            <tr>
              <td style="width:180px;"><strong>Department</strong></td>
              <td>${report.department.name}</td>
            </tr>
            ` : ''}
            ${report.task?.officer ? `
            <tr>
              <td><strong>Assigned Officer</strong></td>
              <td>${report.task.officer.full_name} (${report.task.officer.email})</td>
            </tr>
            ` : ''}
            ${report.task?.priority ? `
            <tr>
              <td><strong>Task Priority</strong></td>
              <td>Priority ${report.task.priority}/10</td>
            </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Status History -->
      ${history && history.length > 0 ? `
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Status History
        </div>
        <div class="timeline">
          ${history.map((h: any, idx: number) => `
            <div class="timeline-item">
              <div class="timeline-marker">${idx + 1}</div>
              <div class="timeline-body">
                <div class="timeline-body-header">
                  <div class="timeline-status-label">${toLabel(h.new_status)}</div>
                  <div class="timeline-timestamp">${new Date(h.changed_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</div>
                </div>
                ${h.changed_by_user ? `
                <div class="timeline-actor">Changed by: ${h.changed_by_user.full_name} (${h.changed_by_user.email})</div>
                ` : ''}
                ${h.notes ? `
                <div class="timeline-notes">${h.notes}</div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Complete Activity History -->
      ${activityLogs && activityLogs.length > 0 ? `
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Complete Activity History
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:40px;">#</th>
              <th>Action</th>
              <th>Description</th>
              <th style="width:180px;">Timestamp</th>
              <th style="width:100px;">Role</th>
            </tr>
          </thead>
          <tbody>
            ${activityLogs.map((log: any, idx: number) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${toLabel(log.action)}</strong></td>
                <td>${log.description || '—'}</td>
                <td>${new Date(log.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>${log.user_role ? toLabel(log.user_role) : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Report Metadata -->
      <div class="section">
        <div class="section-title">
          <span class="section-number">${nextSection()}</span>Report Metadata
        </div>
        <table class="data-table">
          <tbody>
            <tr>
              <td style="width:180px;"><strong>Report ID</strong></td>
              <td>${report.id}</td>
            </tr>
            <tr>
              <td><strong>Report Number</strong></td>
              <td>${reportNum}</td>
            </tr>
            <tr>
              <td><strong>Created On</strong></td>
              <td>${new Date(report.created_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</td>
            </tr>
            <tr>
              <td><strong>Last Updated</strong></td>
              <td>${report.updated_at ? new Date(report.updated_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${buildFooter(filename, 'Confidential — This comprehensive report is for internal audit and compliance purposes only.')}
      ${buildPrintActions()}
    </body>
    </html>
  `;
}


// ═══════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Export report as PDF with specified level
 */
export function exportReportPDF(options: PDFExportOptions): void {
  const { level } = options;

  let htmlContent: string;

  switch (level) {
    case PDFExportLevel.SUMMARY:
      htmlContent = generateSummaryPDF(options);
      break;
    case PDFExportLevel.STANDARD:
      htmlContent = generateStandardPDF(options);
      break;
    case PDFExportLevel.COMPREHENSIVE:
      htmlContent = generateComprehensivePDF(options);
      break;
    default:
      htmlContent = generateStandardPDF(options);
  }

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Set title based on level
    const reportNum = options.report.report_number || fallbackReportNumber(options.report.id);
    const timestamp = new Date().toISOString().split('T')[0];
    const levelPrefix = level === PDFExportLevel.SUMMARY ? 'Summary' :
      level === PDFExportLevel.COMPREHENSIVE ? 'Comprehensive' : 'Report';
    printWindow.document.title = buildPdfFilename(levelPrefix, reportNum, timestamp);
  }
}
