
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SalesTableFooterProps {
  itemsCount: number;
  totalItems: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export const SalesTableFooter = ({ 
  itemsCount, 
  totalItems, 
  pageSize, 
  onPageSizeChange 
}: SalesTableFooterProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-t">
      <div className="text-sm text-muted-foreground">
        Showing {itemsCount} of {totalItems} {totalItems === 1 ? 'entry' : 'entries'}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Show:</span>
        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-16 h-8">
            <SelectValue placeholder="5" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
