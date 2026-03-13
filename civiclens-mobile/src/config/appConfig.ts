/**
 * Centralized Application Configuration for CivicLens Mobile App
 * 
 * All branding, organization-specific values, and deployment-configurable
 * strings are defined here. Components should import from this file
 * instead of using hardcoded 'CivicLens' or other values.
 * 
 * To white-label for a different organization, update EXPO_PUBLIC_* env vars.
 */

import Constants from 'expo-constants';

export const APP_CONFIG = {
    /** Platform name shown in UI */
    appName: process.env.EXPO_PUBLIC_APP_NAME || 'CivicLens',

    /** App version */
    appVersion: process.env.EXPO_PUBLIC_APP_VERSION || Constants.expoConfig?.version || '1.0.0',

    /** Full organization name */
    orgName: process.env.EXPO_PUBLIC_ORG_NAME || 'Municipal Corporation',

    /** Short organization code */
    orgShortName: process.env.EXPO_PUBLIC_ORG_SHORT_NAME || 'MC',

    /** Support email shown to users */
    supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@civiclens.org',

    /** Support phone number */
    supportPhone: process.env.EXPO_PUBLIC_SUPPORT_PHONE || '1800-CIVIC-LENS',

    /** FAQ URL */
    faqUrl: process.env.EXPO_PUBLIC_FAQ_URL || '',

    /** User Guide URL */
    userGuideUrl: process.env.EXPO_PUBLIC_USER_GUIDE_URL || '',

    /** Support Section Headings */
    supportSlogan: process.env.EXPO_PUBLIC_SUPPORT_SLOGAN || 'How can we help you?',
    supportSubtitle: process.env.EXPO_PUBLIC_SUPPORT_SUBTITLE || 'Our support team is available to assist you with any issues or questions.',
    faqTitle: process.env.EXPO_PUBLIC_FAQ_TITLE || 'FAQ',
    faqDesc: process.env.EXPO_PUBLIC_FAQ_DESC || 'Frequently asked questions and answers',
    contactEmailTitle: process.env.EXPO_PUBLIC_CONTACT_EMAIL_TITLE || 'Contact Email',
    callCenterTitle: process.env.EXPO_PUBLIC_CALL_CENTER_TITLE || 'Call Center',
    userGuideTitle: process.env.EXPO_PUBLIC_USER_GUIDE_TITLE || 'User Guide',
    userGuideDesc: process.env.EXPO_PUBLIC_USER_GUIDE_DESC || 'How to use CivicLens effectively',

    /** Organization website */
    orgWebsiteUrl: process.env.EXPO_PUBLIC_ORG_WEBSITE_URL || '',

    /** Report number prefix */
    reportNumberPrefix: process.env.EXPO_PUBLIC_REPORT_PREFIX || 'CL',

    /** City/deployment code */
    cityCode: process.env.EXPO_PUBLIC_CITY_CODE || 'MC',
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
