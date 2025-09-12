    import { Product, Warehouse } from "@/types/products";

    // Mock products data
    export const products: Product[] = [
    {
        code: "PRD001",
        category: "Electronics",
        name: "Laptop",
        totalStock: 15,
        minStock: 5,
        unit: "Unit",
        buyPrice: 8000000,
        sellPrice: 10000000,
        status: "In Stock",
    },
    {
        code: "PRD002",
        category: "Electronics",
        name: "Smartphone",
        totalStock: 0,
        minStock: 10,
        unit: "Unit",
        buyPrice: 2000000,
        sellPrice: 2500000,
        status: "Out of Stock",
    },
    {
        code: "PRD003",
        category: "Office",
        name: "Desk Chair",
        totalStock: 8,
        minStock: 3,
        unit: "Unit",
        buyPrice: 500000,
        sellPrice: 750000,
        status: "In Stock",
    },
    ];

    // Mock warehouses data (deprecated - using Supabase data)
    export const warehouses: any[] = [];

    // Product categories
    export const productCategories = ["All", "Electronics", "Office", "Furniture"];

    // Warehouse locations
    export const warehouseLocations = ["All", "Jakarta", "Tangerang", "Surabaya", "Bandung"];