// Backend Inventory API Response Types
import { Supplier, Vehicle } from '@/types/common';

export interface InventoryItem {
  vehicle: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  location: string;
  last_inspection: string | null;
  next_inspection: string | null;
  purchase_date: string | null;
  purchase_price: string | null;
  current_value: string | null;
  maintenance_cost: string | null;

  // Vehicle details (from serializer)
  vehicle_details: Vehicle;
  make: string;
  model: string;
  year: number;
  category: string;
  daily_rate: string;
  registration_number: string;

  // Stock calculations
  total_stock: number;
  available: number;
  rented: number;
  maintenance: number;
  features: string[];
}

export interface VehicleDetailedInfo {
  vehicle_info: InventoryItem;
  contracts_history: ContractHistory[];
  analytics: VehicleAnalytics;
  maintenance_records: MaintenanceRecord[];
  location_history: LocationHistory[];
  documents: VehicleDocument[];
  performance_metrics: PerformanceMetrics;
}

export interface ContractHistory {
  id: number;
  client_name: string;
  driver_name: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface VehicleAnalytics {
  total_revenue: number;
  monthly_revenue: number;
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  avg_rental_duration: number;
  utilization_rate: number;
  monthly_bookings: number;
}

export interface MaintenanceRecord {
  id: number;
  service_type: string;
  date: string;
  cost: number;
  status: string;
  description: string;
}

export interface LocationHistory {
  location: string;
  date: string;
  duration: string;
  is_current: boolean;
}

export interface VehicleDocument {
  type: string;
  status: string;
  expires_at: string;
  status_color: string;
}

export interface PerformanceMetrics {
  average_rating: number;
  total_kilometers: number;
  fuel_efficiency: number;
  maintenance_cost_per_km: number;
  downtime_days: number;
}

// Parts API Types
export interface Part {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: number | null;
  category_name?: string;
  category_details?: PartCategory;
  unit: 'PIECE' | 'SET' | 'LITER' | 'KILOGRAM' | 'METER' | 'PAIR';
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost: string;
  selling_price: string | null;
  supplier: number | null;
  supplier_name?: string;
  supplier_details?: Supplier;
  location: string | null;
  is_low_stock: boolean;
  stock_value: string;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  created_by_name?: string;
  recent_usages?: StockUsage[];
}

export interface PartCategory {
  id: number;
  name: string;
  description: string | null;
  parts_count: number;
  created_at: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  tax_number?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  payment_terms?: string | null;
  notes?: string | null;
  total_orders: number;
  parts_supplied: number;
  on_time_deliveries: number;
  quality_issues: number;
  average_lead_time?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateInventorySupplier {
  name: string;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  tax_number?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  payment_terms?: string | null;
  notes?: string | null;
}

export interface SupplierStats {
  total_suppliers?: number;
  active_suppliers?: number;
  total_parts?: number;
  recent_orders?: number;
}

// Stock Usage Types


// Stock Adjustment Types
export interface StockAdjustment {
  id: string;
  part: number;
  part_name: string;
  part_sku: string;
  adjustment_type: 'PURCHASE' | 'RETURN' | 'CORRECTION' | 'DAMAGE' | 'LOSS';
  quantity: number;
  reason: string;
  reference_number: string | null;
  adjusted_by: number | null;
  adjusted_by_name?: string;
  adjusted_at: string;
}

export interface CreateStockAdjustment {
  part: number;
  adjustment_type: 'PURCHASE' | 'RETURN' | 'CORRECTION' | 'DAMAGE' | 'LOSS';
  quantity: number;
  reason: string;
  reference_number?: string;
}

// Dashboard and Reports Types
export interface InventoryDashboardMetrics {
  total_vehicles: number;
  available_vehicles: number;
  hired_vehicles: number;
  in_garage_vehicles: number;
  active_rentals: number;
  utilization_rate: number;
  total_parts: number;
  low_stock_alerts: number;
  total_stock_value: number;
  monthly_expenses: number;
}

export interface InventoryReports {
  summary: {
    total_items: number;
    total_purchase_value: number;
    total_current_value: number;
    depreciation_amount: number;
    depreciation_percentage: number;
  };
  condition_breakdown: Array<{
    condition: string;
    count: number;
    percentage: number;
  }>;
  location_breakdown: Array<{
    location: string;
    count: number;
    total_value: number;
    percentage: number;
  }>;
}

export interface VehicleUtilizationReport {
  start_date: string;
  end_date: string;
  vehicles: Array<{
    vehicle_id: number;
    registration_number: string;
    make: string;
    model: string;
    total_contracts: number;
    active_contracts: number;
    completed_contracts: number;
    total_revenue: number;
    utilization_rate: number;
  }>;
  summary: {
    total_vehicles: number;
    total_contracts: number;
    total_revenue: number;
    avg_utilization: number;
  };
}

export interface PartsConsumptionReport {
  start_date: string;
  end_date: string;
  parts: Array<{
    part_id: number;
    part_name: string;
    part_sku: string;
    total_quantity: number;
    usage_count: number;
    total_cost: number;
  }>;
  summary: {
    total_parts_used: number;
    total_quantity: number;
    total_cost: number;
  };
}

export interface StockValueReport {
  categories: Array<{
    category: string;
    total_value: number;
    parts_count: number;
    percentage: number;
  }>;
  location_breakdown?: Array<{
    location: string;
    total_value: number;
    parts_count: number;
    percentage: number;
  }>;
  summary: {
    total_value: number;
    total_parts: number;
    total_categories: number;
  };
}

export interface LowStockAlertsReport {
  alerts: Array<{
    part_id: number;
    sku: string;
    name: string;
    category: string | null;
    current_stock: number;
    min_stock_level: number;
    shortage: number;
    unit_cost: number;
    reorder_cost: number;
    supplier: string | null;
    is_out_of_stock: boolean;
  }>;
  summary: {
    total_alerts: number;
    out_of_stock_count: number;
    total_reorder_cost: number;
  };
}

export interface ExpenseSummaryReport {
  start_date: string;
  end_date: string;
  vehicles: Array<{
    vehicle_id: number;
    registration_number: string;
    make: string;
    model: string;
    parts_cost: number;
    parts_count: number;
    maintenance_cost?: number;
    total_expense: number;
  }>;
  summary: {
    total_vehicles: number;
    total_parts_cost: number;
    total_maintenance_cost: number;
    total_expenses: number;
  };
}

// Generic API Response Types
export interface ApiResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ApiError {
  detail?: string;
  error?: string;
  [key: string]: any;
}

// Stock Usage Types
export interface StockUsage {
  id: string;
  part: number;
  part_name?: string;
  part_sku?: string;
  vehicle?: number | null;
  vehicle_registration?: string;
  usage_type: 'MAINTENANCE' | 'SALE' | 'INTERNAL' | 'DAMAGE';
  quantity_used: number;
  unit?: string;
  unit_cost?: string;
  total_cost?: string;
  used_by: string;
  used_at: string;
  reference_number?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  created_by_name?: string;
}

export interface CreateStockUsage {
  part: number;
  vehicle?: number | null;
  usage_type: 'MAINTENANCE' | 'SALE' | 'INTERNAL' | 'DAMAGE';
  quantity_used: number;
  used_by: string;
  used_at: string;
  reference_number?: string | null;
  notes?: string | null | undefined;
}

export interface StockUsageStats {
  total_usage_records?: number;
  total_quantity_used?: number;
  total_usage_value?: string;
  recent_usage_count?: number;
}

// Filter and Search Types
export interface InventoryFilters {
  condition?: string;
  search?: string;
  ordering?: string;
}

export interface PartsFilters {
  category?: number;
  supplier?: number;
  unit?: string;
  search?: string;
  ordering?: string;
}

export interface StockUsageFilters {
  vehicle?: number;
  part?: number;
  technician?: number;
  usage_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  ordering?: string;
}

export interface ReportDateRange {
  start_date?: string;
  end_date?: string;
}

// Additional Report interfaces for the comprehensive Reports system
export interface InventoryReport {
  id?: number;
  name?: string;
  type?: 'inventory' | 'stock-value' | 'vehicle-utilization' | 'parts-consumption' | 'inventory-turnover' | 'supplier-performance';
  generated_date?: string;
  total_items?: number;
  total_value?: string;
  low_stock_items?: number;
  out_of_stock_items?: number;
  data?: any;
  filters?: {
    date_from?: string;
    date_to?: string;
    categories?: number[];
    suppliers?: number[];
    vehicle_types?: string[];
  };
}

export interface InventoryTurnoverReport {
  part_id?: number;
  part_name?: string;
  category?: string;
  turnover_rate?: number;
  average_stock?: number;
  total_usage?: number;
  last_restocked?: string;
  status?: 'excellent' | 'good' | 'average' | 'poor';
  // Aggregate properties for summary
  average_turnover_rate?: number;
  fast_moving_items?: number;
  slow_moving_items?: number;
}

export interface SupplierPerformanceReport {
  supplier_id?: number;
  supplier_name?: string;
  total_orders?: number;
  on_time_deliveries?: number;
  quality_issues?: number;
  average_delivery_time?: number;
  rating?: number;
  performance_trend?: 'improving' | 'stable' | 'declining';
  // Aggregate properties for summary
  suppliers?: Array<{
    supplier_id: number;
    supplier_name: string;
    rating: number;
  }>;
  average_rating?: number;
  average_on_time_rate?: number;
}

export interface CreateReport {
  name: string;
  type: string;
  filters?: {
    date_from?: string;
    date_to?: string;
    categories?: number[];
    suppliers?: number[];
    vehicle_types?: string[];
  };
}