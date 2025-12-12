import { useState } from "react";
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
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Dummy Data
const dummyPlan = [
  {
    id: "PP-001",
    prodCode: "P-STEEL-01",
    jobOrder: "JO-2025-001",
    startDate: "2025-02-01",
    endDate: "2025-02-05",
  },
  {
    id: "PP-002",
    prodCode: "P-FRAME-02",
    jobOrder: "JO-2025-004",
    startDate: "2025-02-10",
    endDate: "2025-02-12",
  },
  {
    id: "PP-003",
    prodCode: "P-MOTOR-07",
    jobOrder: "JO-2025-009",
    startDate: "2025-03-01",
    endDate: "2025-03-08",
  },
];

export default function ProductionPlanTable() {
  const navigate = useNavigate();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleProceed = (id: string) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };

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
          {dummyPlan.map((item) => (
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
                      onClick={() => navigate("/editproductionplan")} // ⬅ HERE
                    >
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* POPUP CONFIRM (dummy) */}
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
    </div>
  );
}
