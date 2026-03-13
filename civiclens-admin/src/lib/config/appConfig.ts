/**
 * Centralized Application Configuration
 * 
 * All branding, organization-specific values, and deployment-configurable
 * strings are defined here. Components should import from this file
 * instead of using hardcoded strings.
 * 
 * To white-label this platform for a different organization,
 * update the NEXT_PUBLIC_* environment variables in .env
 */

export const APP_CONFIG = {
    /** Platform name shown in UI, PDFs, emails */
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'CivicLens',

    /** App version */
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    /** Full organization name */
    orgName: process.env.NEXT_PUBLIC_ORG_NAME || 'Municipal Corporation',

    /** Short organization code */
    orgShortName: process.env.NEXT_PUBLIC_ORG_SHORT_NAME || 'MC',

    /** Support email shown to users */
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com',

    /** Organization website */
    orgWebsiteUrl: process.env.NEXT_PUBLIC_ORG_WEBSITE_URL || '',

    /** Report number prefix (e.g., CL-2026-MC-00001) */
    reportNumberPrefix: process.env.NEXT_PUBLIC_REPORT_PREFIX || 'CL',

    /** City/deployment code */
    cityCode: process.env.NEXT_PUBLIC_CITY_CODE || 'MC',

    /** Platform tagline for admin portal */
    adminTagline: process.env.NEXT_PUBLIC_ADMIN_TAGLINE || 'Secure Government Portal',

    /** Platform description for PDFs and footers */
    platformDescription: process.env.NEXT_PUBLIC_PLATFORM_DESCRIPTION || 'Complaint Management System',

    /** Whether to enable OTP visualization for demo/portfolio (even in production) */
    enableDemoOtp: process.env.NEXT_PUBLIC_ENABLE_DEMO_OTP === 'true',
} as const;

/** Admin portal title */
export const ADMIN_PORTAL_TITLE = `${APP_CONFIG.appName} Admin Portal`;

/** Build a report number fallback from report ID */
export function fallbackReportNumber(reportId: number | string): string {
    return `${APP_CONFIG.reportNumberPrefix}-${reportId}`;
}

/** Build a PDF filename */
export function buildPdfFilename(prefix: string, reportNum: string, timestamp: string): string {
    const safeName = APP_CONFIG.appName.replace(/\s+/g, '_');
    return `${safeName}_${prefix}_${reportNum}_${timestamp}`;
}

/** Footer copyright text */
export function getCopyrightText(): string {
    return `${APP_CONFIG.appName} - ${APP_CONFIG.orgName} ${APP_CONFIG.platformDescription}`;
}
