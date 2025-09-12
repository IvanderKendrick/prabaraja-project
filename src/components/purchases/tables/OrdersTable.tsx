
import { useState } from "react";
import { format } from "date-fns";
import { Circle, MoreVertical, Edit, Trash, Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { OrderPurchase } from "@/types/purchase";
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

interface OrdersTableProps {
  orders: OrderPurchase[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function OrdersTable({ orders, onDelete, onEdit }: OrdersTableProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    // Filter by search term if provided
    const matchesSearch = searchValue
      ? order.number.toLowerCase().includes(searchValue.toLowerCase())
      : true;

    // Filter by status if not "all"
    const matchesStatus = statusFilter === "all"
      ? true
      : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      onDelete(orderToDelete);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setOrderToDelete(null);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Date</TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Discount Terms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  There haven't been any Orders added to the table yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {order.orderDate ? format(order.orderDate, "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/order/${order.id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {order.number}
                    </Link>
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>
                    {order.discountTerms || (
                      <span className="text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium",
                      {
                        "bg-yellow-100 text-yellow-800": order.status === "pending",
                        "bg-green-100 text-green-800": order.status === "completed",
                        "bg-red-100 text-red-800": order.status === "cancelled",
                      }
                    )}>
                      <Circle className={cn(
                        "h-2 w-2",
                        {
                          "fill-yellow-500": order.status === "pending",
                          "fill-green-500": order.status === "completed",
                          "fill-red-500": order.status === "cancelled",
                        }
                      )} />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(order.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEdit(order.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(order.id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order.
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
