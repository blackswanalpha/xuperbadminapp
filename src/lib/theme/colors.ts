/**
 * XuperB Admin App Color Palette
 * Based on xuperbadminapp design system requirements
 * Using admin color palette with blue primary theme and supervisor green theme
 */

export const colors = {
  // Admin Primary Colors (Blue Theme)
  adminPrimary: '#4A90E2',
  adminPrimaryLight: '#6CA4EA',
  adminPrimaryDark: '#357ABD',
  
  // Supervisor Primary Colors (Green Theme)
  supervisorPrimary: '#059669',      // Professional emerald green
  supervisorPrimaryLight: '#34D399', // Light emerald
  supervisorPrimaryDark: '#047857',  // Dark emerald
  supervisorSecondary: '#065F46',    // Deep green
  supervisorAccent: '#10B981',       // Success green
  
  // Secondary Colors
  adminSecondary: '#6B7280',
  adminAccent: '#0EA5E9',
  
  // Status Colors
  adminSuccess: '#10B981',
  adminWarning: '#F59E0B',
  adminError: '#EF4444',
  
  // Neutral Colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  
  // Text Colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  
  // Border Colors
  borderLight: '#E5E7EB',
  borderMedium: '#D1D5DB',
  borderDark: '#9CA3AF',
  
  // Shadow Colors
  shadowLight: 'rgba(0, 0, 0, 0.06)',
  shadowMedium: 'rgba(0, 0, 0, 0.10)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
  
  // Chart Colors
  chartColors: [
    '#4A90E2', // Primary blue
    '#10B981', // Success green
    '#0EA5E9', // Accent blue
    '#EF4444', // Error red
    '#6CA4EA', // Light blue
    '#9CA3AF', // Light gray
    '#60A5FA', // Light blue
    '#0EA5E9', // Admin accent
  ],
} as const

export type ColorKey = keyof typeof colors

