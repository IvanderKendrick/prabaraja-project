
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PurchaseFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  showStatusFilter?: boolean;
  showAddButton?: boolean;
  addButtonAction?: () => void;
}

export function PurchaseFilters({ 
  statusFilter, 
  onStatusFilterChange,
  searchValue,
  onSearchChange,
  showStatusFilter = true,
  showAddButton = true,
  addButtonAction
}: PurchaseFiltersProps) {
  const navigate = useNavigate();
  
  const handleAddNew = () => {
    if (addButtonAction) {
      addButtonAction();
    } else {
      navigate("/create-new-purchase");
    }
  };

  return (
    <div className="flex items-center gap-4 justify-between">
      <div className="flex items-center gap-4 flex-1">
        {/* Status Filter (conditionally shown) */}
        {showStatusFilter && (
          <Select 
            value={statusFilter} 
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger className="w-[180px] transition-opacity duration-200">
              <SelectValue placeholder="Status filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">
                <span className="flex items-center gap-2">
                  <Circle className={cn("h-3 w-3 fill-current text-yellow-500")} />
                  Pending
                </span>
              </SelectItem>
              <SelectItem value="Half-paid">
                <span className="flex items-center gap-2">
                  <Circle className={cn("h-3 w-3 fill-current text-blue-500")} />
                  Half-Paid
                </span>
              </SelectItem>
              <SelectItem value="completed">
                <span className="flex items-center gap-2">
                  <Circle className={cn("h-3 w-3 fill-current text-green-500")} />
                  Completed
                </span>
              </SelectItem>
              <SelectItem value="cancelled">
                <span className="flex items-center gap-2">
                  <Circle className={cn("h-3 w-3 fill-current text-red-500")} />
                  Cancelled
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Search Input (always visible) */}
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

      {/* Add New Button (conditionally shown) */}
    </div>
  );
}
