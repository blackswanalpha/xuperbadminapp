import api from './axios';

import { Supplier, Vehicle } from '@/types/common';
export type { Supplier, Vehicle };

export const fetchVehicles = async (): Promise<Vehicle[]> => {
    try {
        const response = await api.get('/vehicles/');
        // API returns paginated response with results array
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
    }
};

export const fetchVehicle = async (id: number): Promise<Vehicle> => {
    try {
        const response = await api.get(`/vehicles/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        throw error;
    }
};

export const createVehicle = async (data: Partial<Vehicle>): Promise<Vehicle> => {
    try {
        const response = await api.post('/vehicles/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating vehicle:', error);
        throw error;
    }
};

export const updateVehicle = async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
    try {
        const response = await api.put(`/vehicles/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating vehicle:', error);
        throw error;
    }
};

export const deleteVehicle = async (id: number): Promise<void> => {
    try {
        await api.delete(`/vehicles/${id}/`);
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        throw error;
    }
};

export const fetchSuppliers = async (): Promise<Supplier[]> => {
    try {
        const response = await api.get('/suppliers/', {
            params: { is_active: true }
        });
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
    }
};

export const createSupplier = async (data: Partial<Supplier>): Promise<Supplier> => {
    try {
        const response = await api.post('/suppliers/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating supplier:', error);
        throw error;
    }
};

export const fetchVehicleStatistics = async () => {
    try {
        const response = await api.get('/vehicles/statistics/');
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle statistics:', error);
        throw error;
    }
};

export const fetchVehicleFinancialSummary = async (id: number) => {
    try {
        const response = await api.get(`/vehicles/${id}/financial_summary/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle financial summary:', error);
        throw error;
    }
};

// Dashboard API functions
export interface DashboardStats {
    pending_approvals: number;
    vehicle_expenses: number;
    fleet_utilization: number;
    active_contracts: number;
    contracts_created_today: number;
    today_revenue: number;
    weekly_revenue: number;
    monthly_revenue: number;
    weekly_revenue_data: number[];
    total_vehicles: number;
    available_vehicles: number;
    rented_vehicles: number;
    maintenance_vehicles: number;
    timestamp: string;
}

export interface ExpenseStatistics {
    total_expenses: number;
    total_amount: number;
    monthly_expenses: number;
    monthly_amount: number;
    status_breakdown: Array<{ status: string; count: number }>;
    category_breakdown: Array<{ category__name: string; count: number; total_amount: number }>;
    expense_trend: Array<{ month: string; amount: number }>;
}

export interface Activity {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    time: string;
    icon: string;
    color: string;
    user?: {
        name: string;
        email: string;
    };
}

export interface RecentActivitiesResponse {
    activities: Activity[];
    timestamp: string;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await api.get('/dashboard/stats/');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

export const fetchRecentActivities = async (): Promise<RecentActivitiesResponse> => {
    try {
        const response = await api.get('/dashboard/activities/');
        return response.data;
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        throw error;
    }
};

// Inventory Management API Functions
import {
    InventoryItem,
    VehicleDetailedInfo,
    Part,
    PartCategory,
    InventorySupplier,
    CreateInventorySupplier,
    StockUsage,
    CreateStockUsage,
    StockAdjustment,
    CreateStockAdjustment,
    InventoryDashboardMetrics,
    InventoryReports,
    VehicleUtilizationReport,
    PartsConsumptionReport,
    StockValueReport,
    LowStockAlertsReport,
    ExpenseSummaryReport,
    ApiResponse,
    InventoryFilters,
    PartsFilters,
    StockUsageFilters,
    ReportDateRange,
    StockUsageStats,
    SupplierStats,
    InventoryReport,
    InventoryTurnoverReport,
    SupplierPerformanceReport,
} from '@/types/inventory-api';

export * from '@/types/inventory-api';

// Inventory Items API
export const fetchInventoryItems = async (filters?: InventoryFilters): Promise<ApiResponse<InventoryItem>> => {
    try {
        const params = new URLSearchParams();
        if (filters?.condition) params.append('condition', filters.condition);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.ordering) params.append('ordering', filters.ordering);

        const response = await api.get(`/inventory/vehicles/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        throw error;
    }
};

export const fetchInventoryItem = async (vehicleId: number): Promise<InventoryItem> => {
    try {
        const response = await api.get(`/inventory/vehicles/${vehicleId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        throw error;
    }
};

export const fetchVehicleDetailedInfo = async (vehicleId: number): Promise<VehicleDetailedInfo> => {
    try {
        const response = await api.get(`/inventory/vehicles/${vehicleId}/detailed_info/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching detailed vehicle info:', error);
        throw error;
    }
};

export const updateInventoryItem = async (vehicleId: number, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    try {
        const response = await api.put(`/inventory/vehicles/${vehicleId}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating inventory item:', error);
        throw error;
    }
};

export const deleteInventoryItem = async (vehicleId: number): Promise<void> => {
    try {
        await api.delete(`/inventory/vehicles/${vehicleId}/`);
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        throw error;
    }
};

// Inventory Dashboard API
export const fetchInventoryDashboard = async (): Promise<InventoryDashboardMetrics> => {
    try {
        const response = await api.get('/inventory/vehicles/dashboard_summary/');
        return response.data.metrics;
    } catch (error) {
        console.error('Error fetching inventory dashboard:', error);
        throw error;
    }
};

export const fetchInventoryLocations = async (): Promise<{ locations: string[]; count: number }> => {
    try {
        const response = await api.get('/inventory/vehicles/locations/');
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory locations:', error);
        throw error;
    }
};

// Parts API
export const fetchParts = async (filters?: PartsFilters): Promise<ApiResponse<Part>> => {
    try {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category.toString());
        if (filters?.supplier) params.append('supplier', filters.supplier.toString());
        if (filters?.unit) params.append('unit', filters.unit);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.ordering) params.append('ordering', filters.ordering);

        const response = await api.get(`/inventory/parts/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching parts:', error);
        throw error;
    }
};

export const fetchPart = async (partId: string): Promise<Part> => {
    try {
        const response = await api.get(`/inventory/parts/${partId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching part:', error);
        throw error;
    }
};

export const createPart = async (data: Partial<Part>): Promise<Part> => {
    try {
        const response = await api.post('/inventory/parts/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating part:', error);
        throw error;
    }
};

export const updatePart = async (partId: string, data: Partial<Part>): Promise<Part> => {
    try {
        const response = await api.put(`/inventory/parts/${partId}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating part:', error);
        throw error;
    }
};

export const deletePart = async (partId: string): Promise<void> => {
    try {
        await api.delete(`/inventory/parts/${partId}/`);
    } catch (error) {
        console.error('Error deleting part:', error);
        throw error;
    }
};

export const fetchLowStockParts = async (): Promise<Part[]> => {
    try {
        const response = await api.get('/inventory/parts/low_stock/');
        return response.data;
    } catch (error) {
        console.error('Error fetching low stock parts:', error);
        throw error;
    }
};

export const fetchPartsStockSummary = async () => {
    try {
        const response = await api.get('/inventory/parts/stock_summary/');
        return response.data;
    } catch (error) {
        console.error('Error fetching parts stock summary:', error);
        throw error;
    }
};

export const adjustPartStock = async (partId: string, data: CreateStockAdjustment): Promise<StockAdjustment> => {
    try {
        const response = await api.post(`/inventory/parts/${partId}/adjust_stock/`, data);
        return response.data;
    } catch (error) {
        console.error('Error adjusting part stock:', error);
        throw error;
    }
};

// Part Categories API
export const fetchPartCategories = async (): Promise<ApiResponse<PartCategory>> => {
    try {
        const response = await api.get('/inventory/categories/');
        return response.data;
    } catch (error) {
        console.error('Error fetching part categories:', error);
        throw error;
    }
};

export const createPartCategory = async (data: Partial<PartCategory>): Promise<PartCategory> => {
    try {
        const response = await api.post('/inventory/categories/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating part category:', error);
        throw error;
    }
};

// Suppliers API (Inventory)
export const fetchInventorySuppliers = async (): Promise<ApiResponse<InventorySupplier>> => {
    try {
        const response = await api.get('/inventory/suppliers/');
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory suppliers:', error);
        throw error;
    }
};

export const createInventorySupplier = async (data: CreateInventorySupplier): Promise<InventorySupplier> => {
    try {
        const response = await api.post('/inventory/suppliers/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating inventory supplier:', error);
        throw error;
    }
};

export const fetchInventorySupplier = async (supplierId: string): Promise<InventorySupplier> => {
    try {
        const response = await api.get(`/inventory/suppliers/${supplierId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory supplier:', error);
        throw error;
    }
};

export const updateInventorySupplier = async (supplierId: string, data: Partial<InventorySupplier>): Promise<InventorySupplier> => {
    try {
        const response = await api.patch(`/inventory/suppliers/${supplierId}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating inventory supplier:', error);
        throw error;
    }
};

export const deleteInventorySupplier = async (supplierId: string): Promise<void> => {
    try {
        await api.delete(`/inventory/suppliers/${supplierId}/`);
    } catch (error) {
        console.error('Error deleting inventory supplier:', error);
        throw error;
    }
};

export const fetchSupplierStats = async (): Promise<SupplierStats> => {
    try {
        const response = await api.get('/inventory/suppliers/stats/');
        return response.data;
    } catch (error) {
        console.error('Error fetching supplier stats:', error);
        // Return default values to avoid UI crash if endpoint doesn't exist yet
        return {
            total_suppliers: 0,
            active_suppliers: 0,
            total_parts: 0,
            recent_orders: 0,
        };
    }
};

// Stock Usage API
export const fetchStockUsage = async (filters?: StockUsageFilters): Promise<ApiResponse<StockUsage>> => {
    try {
        const params = new URLSearchParams();
        if (filters?.vehicle) params.append('vehicle', filters.vehicle.toString());
        if (filters?.part) params.append('part', filters.part.toString());
        if (filters?.technician) params.append('technician', filters.technician.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.ordering) params.append('ordering', filters.ordering);

        const response = await api.get(`/inventory/stock-usage/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock usage:', error);
        throw error;
    }
};

export const fetchStockUsageDetail = async (usageId: string): Promise<StockUsage> => {
    try {
        const response = await api.get(`/inventory/stock-usage/${usageId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock usage detail:', error);
        throw error;
    }
};

export const createStockUsage = async (data: CreateStockUsage): Promise<StockUsage> => {
    try {
        const response = await api.post('/inventory/stock-usage/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating stock usage:', error);
        throw error;
    }
};

export const fetchStockUsageByVehicle = async (vehicleId: number): Promise<StockUsage[]> => {
    try {
        const response = await api.get(`/inventory/stock-usage/by_vehicle/?vehicle_id=${vehicleId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock usage by vehicle:', error);
        throw error;
    }
};

export const fetchStockUsageByPart = async (partId: string): Promise<StockUsage[]> => {
    try {
        const response = await api.get(`/inventory/stock-usage/by_part/?part_id=${partId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock usage by part:', error);
        throw error;
    }
};

export const fetchStockUsageStats = async (): Promise<StockUsageStats> => {
    try {
        const response = await api.get('/inventory/stock-usage/stats/');
        return response.data;
    } catch (error) {
        console.error('Error fetching stock usage stats:', error);
        // Return default values to avoid UI crash if endpoint doesn't exist yet
        return {
            total_usage_records: 0,
            total_quantity_used: 0,
            total_usage_value: '0',
            recent_usage_count: 0,
        };
    }
};

// Stock Adjustments API
export const fetchStockAdjustments = async (): Promise<ApiResponse<StockAdjustment>> => {
    try {
        const response = await api.get('/inventory/stock-adjustments/');
        return response.data;
    } catch (error) {
        console.error('Error fetching stock adjustments:', error);
        throw error;
    }
};

export const createStockAdjustment = async (data: CreateStockAdjustment): Promise<StockAdjustment> => {
    try {
        const response = await api.post('/inventory/stock-adjustments/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating stock adjustment:', error);
        throw error;
    }
};

// Inventory Reports API
export const fetchInventoryReports = async (): Promise<InventoryReports> => {
    try {
        const response = await api.get('/inventory/vehicles/reports/');
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory reports:', error);
        throw error;
    }
};

export const fetchVehicleUtilizationReport = async (dateRange?: ReportDateRange): Promise<VehicleUtilizationReport> => {
    try {
        const params = new URLSearchParams();
        if (dateRange?.start_date) params.append('start_date', dateRange.start_date);
        if (dateRange?.end_date) params.append('end_date', dateRange.end_date);

        const response = await api.get(`/inventory/reports/vehicle_utilization/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle utilization report:', error);
        throw error;
    }
};

export const fetchPartsConsumptionReport = async (dateRange?: ReportDateRange): Promise<PartsConsumptionReport> => {
    try {
        const params = new URLSearchParams();
        if (dateRange?.start_date) params.append('start_date', dateRange.start_date);
        if (dateRange?.end_date) params.append('end_date', dateRange.end_date);

        const response = await api.get(`/inventory/reports/parts_consumption/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching parts consumption report:', error);
        throw error;
    }
};

export const fetchStockValueReport = async (): Promise<StockValueReport> => {
    try {
        const response = await api.get('/inventory/reports/stock_value/');
        return response.data;
    } catch (error) {
        console.error('Error fetching stock value report:', error);
        throw error;
    }
};

export const fetchLowStockAlertsReport = async (): Promise<LowStockAlertsReport> => {
    try {
        const response = await api.get('/inventory/reports/low_stock_alerts/');
        return response.data;
    } catch (error) {
        console.error('Error fetching low stock alerts report:', error);
        throw error;
    }
};

export const fetchExpenseSummaryReport = async (dateRange?: ReportDateRange): Promise<ExpenseSummaryReport> => {
    try {
        const params = new URLSearchParams();
        if (dateRange?.start_date) params.append('start_date', dateRange.start_date);
        if (dateRange?.end_date) params.append('end_date', dateRange.end_date);

        const response = await api.get(`/inventory/reports/expense_summary/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching expense summary report:', error);
        throw error;
    }
};

export const fetchInventoryDashboardSummary = async (dateRange?: ReportDateRange): Promise<InventoryDashboardMetrics> => {
    try {
        const params = new URLSearchParams();
        if (dateRange?.start_date) params.append('start_date', dateRange.start_date);
        if (dateRange?.end_date) params.append('end_date', dateRange.end_date);

        const response = await api.get(`/inventory/reports/dashboard_summary/?${params.toString()}`);
        return response.data.metrics;
    } catch (error) {
        console.error('Error fetching inventory dashboard summary:', error);
        throw error;
    }
};

// Add more API functions here as needed

// Vehicle-related type definitions
export interface Contract {
    id: number;
    contract_number: string;
    client: { id: number; email: string; first_name?: string; last_name?: string };
    vehicle: number;
    start_date: string;
    end_date: string;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
    contract_type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    total_contract_value: string;
    amount_paid: string;
    balance_due: string;
    security_deposit: string | null;
    driver_name: string;
    created_at: string;
}

export interface DamageReport {
    id: number;
    vehicle: number;
    description: string;
    reported_date: string;
    status: 'PENDING' | 'UNDER_REPAIR' | 'REPAIRED';
    repair_cost: string | null;
    images: string[];
    reported_by: { id: number; email: string } | null;
    notes: string | null;
}

export interface MaintenanceRecord {
    id: string;
    vehicle: number;
    maintenance_type: 'routine' | 'repair' | 'inspection' | 'insurance';
    description: string;
    cost: string;
    scheduled_date: string;
    completed_date: string | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    notes: string | null;
}

export interface VehicleExpenseItem {
    id: string;
    vehicle: string; // Serializer returns ID as string/UUID mostly
    vehicle_registration?: string; // Read-only from backend
    vehicle_make?: string;
    vehicle_model?: string;
    category: string; // ID
    category_name: string; // Read-only
    type: 'Internal' | 'External';
    items: string[];
    item_costs: Record<string, number>;
    total_amount: number;
    notes?: string;
    status: 'pending' | 'approved' | 'rejected' | 'sent';
    created_at: string;
    supervisor?: number;
    supervisor_name?: string;
}

export interface Payment {
    id: number;
    contract: number | null;
    client: { id: number; email: string; first_name?: string; last_name?: string };
    amount: string;
    method: 'MPESA' | 'CARD' | 'BANK';
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    transaction_id: string | null;
    created_at: string;
}

// Vehicle data fetching functions
export const fetchPendingContracts = async (): Promise<Contract[]> => {
    try {
        const response = await api.get('/contracts/?status=PENDING');
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching pending contracts:', error);
        throw error;
    }
};

export const fetchAllContracts = async (filters?: { status?: string; search?: string }): Promise<Contract[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/contracts/?${params.toString()}`);
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching all contracts:', error);
        throw error;
    }
};

export const updateContract = async (id: number, data: Partial<Contract>): Promise<Contract> => {
    try {
        const response = await api.patch(`/contracts/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating contract:', error);
        throw error;
    }
};

export const deleteContract = async (id: number): Promise<void> => {
    try {
        await api.delete(`/contracts/${id}/`);
    } catch (error) {
        console.error('Error deleting contract:', error);
        throw error;
    }
};

export const fetchVehicleContracts = async (vehicleId: number): Promise<Contract[]> => {
    try {
        const response = await api.get(`/contracts/?vehicle=${vehicleId}`);
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching vehicle contracts:', error);
        throw error;
    }
};

export const fetchVehicleDamageReports = async (vehicleId: number): Promise<DamageReport[]> => {
    try {
        const response = await api.get(`/vehicles/${vehicleId}/damage-reports/`);
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching damage reports:', error);
        throw error;
    }
};

export const fetchVehicleMaintenance = async (vehicleId: number): Promise<MaintenanceRecord[]> => {
    try {
        const response = await api.get(`/maintenance/?vehicle_id=${vehicleId}`);
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching maintenance records:', error);
        throw error;
    }
};

export const createMaintenanceRecord = async (data: any): Promise<MaintenanceRecord> => {
    try {
        const response = await api.post('/maintenance/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating maintenance record:', error);
        throw error;
    }
};


export const fetchMaintenanceRecords = async (filters?: {
    status?: string;
    maintenance_type?: string;
    search?: string;
}): Promise<MaintenanceRecord[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.maintenance_type) params.append('maintenance_type', filters.maintenance_type);
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/maintenance/?${params.toString()}`);
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching maintenance records:', error);
        throw error;
    }
};


export const fetchVehicleExpenses = async (vehicleId: number): Promise<VehicleExpenseItem[]> => {
    try {
        const response = await api.get(`/vehicle-expenses/?vehicle_id=${vehicleId}`);
        return response.data.results || response.data;
    } catch (error) {
        throw error;
    }
};

export interface CreateVehicleExpensePayload {
    vehicle_id: string; // Serializer expects string/UUID
    category_name: string;
    type: 'Internal' | 'External';
    items: string[]; // List of item names
    item_costs: Record<string, number>; // Map of item names to costs
    total_amount: number;
    notes?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'sent';
}

export const createVehicleExpense = async (data: CreateVehicleExpensePayload): Promise<VehicleExpenseItem> => {
    try {
        const response = await api.post('/vehicle-expenses/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating vehicle expense:', error);
        throw error;
    }
};

export const fetchVehicleExpense = async (id: string): Promise<VehicleExpenseItem> => {
    try {
        const response = await api.get(`/vehicle-expenses/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle expense:', error);
        throw error;
    }
};

export const updateVehicleExpense = async (id: string, data: Partial<CreateVehicleExpensePayload>): Promise<VehicleExpenseItem> => {
    try {
        const response = await api.patch(`/vehicle-expenses/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating vehicle expense:', error);
        throw error;
    }
};

export const deleteVehicleExpense = async (id: string): Promise<void> => {
    try {
        await api.delete(`/vehicle-expenses/${id}/`);
    } catch (error) {
        console.error('Error deleting vehicle expense:', error);
        throw error;
    }
};

export interface ExpenseItem {
    id: string;
    name: string;
    category_name: string; // From serializer
    default_cost: number;
    is_active: boolean;
}

export const fetchExpenseItems = async (category?: string): Promise<ExpenseItem[]> => {
    try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);

        const response = await api.get(`/expense-items/?${params.toString()}`);
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching expense items:', error);
        throw error;
    }
};

export const fetchVehiclePayments = async (vehicleId: number): Promise<Payment[]> => {
    try {
        const response = await api.get(`/payments/?vehicle=${vehicleId}`);
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching vehicle payments:', error);
        throw error;
    }
};

// Vehicle Financial Analytics API functions
export interface VehicleIncomeData {
    vehicle_id: string;
    registration_number: string;
    total_deposits: number;
    total_payments: number;
    total_income: number;
    contracts_count: number;
    last_payment_date: string | null;
    currency: string;
}

export interface VehicleExpenseData {
    vehicle_id: string;
    registration_number: string;
    total_maintenance_expenses: number;
    total_parts_expenses: number;
    total_operational_expenses: number;
    total_expenses: number;
    expense_breakdown: Array<{
        category: string;
        amount: number;
        count: number;
    }>;
    currency: string;
}

export const fetchVehicleIncomeTotals = async (id: number): Promise<VehicleIncomeData> => {
    try {
        const response = await api.get(`/vehicles/${id}/income_totals/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle income totals:', error);
        throw error;
    }
};

export const fetchVehicleExpenseTotals = async (id: number): Promise<VehicleExpenseData> => {
    try {
        const response = await api.get(`/vehicles/${id}/expense_totals/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle expense totals:', error);
        throw error;
    }
};

// Advanced Financial Analytics API functions
export interface VehicleIncomeBreakdown {
    total_income: number;
    total_pending: number;
    contracts: Array<{
        contract_id: string;
        contract_number: string;
        client_name: string;
        start_date: string;
        end_date: string;
        total_value: number;
        amount_paid: number;
        balance_due: number;
        status: string;
    }>;
    payments: Array<{
        payment_id: string;
        amount: number;
        payment_date: string;
        method: string;
        status: string;
        contract_number: string;
    }>;
    income_trends: {
        monthly: Array<{ month: string; income: number; }>;
        weekly: Array<{ week: string; income: number; }>;
    };
}

export interface VehicleExpenseBreakdown {
    total_expenses: number;
    expenses_by_category: Array<{
        category: string;
        amount: number;
        count: number;
        percentage: number;
    }>;
    expenses_by_month: Array<{
        month: string;
        amount: number;
        count: number;
    }>;
    expenses_by_week: Array<{
        week: string;
        amount: number;
        count: number;
    }>;
}

export const fetchCombinedExpenses = async () => {
    try {
        const response = await api.get('/vehicle-expenses/');
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching combined expenses:', error);
        throw error;
    }
};

export const fetchExpenseStatistics = async (): Promise<ExpenseStatistics> => {
    try {
        const response = await api.get('/expense-statistics/');
        return response.data;
    } catch (error) {
        console.error('Error fetching expense statistics:', error);
        throw error;
    }
};

export interface VehicleProfitabilityAnalysis {
    vehicle_id: string;
    registration_number: string;
    financial_health: {
        expense_ratio_percentage: number;
        profit_margin_percentage: number;
        payback_period_months: number;
        is_profitable: boolean;
    };
    investment_analysis: {
        purchase_price: number;
        total_invested: number;
        total_returns: number;
        net_gain_loss: number;
        roi_percentage: number;
    };
    performance_metrics: {
        total_income: number;
        total_expenses: number;
        net_profit_loss: number;
        revenue_per_contract: number;
        utilization_rate: number;
    };
    time_analysis: {
        months_in_service: number;
        avg_monthly_income: number;
        avg_monthly_expenses: number;
        break_even_point: string | null;
        payback_period_months?: number;
    };
}

export const fetchVehicleIncomeBreakdown = async (id: number, startDate?: string, endDate?: string): Promise<VehicleIncomeBreakdown> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const response = await api.get(`/vehicles/${id}/income_breakdown/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle income breakdown:', error);
        throw error;
    }
};

export const fetchVehicleExpenseBreakdown = async (id: number, startDate?: string, endDate?: string): Promise<VehicleExpenseBreakdown> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const response = await api.get(`/vehicles/${id}/expenses_breakdown/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle expense breakdown:', error);
        throw error;
    }
};

export const fetchVehicleProfitabilityAnalysis = async (id: number): Promise<VehicleProfitabilityAnalysis> => {
    try {
        const response = await api.get(`/vehicles/${id}/profitability_analysis/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle profitability analysis:', error);
        throw error;
    }
};

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
    };
}

export const login = async (data: any): Promise<LoginResponse> => {
    try {
        const response = await api.post('/users/auth/login/', data);
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await api.post('/users/auth/logout/');
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

// Equipment Interfaces and APIs
export interface Equipment {
    id: number;
    name: string;
    description?: string;
    serial_number?: string;
    purchase_date?: string;
    cost: number;
    condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by: number;
    created_by_name: string;
}

export const fetchEquipmentList = async (): Promise<Equipment[]> => {
    try {
        const response = await api.get('/inventory/equipment/');
        return response.data;
    } catch (error) {
        console.error('Error fetching equipment list:', error);
        throw error;
    }
};

export const fetchEquipment = async (id: number): Promise<Equipment> => {
    try {
        const response = await api.get(`/inventory/equipment/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching equipment:', error);
        throw error;
    }
};

export const createEquipment = async (data: Partial<Equipment>): Promise<Equipment> => {
    try {
        const response = await api.post('/inventory/equipment/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating equipment:', error);
        throw error;
    }
};

export const updateEquipment = async (id: number, data: Partial<Equipment>): Promise<Equipment> => {
    try {
        const response = await api.patch(`/inventory/equipment/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating equipment:', error);
        throw error;
    }
};

export const deleteEquipment = async (id: number): Promise<void> => {
    try {
        await api.delete(`/inventory/equipment/${id}/`);
    } catch (error) {
        console.error('Error deleting equipment:', error);
        throw error;
    }
};

// Job Card Interfaces and APIs
export interface JobCard {
    id: number;
    job_card_number: string;
    date_created: string;
    client_name: string;
    client_phone?: string;
    client_email?: string;
    registration_number: string;
    make?: string;
    model?: string;
    speedometer_reading?: number;
    fuel_tank_level?: string;
    estimated_cost?: number;
    status: string;
    payment_status: string;
    total_job_value: number;
    balance_due: number;
    job_cost: number;
    // Add other relevant fields as needed
}

export const fetchJobCards = async (): Promise<JobCard[]> => {
    try {
        const response = await api.get('/job-cards/'); // Note: URL might need adjustment based on backend router
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching job cards:', error);
        throw error;
    }
};

export const fetchJobCard = async (id: number): Promise<JobCard> => {
    try {
        const response = await api.get(`/job-cards/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching job card:', error);
        throw error;
    }
};

export const createJobCard = async (data: any): Promise<JobCard> => {
    try {
        const response = await api.post('/job-cards/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating job card:', error);
        throw error;
    }
};

export const updateJobCard = async (id: number, data: any): Promise<JobCard> => {
    try {
        const response = await api.patch(`/job-cards/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating job card:', error);
        throw error;
    }
};

export const deleteJobCard = async (id: number): Promise<void> => {
    try {
        await api.delete(`/job-cards/${id}/`);
    } catch (error) {
        console.error('Error deleting job card:', error);
        throw error;
    }
};

export const fetchJobCardStatistics = async (): Promise<{ active_jobs: number; pending_approval: number }> => {
    try {
        const response = await api.get('/job-cards/statistics/');
        return response.data;
    } catch (error) {
        console.error('Error fetching job card stats:', error);
        // Return default values to avoid UI crash if endpoint doesn't exist yet
        return { active_jobs: 0, pending_approval: 0 };
    }
};

// Additional Reports API Functions
export const fetchInventoryReport = async (dateRange?: ReportDateRange): Promise<InventoryReport> => {
    try {
        const params = new URLSearchParams();
        if (dateRange?.start_date) params.append('start_date', dateRange.start_date);
        if (dateRange?.end_date) params.append('end_date', dateRange.end_date);

        const queryString = params.toString();
        const url = queryString ? `/inventory/reports/inventory/?${queryString}` : '/inventory/reports/inventory/';
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory report:', error);
        throw error;
    }
};

export const fetchInventoryTurnoverReport = async (dateRange?: ReportDateRange): Promise<InventoryTurnoverReport> => {
    try {
        const params = new URLSearchParams();
        if (dateRange?.start_date) params.append('start_date', dateRange.start_date);
        if (dateRange?.end_date) params.append('end_date', dateRange.end_date);

        const queryString = params.toString();
        const url = queryString ? `/inventory/reports/turnover/?${queryString}` : '/inventory/reports/turnover/';
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory turnover report:', error);
        throw error;
    }
};

export const fetchSupplierPerformanceReport = async (dateRange?: ReportDateRange): Promise<SupplierPerformanceReport> => {
    try {
        const params = new URLSearchParams();
        if (dateRange?.start_date) params.append('start_date', dateRange.start_date);
        if (dateRange?.end_date) params.append('end_date', dateRange.end_date);

        const queryString = params.toString();
        const url = queryString ? `/inventory/reports/supplier_performance/?${queryString}` : '/inventory/reports/supplier_performance/';
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching supplier performance report:', error);
        throw error;
    }
};

export const exportReportToPDF = async (reportData: any): Promise<Blob> => {
    try {
        const response = await api.post('/inventory/reports/export/pdf/', reportData, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('Error exporting report to PDF:', error);
        throw error;
    }
};

export const exportReportToExcel = async (reportData: any): Promise<Blob> => {
    try {
        const response = await api.post('/inventory/reports/export/excel/', reportData, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('Error exporting report to Excel:', error);
        throw error;
    }
};

