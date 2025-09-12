
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const SalesTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Number</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Due date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Total</TableHead>
        <TableHead>Action</TableHead>
      </TableRow>
    </TableHeader>
  );
};
