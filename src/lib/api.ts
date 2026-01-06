import api from './axios';

import {
    Supplier,
    Vehicle,
    VehicleIncomeBreakdown,
    VehicleExpenseBreakdown
} from '@/types/common';
import {
    User,
    ClientUser,
    LoyaltyPoints,
    LoyaltyTransaction,
    UserDashboardStats,
    LoanApplication,
    LoanDashboardStats,
    LoyaltyTier
} from '@/types/user-management';
export type { Supplier, Vehicle, VehicleIncomeBreakdown, VehicleExpenseBreakdown };

export interface VehicleFilters {
    search?: string;
    status?: string;
    supplier?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const fetchVehicles = async (
    page = 1,
    pageSize = 10,
    filters?: VehicleFilters
): Promise<{ vehicles: Vehicle[], totalCount: number, totalPages: number }> => {
    try {
        const params: any = {
            page,
            page_size: pageSize
        };

        if (filters) {
            if (filters.search) params.search = filters.search;
            if (filters.status && filters.status !== 'ALL') params.status = filters.status;
            if (filters.supplier && filters.supplier !== 'ALL') params.supplier = filters.supplier;

            if (filters.sortBy && filters.sortBy !== 'year') {
                const prefix = filters.sortOrder === 'desc' ? '-' : '';
                params.ordering = `${prefix}${filters.sortBy}`;
            }
        }

        const response = await api.get('/vehicles/', { params });

        // Handle paginated response
        if (response.data.results) {
            return {
                vehicles: response.data.results,
                totalCount: response.data.count || 0,
                totalPages: Math.ceil((response.data.count || 0) / pageSize)
            };
        }

        // Handle non-paginated response (fallback)
        const vehicles = Array.isArray(response.data) ? response.data : [];
        return {
            vehicles,
            totalCount: vehicles.length,
            totalPages: Math.ceil(vehicles.length / pageSize)
        };
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
    }
};

export const fetchVehicle = async (id: number | string): Promise<Vehicle> => {
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

export const updateVehicle = async (id: number | string, data: Partial<Vehicle>): Promise<Vehicle> => {
    try {
        const response = await api.put(`/vehicles/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating vehicle:', error);
        throw error;
    }
};

export const deleteVehicle = async (id: number | string): Promise<void> => {
    try {
        await api.delete(`/vehicles/${id}/`);
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        throw error;
    }
};

export const fetchSuppliers = async (page = 1, pageSize = 20, search?: string): Promise<ApiResponse<Supplier>> => {
    try {
        const params: any = {
            is_active: true,
            page,
            page_size: pageSize
        };
        if (search) params.search = search;

        const response = await api.get('/suppliers/', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
    }
};

// Paginated version of fetchSuppliers for fleet management
export interface SupplierFilters {
    search?: string;
    is_active?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const fetchSuppliersPaginated = async (
    page = 1,
    pageSize = 10,
    filters?: SupplierFilters
): Promise<{ suppliers: Supplier[], totalCount: number, totalPages: number }> => {
    try {
        const params: Record<string, unknown> = {
            page,
            page_size: pageSize,
            is_active: true,
        };

        if (filters) {
            if (filters.search) params.search = filters.search;
            if (filters.is_active !== undefined) params.is_active = filters.is_active;
            if (filters.sortBy) {
                const prefix = filters.sortOrder === 'desc' ? '-' : '';
                params.ordering = `${prefix}${filters.sortBy}`;
            }
        }

        const response = await api.get('/suppliers/', { params });

        // Handle paginated response
        if (response.data.results) {
            return {
                suppliers: response.data.results,
                totalCount: response.data.count || 0,
                totalPages: Math.ceil((response.data.count || 0) / pageSize)
            };
        }

        // Handle non-paginated response (fallback)
        const suppliers = Array.isArray(response.data) ? response.data : [];
        return {
            suppliers,
            totalCount: suppliers.length,
            totalPages: Math.ceil(suppliers.length / pageSize)
        };
    } catch (error) {
        console.error('Error fetching suppliers (paginated):', error);
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

export const fetchSupplier = async (id: string): Promise<Supplier> => {
    try {
        const response = await api.get(`/suppliers/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching supplier:', error);
        throw error;
    }
};

export const updateSupplier = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    try {
        const response = await api.put(`/suppliers/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating supplier:', error);
        throw error;
    }
};

export const deleteSupplier = async (id: string): Promise<void> => {
    try {
        await api.delete(`/suppliers/${id}/`);
    } catch (error) {
        console.error('Error deleting supplier:', error);
        throw error;
    }
};

export interface GeneralSupplierStats {
    total_suppliers: number;
    total_purchases: number;
    total_outstanding: number;
    total_vehicles_supplied: number;
}

export const fetchGeneralSupplierStats = async (): Promise<GeneralSupplierStats> => {
    try {
        const response = await api.get('/suppliers/statistics/');
        return response.data;
    } catch (error) {
        console.error('Error fetching supplier statistics:', error);
        return {
            total_suppliers: 0,
            total_purchases: 0,
            total_outstanding: 0,
            total_vehicles_supplied: 0,
        };
    }
};

import { SupplierItem, AccountsPayable, SupplierPayment } from '@/types/supplier';

export const fetchSupplierItems = async (supplierId: string): Promise<SupplierItem[]> => {
    try {
        const response = await api.get(`/suppliers/${supplierId}/items/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching supplier items:', error);
        throw error;
    }
};

export const fetchSupplierPayables = async (supplierId: string): Promise<AccountsPayable[]> => {
    try {
        const response = await api.get(`/suppliers/${supplierId}/payables/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching supplier payables:', error);
        throw error;
    }
};

export const fetchSupplierPayments = async (supplierId: string): Promise<SupplierPayment[]> => {
    try {
        const response = await api.get(`/suppliers/payments/`, {
            params: { accounts_payable__supplier: supplierId }
        });
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching supplier payments:', error);
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

export const fetchVehicleFinancialSummary = async (id: number | string) => {
    try {
        const response = await api.get(`/vehicles/${id}/financial_summary/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle financial summary:', error);
        throw error;
    }
};

export const fetchVehicleIncomeBreakdown = async (
    id: number | string,
    startDate?: string,
    endDate?: string
): Promise<VehicleIncomeBreakdown> => {
    try {
        const params: any = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await api.get(`/vehicles/${id}/income_breakdown/`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle income breakdown:', error);
        throw error;
    }
};

export const fetchVehicleExpenseBreakdown = async (
    id: number | string,
    startDate?: string,
    endDate?: string
): Promise<VehicleExpenseBreakdown> => {
    try {
        const params: any = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await api.get(`/vehicles/${id}/expense_breakdown/`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle expense breakdown:', error);
        throw error;
    }
};

export const fetchVehicleProfitabilityAnalysis = async (id: number | string): Promise<VehicleProfitabilityAnalysis> => {
    try {
        const response = await api.get(`/vehicles/${id}/profitability_analysis/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle profitability analysis:', error);
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
export const fetchInventoryItems = async (filters?: InventoryFilters, page = 1, pageSize = 20): Promise<ApiResponse<InventoryItem>> => {
    try {
        const params: any = {
            page,
            page_size: pageSize
        };

        if (filters) {
            if (filters.condition) params.condition = filters.condition;
            if (filters.search) params.search = filters.search;
            if (filters.ordering) params.ordering = filters.ordering;
        }

        const response = await api.get('/inventory/vehicles/', { params });
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

// Quick Management API Interface

export interface Invoice {
    id: string;
    client: string;
    client_name?: string;
    amount: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
    created_date: string;
    due_date: string;
    items?: any[];
}

export interface Expense {
    id: string;
    type: string;
    category: string;
    description?: string;
    amount: number;
    status: string;
    date: string;
    vehicle_registration?: string;
    item_name?: string;
}

export interface InvoiceAnalytics {
    total_invoices: number;
    paid_invoices: number;
    pending_invoices: number;
    overdue_invoices: number;
    total_revenue: number;
    pending_amount: number;
    overdue_amount: number;
}

export interface FinancialAnalysis {
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    revenue_growth: number;
    expense_growth: number;
    profit_growth: number;
    expense_breakdown: {
        category: string;
        amount: number;
        count: number;
    }[];
    period: {
        start_date: string;
        end_date: string;
        days: number;
    };
}

// Quick Management API Functions

export const fetchInvoices = async (filters?: { search?: string, status?: string }, page = 1, pageSize = 1000): Promise<Invoice[]> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get<Invoice[]>(`/invoices/?${params.toString()}`);
    return response.data;
};

export const fetchAllExpenses = async (): Promise<Expense[]> => {
    const response = await api.get<any[]>('/expenses/all-expenses/');
    return response.data.map(item => ({
        id: item.id,
        type: item.type,
        category: item.category,
        description: item.notes || item.item_name || item.type,
        amount: item.total_amount,
        status: item.status,
        date: item.created_at,
        vehicle_registration: item.vehicle_registration,
    }));
};

export const fetchInvoiceAnalytics = async (params?: { start_date?: string, end_date?: string }): Promise<InvoiceAnalytics> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response = await api.get<InvoiceAnalytics>(`/invoices/analytics/?${queryParams.toString()}`);
    return response.data;
};

export const fetchFinancialAnalysis = async (days: number = 30): Promise<FinancialAnalysis> => {
    const response = await api.get<FinancialAnalysis>(`/invoices/financial_analysis/?days=${days}`);
    return response.data;
};

export const createInvoice = async (data: any): Promise<Invoice> => {
    try {
        const response = await api.post('/invoices/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }
};

export const fetchVehiclesForSelect = async (): Promise<Vehicle[]> => {
    try {
        // Fetch a large number of vehicles for dropdown
        const response = await api.get<{ vehicles: Vehicle[] }>('/vehicles/?page_size=1000');
        return response.data.vehicles;
    } catch (error) {
        console.error('Error fetching vehicles for select:', error);
        throw error;
    }
};

export const fetchContractsForSelect = async (): Promise<Contract[]> => {
    try {
        const response = await api.get('/contracts/?limit=1000&status=ACTIVE');
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching contracts for select:', error);
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
        console.log('API: Updating inventory item', vehicleId, 'with data:', data);
        const response = await api.put(`/inventory/vehicles/${vehicleId}/`, data);
        console.log('API: Update successful:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error updating inventory item:', error);
        console.error('API Error Details:', {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            url: error?.config?.url,
            method: error?.config?.method,
            sentData: error?.config?.data
        });
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
export const fetchParts = async (
    filters?: PartsFilters & { low_stock?: boolean },
    page = 1,
    pageSize = 20
): Promise<ApiResponse<Part>> => {
    try {
        const params: any = {
            page,
            page_size: pageSize
        };

        if (filters) {
            if (filters.category) params.category = filters.category;
            if (filters.supplier) params.supplier = filters.supplier;
            if (filters.unit) params.unit = filters.unit;
            if (filters.search) params.search = filters.search;
            if (filters.ordering) params.ordering = filters.ordering;
            if (filters.low_stock !== undefined) params.low_stock = filters.low_stock;
        }

        const response = await api.get('/inventory/parts/', { params });
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
export const fetchPartCategories = async (page = 1, pageSize = 1000): Promise<ApiResponse<PartCategory>> => {
    try {
        const response = await api.get(`/inventory/categories/?page=${page}&page_size=${pageSize}`);
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
export const fetchInventorySuppliers = async (page = 1, pageSize = 1000): Promise<ApiResponse<InventorySupplier>> => {
    try {
        const response = await api.get(`/inventory/suppliers/?page=${page}&page_size=${pageSize}`);
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
export const fetchStockUsage = async (filters?: StockUsageFilters, page = 1, pageSize = 1000): Promise<ApiResponse<StockUsage>> => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());

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
    client: { id: number; email: string; };
    client_name: string;
    client_phone: string;
    vehicle: number;
    vehicle_make: string;
    vehicle_model: string;
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
    contract_number?: string;
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

export const fetchAllContracts = async (filters?: { status?: string; search?: string; limit?: number }): Promise<Contract[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.limit) params.append('limit', filters.limit.toString());

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

export const fetchJobCards = async (
    page = 1,
    pageSize = 20,
    filters?: {
        registration_number?: string,
        status?: string,
        search?: string
    }
): Promise<ApiResponse<JobCard>> => {
    try {
        const params: any = {
            page,
            page_size: pageSize
        };

        if (filters) {
            if (filters.registration_number) params.registration_number = filters.registration_number;
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
        }

        const response = await api.get('/job-cards/', { params });
        return response.data;
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

// Vehicle Status Tracking APIs

export interface VehicleStatusOverview {
    total_vehicles: number;
    status_breakdown: Record<string, {
        count: number;
        label: string;
        percentage: number;
        vehicles: Array<{
            id: number;
            registration_number: string;
            make: string;
            model: string;
            location: string | null;
            last_update: string;
        }>;
    }>;
    last_updated: string;
}

export interface VehicleStatusHistory {
    id: number;
    old_status: string;
    new_status: string;
    timestamp: string;
    updated_by: {
        id: number | null;
        name: string;
        email: string | null;
    };
    location: string | null;
    reason: string | null;
    mileage_at_change: number | null;
    time_since_update: string;
}

export interface UtilizationStats {
    average_utilization: number;
    total_vehicles: number;
    hired_vehicles: number;
    available_vehicles: number;
    maintenance_vehicles: number;
    period_days: number;
}

export interface VehicleStatusUpdate {
    status: string;
    location?: string;
    reason?: string;
    mileage?: number;
}

// Get overview of all vehicle statuses
export const fetchVehicleStatusOverview = async (): Promise<VehicleStatusOverview> => {
    try {
        const response = await api.get('/vehicles/status_overview/');
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle status overview:', error);
        throw error;
    }
};

// Update vehicle status
export const updateVehicleStatus = async (vehicleId: number, data: VehicleStatusUpdate): Promise<{
    message: string;
    vehicle: Vehicle;
}> => {
    try {
        const response = await api.post(`/vehicles/${vehicleId}/update_status/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating vehicle status:', error);
        throw error;
    }
};

// Get status history for a specific vehicle
export const fetchVehicleStatusHistory = async (vehicleId: number, days: number = 30): Promise<{
    vehicle_id: number;
    registration_number: string;
    history: VehicleStatusHistory[];
    period_days: number;
}> => {
    try {
        const response = await api.get(`/vehicles/${vehicleId}/status_history/?days=${days}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle status history:', error);
        throw error;
    }
};

// Get vehicles filtered by status
export const fetchVehiclesByStatus = async (status: string): Promise<{
    status: string;
    count: number;
    vehicles: Array<{
        id: number;
        registration_number: string;
        make: string;
        model: string;
        current_location: string | null;
        last_status_update: string;
        status_updated_by: {
            name: string;
            email: string | null;
        } | null;
        current_mileage: number | null;
        fuel_level: number | null;
        utilization_30d: number;
    }>;
}> => {
    try {
        const response = await api.get(`/vehicles/by_status/?status=${status}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicles by status:', error);
        throw error;
    }
};

// Get fleet utilization statistics
export const fetchUtilizationStats = async (days: number = 30): Promise<UtilizationStats> => {
    try {
        const response = await api.get(`/vehicles/utilization_stats/?days=${days}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching utilization stats:', error);
        throw error;
    }
};

// Sync all vehicle statuses
export const syncVehicleStatuses = async (): Promise<{
    message: string;
    updated_count: number;
}> => {
    try {
        const response = await api.post('/vehicles/sync_statuses/');
        return response.data;
    } catch (error) {
        console.error('Error syncing vehicle statuses:', error);
        throw error;
    }
};

// Search vehicles with status filtering
export const searchVehicles = async (query: string = '', statusFilter?: string): Promise<{
    query: string;
    status_filter: string | null;
    count: number;
    vehicles: Array<{
        id: number;
        registration_number: string;
        make: string;
        model: string;
        status: string;
        current_location: string | null;
        last_status_update: string;
        current_mileage: number | null;
        fuel_level: number | null;
    }>;
}> => {
    try {
        let url = `/vehicles/search_vehicles/?q=${encodeURIComponent(query)}`;
        if (statusFilter) {
            url += `&status=${statusFilter}`;
        }
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error searching vehicles:', error);
        throw error;
    }
};

// Additional Vehicle Tracking Functions for Overview Page - using existing fetchUtilizationStats and fetchVehiclesByStatus

// ================================
// User Management API Functions
// ================================

// Users API
export const fetchUsers = async (page = 1, pageSize = 20, search?: string): Promise<ApiResponse<User>> => {
    try {
        const params: any = {
            page,
            page_size: pageSize
        };
        if (search) params.search = search;

        const response = await api.get('/users/', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const fetchUser = async (id: string): Promise<User> => {
    try {
        const response = await api.get(`/users/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

export const createUser = async (data: Partial<User>): Promise<User> => {
    try {
        const response = await api.post('/users/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
    try {
        const response = await api.patch(`/users/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (id: string): Promise<void> => {
    try {
        await api.delete(`/users/${id}/`);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// Client Users API
export const fetchClientUsers = async (page = 1, pageSize = 20): Promise<ApiResponse<ClientUser>> => {
    try {
        // Use loyalty/clients endpoint which filters users with CLIENT role
        const params = {
            page,
            page_size: pageSize
        };
        const response = await api.get('/loyalty/clients/', { params });
        const results = response.data.results || response.data;
        const count = response.data.count || (Array.isArray(results) ? results.length : 0);

        // Transform data to match ClientUser interface
        const transformedResults = (Array.isArray(results) ? results : []).map((client: any) => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            role: client.role,
            status: client.status,
            branchId: client.branchId,
            profileImageUrl: client.profileImageUrl,
            lastLogin: client.lastLogin,
            createdAt: client.createdAt || new Date().toISOString(),
            updatedAt: client.updatedAt,
            // Map loyalty data
            idNumber: client.idNumber,
            physicalAddress: client.physicalAddress,
            totalContracts: 0, // This would need to come from a contracts endpoint
            activeContracts: 0, // This would need to come from a contracts endpoint
            totalSpent: 0, // This would need to come from a contracts/payments endpoint
            loyaltyPoints: client.current_points || 0,
            loyaltyTier: client.loyalty_tier || 'Bronze',
        }));

        return {
            results: transformedResults,
            count: count,
            next: response.data.next || null,
            previous: response.data.previous || null
        };
    } catch (error) {
        console.error('Error fetching client users:', error);
        throw error;
    }
};

export const fetchClientUser = async (id: string): Promise<ClientUser> => {
    try {
        const response = await api.get(`/loyalty/clients/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching client user:', error);
        throw error;
    }
};

export const updateClientUser = async (id: string, data: Partial<ClientUser>): Promise<ClientUser> => {
    try {
        // Update via users endpoint since loyalty/clients is read-only
        const response = await api.patch(`/users/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating client user:', error);
        throw error;
    }
};

// User Dashboard Statistics API
export const fetchUserDashboardStats = async (): Promise<UserDashboardStats> => {
    try {
        // Since /users/dashboard/stats/ doesn't exist, we'll calculate from available data
        const [users, loyaltyStats] = await Promise.all([
            api.get('/users/?role=CLIENT'),
            api.get('/loyalty/stats/')
        ]);

        const clients = users.data.results || users.data;
        const activeClients = clients.filter((user: any) => user.status === 'Active').length;

        // Calculate stats from available data
        const stats: UserDashboardStats = {
            totalClients: clients.length,
            activeClients: activeClients,
            newClientsThisMonth: loyaltyStats.data.new_clients_this_month || 0,
            totalLoyaltyPoints: loyaltyStats.data.total_points_in_system || 0,
            averageLoyaltyPoints: loyaltyStats.data.average_points_per_client || 0,
            topTierClients: loyaltyStats.data.platinum_clients || 0,
        };

        return stats;
    } catch (error) {
        console.error('Error fetching user dashboard stats:', error);
        // Return default stats if error
        return {
            totalClients: 0,
            activeClients: 0,
            newClientsThisMonth: 0,
            totalLoyaltyPoints: 0,
            averageLoyaltyPoints: 0,
            topTierClients: 0,
        };
    }
};

// Loyalty Points API
export const fetchLoyaltyPoints = async (): Promise<LoyaltyPoints[]> => {
    try {
        // Get loyalty data from clients endpoint (simpler approach)
        const response = await api.get('/loyalty/clients/');
        const clients = response.data.results || response.data;

        // Transform client data to LoyaltyPoints format using available data
        const loyaltyPointsData: LoyaltyPoints[] = clients.map((client: any) => ({
            id: `LP-${client.id}`,
            clientId: client.id,
            clientName: client.name,
            clientEmail: client.email,
            totalPoints: client.current_points || 0,
            pointsEarned: client.current_points || 0, // Simplified - use current points as earned
            pointsRedeemed: 0, // We'd need transaction history for this
            currentTier: client.loyalty_tier || 'Bronze',
            pointsToNextTier: Math.max(0, getPointsToNextTier(client.current_points || 0, client.loyalty_tier || 'Bronze')),
            nextTier: getNextTier(client.loyalty_tier || 'Bronze') as LoyaltyTier,
            tierBenefits: getTierBenefits(client.loyalty_tier || 'Bronze'),
            lastTransaction: undefined, // Would need transaction data
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        }));

        return loyaltyPointsData;
    } catch (error) {
        console.error('Error fetching loyalty points:', error);
        throw error;
    }
};

// Helper functions for loyalty tiers
const getPointsToNextTier = (currentPoints: number, currentTier: string): number => {
    const tierThresholds = { Bronze: 1000, Silver: 3000, Gold: 5000, Platinum: 10000 };
    switch (currentTier) {
        case 'Bronze': return Math.max(0, tierThresholds.Silver - currentPoints);
        case 'Silver': return Math.max(0, tierThresholds.Gold - currentPoints);
        case 'Gold': return Math.max(0, tierThresholds.Platinum - currentPoints);
        case 'Platinum': return 0;
        default: return tierThresholds.Silver - currentPoints;
    }
};

const getNextTier = (currentTier: string): string => {
    switch (currentTier) {
        case 'Bronze': return 'Silver';
        case 'Silver': return 'Gold';
        case 'Gold': return 'Platinum';
        case 'Platinum': return 'Platinum';
        default: return 'Silver';
    }
};

const getTierBenefits = (tier: string): string[] => {
    switch (tier) {
        case 'Bronze': return ['5% discount on rentals', 'Priority booking'];
        case 'Silver': return ['10% discount on rentals', 'Priority booking', 'Free upgrades'];
        case 'Gold': return ['15% discount on rentals', 'Priority booking', 'Free upgrades', 'Dedicated support'];
        case 'Platinum': return ['20% discount on rentals', 'Priority booking', 'Free upgrades', 'Dedicated support', 'Exclusive events'];
        default: return ['5% discount on rentals'];
    }
};

export const fetchClientLoyaltyPoints = async (clientId: string): Promise<LoyaltyPoints> => {
    try {
        const response = await api.get(`/loyalty/clients/${clientId}/`);
        const client = response.data;

        return {
            id: `LP-${client.id}`,
            clientId: client.id,
            clientName: client.name,
            clientEmail: client.email,
            totalPoints: client.current_points || 0,
            pointsEarned: client.current_points || 0, // Simplified
            pointsRedeemed: 0, // Would need transaction history
            currentTier: client.loyalty_tier || 'Bronze',
            pointsToNextTier: Math.max(0, getPointsToNextTier(client.current_points || 0, client.loyalty_tier || 'Bronze')),
            nextTier: getNextTier(client.loyalty_tier || 'Bronze') as LoyaltyTier,
            tierBenefits: getTierBenefits(client.loyalty_tier || 'Bronze'),
            lastTransaction: undefined, // Would need transaction data
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error fetching client loyalty points:', error);
        throw error;
    }
};

export const updateLoyaltyPoints = async (id: string, data: Partial<LoyaltyPoints>): Promise<LoyaltyPoints> => {
    try {
        // Since direct loyalty points update doesn't exist, we'd need to create transactions
        // This function would typically create adjustment transactions
        console.warn('Direct loyalty points update not supported. Use createLoyaltyTransaction for point adjustments.');
        throw new Error('Direct loyalty points update not supported. Use createLoyaltyTransaction for point adjustments.');
    } catch (error) {
        console.error('Error updating loyalty points:', error);
        throw error;
    }
};

// Loyalty Transactions API
export const fetchLoyaltyTransactions = async (filters?: {
    clientId?: string;
    type?: 'Earned' | 'Redeemed' | 'Expired' | 'Adjusted';
    limit?: number;
}): Promise<LoyaltyTransaction[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.clientId) params.append('client', filters.clientId); // Backend uses 'client' not 'client_id'
        if (filters?.type) params.append('type', filters.type);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get(`/loyalty/transactions/?${params.toString()}`);
        const transactions = response.data.results || response.data;

        // Transform backend data to match frontend interface
        return transactions.map((transaction: any) => ({
            id: transaction.id,
            clientId: transaction.client?.id || transaction.client,
            clientName: transaction.client?.name || 'Unknown Client',
            points: Math.abs(transaction.points), // Get absolute value
            type: transaction.type === 'EARNED' ? 'Earned' :
                transaction.type === 'REDEEMED' ? 'Redeemed' :
                    transaction.type === 'RENEWED' ? 'Adjusted' : 'Adjusted',
            reason: transaction.reason,
            balanceAfter: transaction.balance_after,
            referenceId: transaction.reference_id,
            createdBy: transaction.created_by?.email || 'System',
            createdAt: transaction.created_at,
        }));
    } catch (error) {
        console.error('Error fetching loyalty transactions:', error);
        throw error;
    }
};

export const createLoyaltyTransaction = async (data: Omit<LoyaltyTransaction, 'id' | 'createdAt' | 'balanceAfter'>): Promise<LoyaltyTransaction> => {
    try {
        const response = await api.post('/loyalty/transactions/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating loyalty transaction:', error);
        throw error;
    }
};

// Loyalty Transaction Action Functions (using the available endpoints)
export const awardLoyaltyPoints = async (data: {
    client_id: string;
    contract_id?: string;
    points: number;
    reason?: string;
}): Promise<LoyaltyTransaction> => {
    try {
        const response = await api.post('/loyalty/transactions/award_points/', data);
        return response.data;
    } catch (error) {
        console.error('Error awarding loyalty points:', error);
        throw error;
    }
};

export const redeemLoyaltyPoints = async (data: {
    client_id: string;
    points: number;
    reason?: string;
    reference_id?: string;
    metadata?: any;
}): Promise<LoyaltyTransaction> => {
    try {
        const response = await api.post('/loyalty/transactions/redeem_points/', data);
        return response.data;
    } catch (error) {
        console.error('Error redeeming loyalty points:', error);
        throw error;
    }
};

export const renewLoyaltyPoints = async (data: {
    client_id: string;
    points: number;
    reason?: string;
}): Promise<LoyaltyTransaction> => {
    try {
        const response = await api.post('/loyalty/transactions/renew_points/', data);
        return response.data;
    } catch (error) {
        console.error('Error renewing loyalty points:', error);
        throw error;
    }
};

// Loyalty Rewards API
export const fetchLoyaltyRewards = async (): Promise<any[]> => {
    try {
        const response = await api.get('/loyalty/rewards/');
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching loyalty rewards:', error);
        throw error;
    }
};


export const checkRewardRedemption = async (rewardId: string, clientId: string): Promise<{
    can_redeem: boolean;
    current_points: number;
    reward_cost: number;
}> => {
    try {
        const response = await api.get(`/loyalty/rewards/${rewardId}/can_redeem/?client_id=${clientId}`);
        return response.data;
    } catch (error) {
        console.error('Error checking reward redemption:', error);
        throw error;
    }
};

// Enhanced Client Loyalty Summary (with fallback)
export const fetchClientLoyaltySummary = async (clientId: string): Promise<any> => {
    try {
        // Try the summary endpoint first
        const response = await api.get(`/loyalty/clients/${clientId}/summary/`);
        return response.data;
    } catch (error: any) {
        console.warn(`Summary endpoint failed for client ${clientId}:`, error?.response?.status);

        // Fallback: get basic client data and calculate summary
        try {
            const clientResponse = await api.get(`/loyalty/clients/${clientId}/`);
            const client = clientResponse.data;

            // Return a mock summary structure using available data
            return {
                client_id: client.id,
                client_name: client.name,
                current_points: client.current_points || 0,
                total_earned: client.current_points || 0,
                total_redeemed: 0,
                total_expired: 0,
                current_tier: client.loyalty_tier || 'Bronze',
                points_to_next_tier: getPointsToNextTier(client.current_points || 0, client.loyalty_tier || 'Bronze'),
                next_tier: getNextTier(client.loyalty_tier || 'Bronze'),
                tier_benefits: getTierBenefits(client.loyalty_tier || 'Bronze'),
                member_since: client.createdAt || new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
        } catch (fallbackError) {
            console.error('Fallback client data fetch failed:', fallbackError);
            throw error; // Throw original error if fallback fails
        }
    }
};

// Utility function to validate and debug client IDs
export const debugClientData = async () => {
    try {
        console.log('🔍 Debugging client data...');

        // Get all clients first
        const response = await api.get('/loyalty/clients/');
        const clients = response.data.results || response.data;

        console.log(`📊 Found ${clients.length} clients`);

        if (clients.length > 0) {
            const firstClient = clients[0];
            console.log('👤 First client sample:', {
                id: firstClient.id,
                name: firstClient.name,
                email: firstClient.email,
                current_points: firstClient.current_points,
                loyalty_tier: firstClient.loyalty_tier,
                id_type: typeof firstClient.id,
                id_format: firstClient.id?.length > 10 ? 'UUID' : 'Integer'
            });

            // Try to fetch individual client to test endpoint
            try {
                const individualResponse = await api.get(`/loyalty/clients/${firstClient.id}/`);
                console.log('✅ Individual client fetch successful');

                // Try summary endpoint
                try {
                    const summaryResponse = await api.get(`/loyalty/clients/${firstClient.id}/summary/`);
                    console.log('✅ Summary endpoint successful:', summaryResponse.data);
                } catch (summaryError: any) {
                    console.warn('⚠️ Summary endpoint failed:', summaryError?.response?.status, summaryError?.response?.data);
                }

            } catch (individualError: any) {
                console.error('❌ Individual client fetch failed:', individualError?.response?.status);
            }
        }

        // Test loyalty stats
        try {
            const statsResponse = await api.get('/loyalty/stats/');
            console.log('✅ Loyalty stats endpoint successful:', statsResponse.data);
        } catch (statsError: any) {
            console.warn('⚠️ Loyalty stats failed:', statsError?.response?.status);
        }

        return { success: true, clientCount: clients.length };
    } catch (error: any) {
        console.error('❌ Debug failed:', error?.response?.status, error?.message);
        return { success: false, error: error?.message };
    }
};

// Loan Applications API
export const fetchLoanApplications = async (filters?: {
    clientId?: string;
    status?: string;
    limit?: number;
}): Promise<LoanApplication[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.clientId) params.append('client_id', filters.clientId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get(`/loans/applications/?${params.toString()}`);
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching loan applications:', error);
        throw error;
    }
};

export const fetchLoanApplication = async (id: string): Promise<LoanApplication> => {
    try {
        const response = await api.get(`/loans/applications/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching loan application:', error);
        throw error;
    }
};

export const updateLoanApplication = async (id: string, data: Partial<LoanApplication>): Promise<LoanApplication> => {
    try {
        const response = await api.patch(`/loans/applications/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating loan application:', error);
        throw error;
    }
};

export const approveLoanApplication = async (id: string, data: {
    approvedBy: string;
    disbursementDate?: string;
    notes?: string;
}): Promise<LoanApplication> => {
    try {
        const response = await api.post(`/loans/applications/${id}/approve/`, data);
        return response.data;
    } catch (error) {
        console.error('Error approving loan application:', error);
        throw error;
    }
};

export const rejectLoanApplication = async (id: string, data: {
    rejectionReason: string;
    notes?: string;
}): Promise<LoanApplication> => {
    try {
        const response = await api.post(`/loans/applications/${id}/reject/`, data);
        return response.data;
    } catch (error) {
        console.error('Error rejecting loan application:', error);
        throw error;
    }
};

// Loan Dashboard Statistics API
export const fetchLoanDashboardStats = async (): Promise<LoanDashboardStats> => {
    try {
        const response = await api.get('/loans/dashboard/stats/');
        return response.data;
    } catch (error) {
        console.error('Error fetching loan dashboard stats:', error);
        throw error;
    }
};

// User Activity API - Commented out since endpoint doesn't exist
// export const fetchUserActivity = async (filters?: {
//     userId?: string;
//     days?: number;
//     limit?: number;
// }): Promise<any[]> => {
//     try {
//         const params = new URLSearchParams();
//         if (filters?.userId) params.append('user_id', filters.userId);
//         if (filters?.days) params.append('days', filters.days.toString());
//         if (filters?.limit) params.append('limit', filters.limit.toString());

//         const response = await api.get(`/users/activity/?${params.toString()}`);
//         return response.data.results || response.data;
//     } catch (error) {
//         console.error('Error fetching user activity:', error);
//         throw error;
//     }
// };

// User Search API
export const searchUsers = async (query: string, filters?: {
    role?: string;
    status?: string;
    limit?: number;
}): Promise<User[]> => {
    try {
        const params = new URLSearchParams();
        params.append('search', query);
        if (filters?.role) params.append('role', filters.role);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get(`/users/search/?${params.toString()}`);
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error searching users:', error);
        throw error;
    }
};

