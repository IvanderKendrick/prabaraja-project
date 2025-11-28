import React from "react";
import ProductTable from "./Product/ProductTable";
import { WarehouseTable } from "./Warehouse/WarehouseTable";
import StockTable from "./Stock/StockTable";

interface InventoryContentProps {
  activeTab: string;
}

export const InventoryContent: React.FC<InventoryContentProps> = ({
  activeTab,
}) => {
  return (
    <div className="space-y-6">
      {activeTab === "stock" && <StockTable />}
      {activeTab === "product" && <ProductTable />}
      {activeTab === "warehouses" && <WarehouseTable />}
    </div>
  );
};
