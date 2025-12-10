export interface Supplier {
    id: string;
    name: string;
    supplier_code: string;
    email?: string | null;
    phone: string;
    address?: string | null;
    contact_person?: string | null;
    tax_id?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Vehicle {
    id: number | string;
    make: string;
    model: string;

    registration_number: string;
    status: string;
    classification: string; // 'INTERNAL' or 'EXTERNAL'
    color?: string | null;
    vin?: string;
    vehicle_type?: string;

    supplier?: string | Supplier | null;
    supplier_name?: string;
    supplier_email?: string;
    supplier_phone?: string;
    purchase_price?: string | number | null;
    paid_price?: string | number | null;
    image_urls?: string[];
    features?: string[];
    last_service_date?: string | null;
    insurance_expiry?: string | null;
    description?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
}

// Financial Analytics Types
export interface VehicleIncomeBreakdown {
    total_income: number;
    total_pending: number;
    income_by_source: Array<{
        source: string;
        amount: number;
        percentage: number;
        count: number;
    }>;
    monthly_income_trend: Array<{
        month: string;
        amount: number;
    }>;
    income_trends: {
        monthly: Array<{
            month: string;
            income: number;
        }>;
        weekly: Array<{
            week: string;
            income: number;
        }>;
    };
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
}

export interface VehicleExpenseBreakdown {
    total_expenses: number;
    expenses_by_category: Array<{
        category: string;
        amount: number;
        percentage?: number;
        count: number;
    }>;
    monthly_expense_trend: Array<{
        month: string;
        amount: number;
    }>;
    expenses_by_month?: Array<{
        month: string;
        amount: number;
        count?: number;
    }>;
    expenses_by_week?: Array<{
        week: string;
        amount: number;
        count?: number;
    }>;
}

export interface VehicleProfitabilityAnalysis {
    vehicle_id: string;
    registration_number: string;
    performance_metrics: {
        total_income: number;
        total_expenses: number;
        revenue_per_contract: number;
        utilization_rate: number;
        net_profit_loss: number;
    };
    time_analysis: {
        months_in_service: number;
        avg_monthly_income: number;
        avg_monthly_expenses: number;
        break_even_point: string;
        payback_period_months: number;
    };
    investment_analysis: {
        purchase_price: number;
        total_invested: number;
        total_returns: number;
        net_gain_loss: number;
        roi_percentage: number;
    };
    financial_health: {
        is_profitable: boolean;
        expense_ratio_percentage: number;
        profit_margin_percentage: number;
        payback_period_months: number;
    };
}
