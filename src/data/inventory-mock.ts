// Legacy inventory mock data - deprecated
// This file is kept for backward compatibility but should not be used for new features
// Use the new API functions from @/lib/api instead

console.warn('inventory-mock.ts is deprecated. Use real API functions from @/lib/api instead.')

// Export empty arrays to prevent breaking existing imports
export const mockVehicleInventory: any[] = []
export const mockParts: any[] = []
export const mockStockUsage: any[] = []
export const mockInventoryDashboardStats = {
  totalVehicles: 0,
  availableVehicles: 0,
  rentedVehicles: 0,
  maintenanceVehicles: 0,
  totalParts: 0,
  lowStockParts: 0,
  outOfStockParts: 0,
  totalStockValue: 0,
  monthlyUsage: 0,
  topUsedParts: [],
}
export const mockUsageAnalytics = {
  totalUsage: 0,
  usageByCategory: [],
  usageByVehicle: [],
  usageByMonth: [],
  topTechnicians: [],
}


