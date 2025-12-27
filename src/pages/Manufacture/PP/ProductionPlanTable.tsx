import { useEffect, useState } from "react";
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

import { MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

export default function ProductionPlanTable() {
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
          action: "deleteProductionPlan",
          id: id,
        },
      });

      // update state setelah API sukses
      setPlanList((prev) => prev.filter((p) => p.id !== id));

      toast.success("Production Plan deleted successfully");
    } catch (error: any) {
      toast.success(
        "Failed to delete Production Plan:",
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

  const [planList, setPlanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleProceed = (id: string) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };

  // ======================================================
  // FETCH API
  // ======================================================
  const fetchProductionPlans = async () => {
    try {
      const token = getAuthToken();

      const response = await axios.get(
        "https://pbw-backend-api.vercel.app/api/products?action=getProductionPlan",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const apiData = response.data.data || [];

      // MAP response API → format table
      const mapped = apiData.map((item: any) => ({
        id: item.id,
        prodCode: item.prod_code,
        jobOrder: item.job_order_num,
        startDate: item.schedule?.start_date,
        endDate: item.schedule?.end_date,
      }));

      setPlanList(mapped);
    } catch (error) {
      console.error("❌ Failed to fetch production plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionPlans();
  }, []);

  // ======================================================
  // RENDER
  // ======================================================
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">
        Loading Production Plans...
      </div>
    );
  }

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
          {planList.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.prodCode}</TableCell>

              <TableCell>{item.jobOrder}</TableCell>

              <TableCell>
                <span className="flex flex-col">
                  <span>Start: {item.startDate}</span>
                  <span>Finish: {item.endDate}</span>
                </span>
              </TableCell>

              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleProceed(item.id)}
                >
                  Proceed
                </Button>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/editproductionplan/${item.id}`)}
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

      {/* POPUP CONFIRM */}
      {openConfirm && (
        <div className="p-4 bg-gray-100 border-t">
          <p className="font-medium mb-2">
            Confirm proceed for Production Plan ID: {selectedId}
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button className="bg-green-600 text-white">Confirm</Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this production plan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              production plan.
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
