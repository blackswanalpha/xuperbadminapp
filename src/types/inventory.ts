// Inventory Management Types

export type ItemCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor'
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'
export type PartCategory = 'Engine Parts' | 'Brake System' | 'Suspension' | 'Electrical' | 'Body Parts' | 'Fluids' | 'Filters' | 'Tires' | 'Interior' | 'Accessories'
export type PartUnit = 'Piece' | 'Set' | 'Liter' | 'Kilogram' | 'Meter' | 'Box'
export type AdjustmentType = 'Purchase' | 'Return' | 'Correction' | 'Damage' | 'Loss'

// Vehicle Inventory Item
export interface VehicleInventoryItem {
  id: string
  vehicleId: string
  registrationNumber: string
  make: string
  model: string
  year: number
  condition: ItemCondition
  location: string
  lastInspection: string | null
  nextInspection: string | null
  purchaseDate: string | null
  purchasePrice: number | null
  currentValue: number | null
  maintenanceCost: number
  status: StockStatus
}

// Part
export interface Part {
  id: string
  sku: string
  name: string
  description: string
  category: PartCategory
  unit: PartUnit
  currentStock: number
  minStockLevel: number
  maxStockLevel: number
  unitCost: number
  sellingPrice: number | null
  supplier: string | null
  location: string
  isLowStock: boolean
  stockValue: number
  lastUpdated: string
}

// Stock Usage
export interface StockUsage {
  id: string
  vehicleId: string
  vehicleRegistration: string
  partId: string
  partName: string
  partSku: string
  quantity: number
  usageDate: string
  technicianId: string | null
  technicianName: string | null
  notes: string | null
  workOrderNumber: string | null
}

// Stock Adjustment
export interface StockAdjustment {
  id: string
  partId: string
  partName: string
  partSku: string
  adjustmentType: AdjustmentType
  quantity: number
  reason: string
  referenceNumber: string | null
  adjustedBy: string
  adjustedAt: string
}

// Dashboard Statistics
export interface InventoryDashboardStats {
  totalVehicles: number
  availableVehicles: number
  rentedVehicles: number
  maintenanceVehicles: number
  totalParts: number
  lowStockParts: number
  outOfStockParts: number
  totalStockValue: number
  monthlyUsage: number
  topUsedParts: Array<{ partName: string; quantity: number }>
}

// Usage Analytics
export interface UsageAnalytics {
  totalUsage: number
  usageByCategory: Array<{ category: string; quantity: number; percentage: number }>
  usageByVehicle: Array<{ vehicleRegistration: string; quantity: number }>
  usageByMonth: Array<{ month: string; quantity: number }>
  topTechnicians: Array<{ name: string; usageCount: number }>
}

