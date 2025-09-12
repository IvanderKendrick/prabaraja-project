
import { useState } from "react";
import { format } from "date-fns";
import { Circle, MoreVertical, Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShipmentPurchase } from "@/types/purchase";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShipmentsTableProps {
  shipments: ShipmentPurchase[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function ShipmentsTable({ shipments, onDelete, onEdit }: ShipmentsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setShipmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (shipmentToDelete) {
      onDelete(shipmentToDelete);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setShipmentToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Helper function to safely format dates
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) {
      return "-";
    }
    
    // Ensure we have a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid before formatting
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    
    return format(dateObj, "dd/MM/yyyy");
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Tracking #</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Shipping Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell>{formatDate(shipment.date)}</TableCell>
                <TableCell>
                  <Link 
                    to={`/shipment/${shipment.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {shipment.trackingNumber}
                  </Link>
                </TableCell>
                <TableCell>{shipment.carrier}</TableCell>
                <TableCell>{formatDate(shipment.shippingDate)}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    {
                      "bg-yellow-100 text-yellow-800": shipment.status === "pending",
                      "bg-green-100 text-green-800": shipment.status === "completed",
                      "bg-red-100 text-red-800": shipment.status === "cancelled",
                    }
                  )}>
                    <Circle className={cn(
                      "h-2 w-2",
                      {
                        "fill-yellow-500 text-yellow-500": shipment.status === "pending",
                        "fill-green-500 text-green-500": shipment.status === "completed",
                        "fill-red-500 text-red-500": shipment.status === "cancelled",
                      }
                    )} />
                    {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onEdit(shipment.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(shipment.id)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this shipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shipment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>No</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
