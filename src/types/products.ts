export interface Product {
    code: string;
    category: string;
    name: string;
    totalStock: number;
    minStock: number;
    unit: string;
    buyPrice: number;
    sellPrice: number;
    status: string;
    }
    
export interface Warehouse {
    id: string;
    user_id: string;
    number: number;
    name: string;
    location: string;
    total_stock: number;
    created_at: string;
    updated_at?: string;
}
    
    export interface DropdownOption {
        label: string;
        action: () => void;
        icon: JSX.Element;
    }