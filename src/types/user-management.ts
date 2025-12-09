/**
 * Type definitions for User Management module
 */

export type UserRole = 'Admin' | 'Supervisor' | 'Agent' | 'Client' | 'Driver'
export type UserStatus = 'Active' | 'Inactive' | 'Suspended'
export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type LoanStatus = 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Defaulted'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  branchId?: string
  profileImageUrl?: string
  lastLogin?: string
  createdAt: string
  updatedAt?: string
}

export interface ClientUser extends User {
  role: 'Client'
  idNumber?: string
  physicalAddress?: string
  totalContracts: number
  activeContracts: number
  totalSpent: number
  loyaltyPoints: number
  loyaltyTier: LoyaltyTier
}

export interface LoyaltyPoints {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  totalPoints: number
  pointsEarned: number
  pointsRedeemed: number
  currentTier: LoyaltyTier
  pointsToNextTier: number
  nextTier: LoyaltyTier
  tierBenefits: string[]
  lastTransaction?: string
  lastUpdated: string
  createdAt: string
}

export interface LoyaltyTransaction {
  id: string
  clientId: string
  clientName: string
  points: number
  type: 'Earned' | 'Redeemed' | 'Expired' | 'Adjusted'
  reason: string
  balanceAfter: number
  referenceId?: string
  createdBy: string
  createdAt: string
}

export interface LoanApplication {
  id: string
  loanNumber: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  amount: number
  purpose: string
  status: LoanStatus
  interestRate: number
  term: number // in months
  monthlyPayment: number
  totalRepayment: number
  amountPaid: number
  amountRemaining: number
  applicationDate: string
  approvalDate?: string
  disbursementDate?: string
  dueDate?: string
  approvedBy?: string
  rejectionReason?: string
  collateral?: string
  guarantorName?: string
  guarantorPhone?: string
  createdAt: string
  updatedAt?: string
}

export interface UserDashboardStats {
  totalClients: number
  activeClients: number
  newClientsThisMonth: number
  totalLoyaltyPoints: number
  averageLoyaltyPoints: number
  topTierClients: number
}

export interface LoanDashboardStats {
  totalLoans: number
  activeLoans: number
  pendingLoans: number
  approvedLoans: number
  rejectedLoans: number
  totalDisbursed: number
  totalRepaid: number
  totalOutstanding: number
  defaultRate: number
}

