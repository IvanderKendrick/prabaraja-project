import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Printer,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// Dummy data
const dummyStocks = [
  {
    id: "1",
    name: "Steel Bar 12mm",
    category: "Raw Material",
    unit: "pcs",
    quantity: 500,
    cogs: 25000,
  },
  {
    id: "2",
    name: "Aluminium Sheet",
    category: "Raw Material",
    unit: "sheet",
    quantity: 200,
    cogs: 40000,
  },
  {
    id: "3",
    name: "Bolt M10",
    category: "Fastener",
    unit: "box",
    quantity: 100,
    cogs: 150000,
  },
];

export default function StockTable() {
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalQuantity = dummyStocks.reduce((sum, s) => sum + s.quantity, 0);
  const totalStockValue = dummyStocks.reduce(
    (sum, s) => sum + s.quantity * s.cogs,
    0
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>COGS</TableHead>
              <TableHead>Total Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Loading stocks...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>COGS</TableHead>
              <TableHead>Total Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <span className="text-sm text-red-600">{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <Card className="bg-sidebar-active/10">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Quantity</p>
            <p className="text-2xl font-semibold">
              {totalQuantity.toLocaleString()} Unit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-sidebar-active/10">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Stock Value</p>
            <p className="text-2xl font-semibold">
              Rp {formatPriceWithSeparator(totalStockValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>COGS</TableHead>
              <TableHead>Total Stock (Rp)</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {dummyStocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">{stock.name}</TableCell>
                <TableCell>{stock.category}</TableCell>
                <TableCell>{stock.unit}</TableCell>
                <TableCell>{stock.quantity.toLocaleString()}</TableCell>
                <TableCell>Rp {formatPriceWithSeparator(stock.cogs)}</TableCell>
                <TableCell>
                  Rp {formatPriceWithSeparator(stock.quantity * stock.cogs)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem
                        onClick={() => navigate(`/inventory/stock/${stock.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
