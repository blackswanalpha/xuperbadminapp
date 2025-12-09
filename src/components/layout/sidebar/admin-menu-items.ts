/**
 * Admin Sidebar Menu Items Configuration
 * Defines the navigation structure for the admin dashboard
 */

import {
  LayoutDashboard,
  Zap,
  Car,
  Users,
  FileText,
  Package,
  Settings,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

export interface MenuItem {
  id: string
  title: string
  icon: LucideIcon
  href: string
  subheader?: string
  children?: MenuItem[]
}

export const adminMenuItems: MenuItem[] = [
  {
    id: 'home-section',
    title: 'HOME',
    icon: LayoutDashboard,
    href: '',
    subheader: 'HOME',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    id: 'management-section',
    title: 'MANAGEMENT',
    icon: Settings,
    href: '',
    subheader: 'MANAGEMENT',
  },
  {
    id: 'quick-management',
    title: 'Quick Management',
    icon: Zap,
    href: '/admin/quick-management',
  },
  {
    id: 'fleet-management',
    title: 'Fleet Management',
    icon: Car,
    href: '/admin/fleet-management',
  },
  {
    id: 'user-management',
    title: 'User Management',
    icon: Users,
    href: '/admin/user-management',
  },
  {
    id: 'contract-management',
    title: 'Contract Management',
    icon: FileText,
    href: '/admin/contract-management',
  },
  {
    id: 'inventory-management',
    title: 'Inventory Management',
    icon: Package,
    href: '/admin/inventory-management',
  },
  {
    id: 'analytics-section',
    title: 'ANALYTICS',
    icon: BarChart3,
    href: '',
    subheader: 'ANALYTICS',
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: BarChart3,
    href: '/admin/reports',
  },
  {
    id: 'settings-section',
    title: 'SETTINGS',
    icon: Settings,
    href: '',
    subheader: 'SETTINGS',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    href: '/admin/settings',
  },
]