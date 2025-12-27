import { useState, useEffect } from "react";
import axios from "axios";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ----------------------
// GET TOKEN
// ----------------------
const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No token in storage");

  const parsed = JSON.parse(raw);
  if (!parsed.access_token) throw new Error("Token missing");

  return parsed.access_token;
};

export default function WorkInProcessTable() {
  // delete
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const token = getAuthToken();

      await axios.delete("https://pbw-backend-api.vercel.app/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          action: "deleteWorkInProcess", // belum ada?
          id: id,
        },
      });

      // update state setelah API sukses
      setData((prev) => prev.filter((p) => p.id !== id));

      toast.success("Work In Process deleted successfully");
    } catch (error: any) {
      toast.success(
        "Failed to delete Work In Process:",
        error.response?.data || error
      );
    }
  };

  const confirmDelete = async () => {
    if (!selectedProductId) return;

    await handleDelete(selectedProductId);

    setDeleteDialogOpen(false);
    setSelectedProductId(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedProductId(null);
  };

  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----------------------
  // FETCH API
  // ----------------------
  const fetchWIP = async () => {
    try {
      const token = getAuthToken();

      const response = await axios.get(
        "https://pbw-backend-api.vercel.app/api/products?action=getWorkInProcess",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const apiData = response.data.data ?? [];

      // MAP API → TABLE
      const mapped = apiData.map((item: any) => ({
        id: item.id,
        prodCode: item.prod_code,
        jobOrder: item.job_order_num,
        startDate: item.schedule?.start_date ?? "-",
        endDate: item.schedule?.end_date ?? "-",
      }));

      setData(mapped);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch WIP:", err);
      setError("Failed to load Work In Process data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWIP();
  }, []);

  // ----------------------
  // LOADING UI
  // ----------------------
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-600">
        Loading Work In Process...
      </div>
    );
  }

  // ----------------------
  // ERROR UI
  // ----------------------
  if (error) {
    return (
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Production Code</TableHead>
              <TableHead>Job Order Number</TableHead>
              <TableHead>Schedule (Start – Finish)</TableHead>
              <TableHead>Proceed</TableHead>
              <TableHead className="w-[90px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                  <Button variant="outline" size="sm" onClick={fetchWIP}>
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

  // ----------------------
  // MAIN UI
  // ----------------------
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Production Code</TableHead>
            <TableHead>Job Order Number</TableHead>
            <TableHead>Schedule (Start – Finish)</TableHead>
            <TableHead>Proceed</TableHead>
            <TableHead className="w-[90px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.prodCode}</TableCell>

              <TableCell>{item.jobOrder}</TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span>Start: {item.startDate}</span>
                  <span>Finish: {item.endDate}</span>
                </div>
              </TableCell>

              <TableCell>
                <Button size="sm" variant="outline">
                  Finish
                </Button>
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
                      onClick={() => navigate(`/editworkinprocess/${item.id}`)}
                    >
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        setSelectedProductId(item.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this work in process?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              work in process.
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
    </div>
  );
}
