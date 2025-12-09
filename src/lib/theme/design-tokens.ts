/**
 * Design Tokens for xuperbadminapp
 * Centralized design values for spacing, sizing, borders, shadows
 * Based on Modernize template and Material Design 3 principles
 */

export const designTokens = {
  // Spacing System (8px base unit)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
    '3xl': '48px',
    '4xl': '64px',
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  },
  
  // Border Widths
  borderWidth: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
  
  // Shadows (Modernize style)
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    sm: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
    md: 'rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px',
    lg: '0 6px 12px 0 rgba(0, 0, 0, 0.15)',
    xl: '0 10px 20px 0 rgba(0, 0, 0, 0.19)',
  },
  
  // Typography
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Z-Index Layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
  
  // Transitions
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

export type DesignToken = typeof designTokens

