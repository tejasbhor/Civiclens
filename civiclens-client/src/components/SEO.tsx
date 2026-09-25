import { Helmet } from 'react-helmet-async';

import { APP_CONFIG } from '@/config/appConfig';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://civiclens.space').replace(/\/$/, '');
const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);

interface SEOProps {
  /** Keep login and account pages out of search results. */
  noindex?: boolean;
  url?: string;
  type?: string;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export function SEO({
  title = `${APP_CONFIG.appName} - Report, Track, Resolve Civic Issues`,
  description = `${APP_CONFIG.appName} is a modern civic engagement platform that empowers citizens to report issues, track progress, and help improve their communities.`,
  keywords = 'civic engagement, report issues, community improvement, civic tech, municipal services, citizen reporting, issue tracking',
  image = '/og-image.jpg',
  url = `${SITE_URL}${window.location.pathname}`,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const imageUrl = abs(image);
  const siteName = APP_CONFIG.appName;
  const fullTitle = /civiclens/i.test(title) || title.includes(APP_CONFIG.appName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Additional Meta Tags */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="author" content={`${APP_CONFIG.appName} Team`} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};
