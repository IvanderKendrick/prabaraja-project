import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import ChevronDropdown from "@/components/ChevronDropdown";
import { Card, CardContent } from "@/components/ui/card";
import { TabNavigation } from "@/components/products/TabNavigation";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductTable } from "@/components/products/ProductTable";
import { WarehouseTable } from "@/components/products/WarehouseTable";
import { WarehouseFilters } from "@/components/products/WarehouseFilters";
import { ProductPagination } from "@/components/products/ProductPagination";
import { useDropdownOptions } from "@/components/products/DropdownOptions";
import { useProducts } from "@/hooks/useProducts";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useRealtime } from "@/hooks/useRealtime";
import { Loader2 } from "lucide-react";

const Products = () => {
  const [activeTab, setActiveTab] = useState("Products");
  const [selectedProductCategory, setSelectedProductCategory] = useState("All");
  const [selectedWarehouseLocation, setSelectedWarehouseLocation] =
    useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Enable real-time updates
  useRealtime();

  // Fetch data from Supabase
  const {
    data: productsData = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();
  const {
    data: warehousesData = [],
    isLoading: warehousesLoading,
    error: warehousesError,
  } = useWarehouses();

  // Use the hook to get dropdown options
  const dropdownOptions = useDropdownOptions();

  // Transform Supabase data to match UI expectations
  const products = productsData.map((product) => ({
    id: product.id,
    code: `PRD${product.number.toString().padStart(3, "0")}`,
    category: product.category,
    name: product.name,
    totalStock: product.total_stock,
    minStock: product.min_stock,
    unit: product.unit,
    buyPrice: product.buy_price,
    sellPrice: product.sell_price || 0,
    status: product.status,
  }));

  const warehouses = warehousesData;

  // Get unique categories and locations for filters
  const productCategories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  const warehouseLocations = [
    "All",
    ...Array.from(new Set(warehouses.map((w) => w.location))),
  ];

  // Filter products and warehouses
  const filteredProducts = products.filter(
    (product) =>
      (selectedProductCategory === "All" ||
        product.category === selectedProductCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      (selectedWarehouseLocation === "All" ||
        warehouse.location === selectedWarehouseLocation) &&
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startProductIndex = (currentPage - 1) * itemsPerPage;
  const endProductIndex = startProductIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(
    startProductIndex,
    endProductIndex
  );

  // Loading state
  if (productsLoading || warehousesLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Header title="Products" description="Manage your company Products" />
          <div className="p-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading products...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (productsError || warehousesError) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Header title="Products" description="Manage your company Products" />
          <div className="p-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-red-600">
                  Error loading data:{" "}
                  {(productsError || warehousesError)?.message}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Products" description="Manage your company Products" />

        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <TabNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {activeTab === "Products" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <ProductFilters
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      selectedProductCategory={selectedProductCategory}
                      setSelectedProductCategory={setSelectedProductCategory}
                    />
                    <ChevronDropdown options={dropdownOptions} />
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <ProductTable products={currentProducts} />
                  </div>

                  {totalProductPages > 1 && (
                    <div className="flex justify-center">
                      <ProductPagination
                        currentPage={currentPage}
                        totalProductPages={totalProductPages}
                        setCurrentPage={setCurrentPage}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Warehouses" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <WarehouseFilters
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      selectedWarehouseLocation={selectedWarehouseLocation}
                      setSelectedWarehouseLocation={
                        setSelectedWarehouseLocation
                      }
                      warehouseLocations={warehouseLocations}
                    />
                    <ChevronDropdown options={dropdownOptions} />
                  </div>

                  <div className="border rounded-lg overflow-auto">
                    <WarehouseTable warehouses={filteredWarehouses} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Products;
