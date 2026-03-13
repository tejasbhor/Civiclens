/**
 * Centralized Application Configuration for CivicLens Web Portal
 * 
 * All branding, organization-specific values, and deployment-configurable
 * strings are defined here. Components should import from this file
 * instead of using hardcoded strings.
 * 
 * To white-label for a different organization, update VITE_* env vars.
 */

export const APP_CONFIG = {
    /** Platform name shown in UI */
    appName: import.meta.env.VITE_APP_NAME || 'CivicLens',

    /** Full organization name */
    orgName: import.meta.env.VITE_ORG_NAME || 'Municipal Corporation',

    /** Short organization code */
    orgShortName: import.meta.env.VITE_ORG_SHORT_NAME || 'MC',

    /** Support email shown to users */
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@example.com',

    /** Organization website */
    orgWebsiteUrl: import.meta.env.VITE_ORG_WEBSITE_URL || '',

    /** Report number prefix */
    reportNumberPrefix: import.meta.env.VITE_REPORT_PREFIX || 'CL',

    /** City/deployment code */
    cityCode: import.meta.env.VITE_CITY_CODE || 'MC',
} as const;

/** Build a report number fallback from report ID */
export function fallbackReportNumber(reportId: number | string): string {
    return `${APP_CONFIG.reportNumberPrefix}-${reportId}`;
}

/** Get copyright text */
export function getCopyrightText(year?: number): string {
    const y = year || new Date().getFullYear();
    return `© ${y} ${APP_CONFIG.appName}. All rights reserved.`;
}
