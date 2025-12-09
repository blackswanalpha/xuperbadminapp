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
    id: number;
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
