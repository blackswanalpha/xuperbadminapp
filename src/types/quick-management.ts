/**
 * Type definitions for Quick Management module
 */

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue'
export type ExpenseStatus = 'Approved' | 'Pending' | 'Rejected'
export type ExpenseCategory = 'Service' | 'Bodywork' | 'Mechanical'

export interface Invoice {
  id: string
  clientId: string
  clientName: string
  amount: number
  status: InvoiceStatus
  date: string
  dueDate: string
  lineItems: InvoiceLineItem[]
  tax: number
  total: number
  createdAt: string
  updatedAt: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Expense {
  id: string
  category: ExpenseCategory
  vehicleId: string
  vehicleName: string
  description: string
  amount: number
  status: ExpenseStatus
  date: string
  receiptUrl?: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface QuickManagementStats {
  totalInvoices: number
  totalExpenses: number
  netRevenue: number
  pendingItems: number
  totalRevenue: number
  pendingInvoices: number
  thisMonthRevenue: number
}

export interface ActivityItem {
  id: string
  type: 'invoice' | 'expense'
  action: string
  time: string
  status: InvoiceStatus | ExpenseStatus
}

