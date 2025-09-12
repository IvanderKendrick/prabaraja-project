
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { SalesTableHeader } from "./SalesTableHeader";
import { SalesTableRow } from "./SalesTableRow";
import { SalesTablePagination } from "./SalesTablePagination";
import { SalesTableFooter } from "./SalesTableFooter";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface SalesData {
  id: string;
  date: string;
  number: string;
  customer: string;
  dueDate: string;
  status: string;
  total: string;
}

interface SalesTableProps {
  filteredSalesData: SalesData[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isOrderTab?: boolean;
  showTopControls?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const SalesTable = ({ 
  filteredSalesData, 
  currentPage, 
  totalPages, 
  pageSize, 
  totalItems,
  onPageChange, 
  onPageSizeChange,
  isOrderTab = false,
  showTopControls = true,
  searchValue = "",
  onSearchChange = () => {},
  statusFilter = "all",
  onStatusFilterChange = () => {},
  onDelete,
  onEdit
}: SalesTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      {showTopControls && (
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4 w-2/3">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-9"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <Table>
        <SalesTableHeader />
        <TableBody>
          {filteredSalesData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                {isOrderTab 
                  ? "There haven't been any Orders added to the table yet." 
                  : "No sales data found"}
              </TableCell>
            </TableRow>
          ) : (
            filteredSalesData.map((row) => (
              <SalesTableRow 
                key={row.id} 
                row={row} 
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))
          )}
        </TableBody>
      </Table>

      <SalesTableFooter 
        itemsCount={filteredSalesData.length}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />

      <SalesTablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
