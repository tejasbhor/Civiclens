export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  h1: {
    fontFamily: 'System',
    fontSize: 30,
    fontWeight: '700' as const,
    color: '#1E293B',
  },
  h2: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1E293B',
  },
  h3: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  body: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    color: '#1E293B',
  },
  bodyBold: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  caption: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400' as const,
    color: '#64748B',
  },
  label: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#64748B',
  },
};

export type Typography = typeof typography;
