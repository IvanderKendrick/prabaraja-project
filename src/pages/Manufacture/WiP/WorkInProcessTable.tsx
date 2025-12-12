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
    id: "PP-010",
    prodCode: "P-WELD-12",
    jobOrder: "JO-2025-015",
    startDate: "2025-04-03",
    endDate: "2025-04-07",
  },
  {
    id: "PP-011",
    prodCode: "P-PAINT-05",
    jobOrder: "JO-2025-018",
    startDate: "2025-04-12",
    endDate: "2025-04-15",
  },
  {
    id: "PP-012",
    prodCode: "P-ASSEMBLY-21",
    jobOrder: "JO-2025-020",
    startDate: "2025-05-01",
    endDate: "2025-05-06",
  },
];

export default function WorkInProcessTable() {
  // navigate untuk pindah halaman
  const navigate = useNavigate();

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

              <TableCell>Finished</TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate("/editworkinprocess")} // ⬅ HERE
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
    </div>
  );
}
