import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { ExpenseStatus } from "@/types/expense";

interface ActionDropdownProps {
  expenseId: string;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ActionDropdown = ({
  expenseId,
  onApprove,
  onDelete,
}: ActionDropdownProps) => {
  const handleApprove = () => {
    onApprove(expenseId);
    toast.success("Expense approved successfully");
  };

  const handleDelete = () => {
    onDelete(expenseId);
    toast.success("Expense deleted successfully");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className=" flex items-center">
          Action <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-green-600"
          onClick={handleApprove}
        >
          <Check className="h-4 w-4" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-red-600"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
