
import { Supplier } from './common';

export type { Supplier };

export interface SupplierItem {
    id: string;
    supplier: string; // ID
    supplier_name?: string;
    item_type: 'VEHICLE' | 'PART' | 'SERVICE' | 'OTHER';
    item_name: string;
    item_reference?: string | null;
    purchase_date: string;
    purchase_price: number | string;
    payment_status: 'PAID' | 'PARTIAL' | 'UNPAID';
    amount_paid: number | string;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
    balance_due?: number; // Calculated property usually
}

export interface AccountsPayable {
    id: string;
    supplier: string; // ID
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    amount: number | string;
    amount_paid: number | string;
    status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
    supplier_item?: string | null; // ID
    description?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
    balance_due?: number; // Calculated property
}

export interface SupplierPayment {
    id: string;
    accounts_payable: string; // ID
    payment_date: string;
    amount: number | string;
    payment_method: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'MPESA' | 'OTHER';
    reference_number?: string | null;
    notes?: string | null;
    created_at?: string;
}

export interface SupplierStats {
    total_suppliers: number;
    total_purchases: number;
    total_outstanding: number;
}
