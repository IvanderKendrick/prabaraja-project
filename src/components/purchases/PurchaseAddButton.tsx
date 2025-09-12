import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Package,
  ShoppingCart,
  Tag,
  FileQuestion,
  Plus,
} from "lucide-react";
import { PurchaseType } from "@/types/purchase";
import { useNavigate } from "react-router-dom";

interface PurchaseAddButtonProps {
  onAddPurchase: (type: PurchaseType) => void;
}

export function PurchaseAddButton({ onAddPurchase }: PurchaseAddButtonProps) {
  const navigate = useNavigate();

  const handleAddPurchase = (type: PurchaseType) => {
    // Navigate to create purchase page with the type as query parameter
    navigate(`/create-purchase?type=${type}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="whitespace-nowrap bg-sidebar-active">
          <Plus className="mr-1 h-4 w-4" /> Add New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={() => handleAddPurchase("invoice")}>
          <FileText className="mr-2 h-4 w-4 text-purple-500" /> New Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddPurchase("shipment")}>
          <Package className="mr-2 h-4 w-4 text-orange-500" /> New Shipment
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddPurchase("order")}>
          <ShoppingCart className="mr-2 h-4 w-4 text-blue-500" /> New Order
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddPurchase("request")}>
          <FileQuestion className="mr-2 h-4 w-4 text-pink-500" /> New Request
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddPurchase("offer")}>
          <Tag className="mr-2 h-4 w-4 text-green-500" /> New Offer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddPurchase("quotation")}>
          <FileText className="mr-2 h-4 w-4 text-indigo-500" /> New Quotation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
