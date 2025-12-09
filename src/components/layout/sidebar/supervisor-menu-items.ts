/**
 * Supervisor Sidebar Menu Items Configuration
 * Defines the navigation structure for the supervisor dashboard
 */

import {
  LayoutDashboard,
  CheckSquare,
  Car,
  Users,
  FileText,
  Package,
  BarChart3,
  AlertTriangle,
  Wrench,
  ClipboardList,
  Hammer,
  Settings,
  History,
  FileBarChart,
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

export const supervisorMenuItems: MenuItem[] = [
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
    href: '/supervisor',
  },
  {
    id: 'approval-section',
    title: 'APPROVALS',
    icon: CheckSquare,
    href: '',
    subheader: 'APPROVALS',
  },
  {
    id: 'contract-approvals',
    title: 'Contract Approvals',
    icon: FileText,
    href: '/supervisor/contract-approvals',
  },
  {
    id: 'expense-approvals',
    title: 'Expense Approvals',
    icon: CheckSquare,
    href: '/supervisor/expense-approvals',
  },
  {
    id: 'oversight-section',
    title: 'OVERSIGHT',
    icon: AlertTriangle,
    href: '',
    subheader: 'OVERSIGHT',
  },
  {
    id: 'fleet-monitoring',
    title: 'Fleet Monitoring',
    icon: Car,
    href: '/supervisor/fleet-monitoring',
  },
  {
    id: 'maintenance-oversight',
    title: 'Maintenance Oversight',
    icon: Wrench,
    href: '/supervisor/maintenance-oversight',
  },
  {
    id: 'inventory-oversight',
    title: 'Inventory Oversight',
    icon: Package,
    href: '/supervisor/inventory-oversight',
  },
  {
    id: 'analytics-section',
    title: 'ANALYTICS',
    icon: BarChart3,
    href: '',
    subheader: 'ANALYTICS',
  },
  {
    id: 'performance-reports',
    title: 'Performance Reports',
    icon: BarChart3,
    href: '/supervisor/performance-reports',
  },
  {
    id: 'garage-section',
    title: 'GARAGE',
    icon: Wrench,
    href: '',
    subheader: 'GARAGE',
  },
  {
    id: 'garage-overview',
    title: 'Overview',
    icon: LayoutDashboard,
    href: '/supervisor/garage/overview',
  },
  {
    id: 'garage-job-cards',
    title: 'Job Cards',
    icon: ClipboardList,
    href: '/supervisor/garage/job-cards',
  },
  {
    id: 'garage-vehicles',
    title: 'Customer Vehicles',
    icon: Car,
    href: '/supervisor/garage/vehicles',
  },
  {
    id: 'garage-equipment',
    title: 'Equipment',
    icon: Hammer,
    href: '/supervisor/garage/equipment',
  },
  {
    id: 'garage-parts',
    title: 'Parts',
    icon: Settings,
    href: '/supervisor/garage/parts',
  },
  {
    id: 'garage-stock-usage',
    title: 'Stock Usage',
    icon: History,
    href: '/supervisor/garage/stock-usage',
  },
  {
    id: 'garage-reports',
    title: 'Reports',
    icon: FileBarChart,
    href: '/supervisor/garage/reports',
  },
]