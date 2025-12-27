import { useState, useEffect } from "react";
import axios from "axios";

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

import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// ======================================================
// GET TOKEN FROM LOCAL STORAGE
// ======================================================
const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No token found");

  const parsed = JSON.parse(raw);
  if (!parsed.access_token) throw new Error("Token missing");

  return parsed.access_token;
};

export default function StockTable() {
  const navigate = useNavigate();

  const [stocks, setStocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ======================================================
  // FETCH STOCK DATA
  // ======================================================
  const fetchStocks = async () => {
    try {
      const token = getAuthToken();

      const response = await axios.get(
        "https://pbw-backend-api.vercel.app/api/products?action=getStocks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const apiData = response.data.formattedData ?? [];

      // MAP API → TABLE FORMAT
      const mapped = apiData.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category ?? "-",
        unit: item.unit ?? "-",
        quantity: item.current_stock ?? 0,
        cogs: item.minimum_stock ?? 0, // as requested
      }));

      setStocks(mapped);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch stocks:", err);
      setError("Failed to load stock data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // ======================================================
  // SUMMARY
  // ======================================================
  const totalQuantity = stocks.reduce((sum, s) => sum + (s.quantity ?? 0), 0);
  const totalStockValue = stocks.reduce(
    (sum, s) => sum + s.quantity * s.cogs,
    0
  );

  // ======================================================
  // LOADING UI
  // ======================================================
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

  // ======================================================
  // ERROR UI
  // ======================================================
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

                  <Button variant="outline" size="sm" onClick={fetchStocks}>
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

  // ======================================================
  // MAIN RENDER
  // ======================================================
  return (
    <div className="space-y-6">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* TABLE */}
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
            {stocks.map((stock) => (
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
