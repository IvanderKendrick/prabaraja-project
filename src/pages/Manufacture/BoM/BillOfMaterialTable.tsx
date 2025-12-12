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
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";

const dummyBOM = [
  {
    id: "1",
    name: "BOM - Steel Cabinet",
    status: true,
  },
  {
    id: "2",
    name: "BOM - Aluminium Frame",
    status: false,
  },
  {
    id: "3",
    name: "BOM - Motor Assembly",
    status: true,
  },
];

export default function BillOfMaterialTable() {
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
            <TableHead>Bill of Material</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Proceed</TableHead>
            <TableHead className="w-[90px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {dummyBOM.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>

              <TableCell>
                {item.status ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" /> Yes
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" /> No
                  </span>
                )}
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
                    <DropdownMenuItem>Edit</DropdownMenuItem>
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
            Confirm proceed for ID: {selectedId}
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
