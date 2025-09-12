
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Warehouse } from "@/hooks/useWarehouses";

interface WarehouseTableProps {
  warehouses: Warehouse[];
}

export const WarehouseTable: React.FC<WarehouseTableProps> = ({ warehouses }) => {
  if (warehouses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No warehouses found. Try adjusting your search or add a new warehouse.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Warehouse Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Total Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {warehouses.map((warehouse) => (
          <TableRow key={warehouse.id}>
            <TableCell>WH{warehouse.number.toString().padStart(3, '0')}</TableCell>
            <TableCell>{warehouse.name}</TableCell>
            <TableCell>{warehouse.location}</TableCell>
            <TableCell>{warehouse.total_stock}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
