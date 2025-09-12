    import { useState } from "react";
    import { format } from "date-fns";
    import { Circle, MoreVertical, Edit, Trash, AlertTriangle, Check, X } from "lucide-react";
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
    import { cn } from "@/lib/utils";
    import { RequestPurchase } from "@/types/purchase";
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

    interface RequestsTableProps {
    requests: RequestPurchase[];
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    }

    export function RequestsTable({ 
    requests, 
    onDelete, 
    onEdit,
    onApprove,
    onReject
    }: RequestsTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        setRequestToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (requestToDelete) {
        onDelete(requestToDelete);
        }
        setDeleteDialogOpen(false);
    };

    const cancelDelete = () => {
        setRequestToDelete(null);
        setDeleteDialogOpen(false);
    };

    return (
        <>
        <div className="border rounded-lg">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Requested</TableHead>
                <TableHead>Request #</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.map((request) => (
                <TableRow key={request.id}>
                    <TableCell>{format(request.date, "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                    <Link
                        to={`/request/${request.id}`}
                        className="text-indigo-600 hover:underline"
                    >
                        {request.number}
                    </Link>
                    </TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>
                    <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                        {
                        "bg-red-100 text-red-800": request.urgency === "High",
                        "bg-yellow-100 text-yellow-800": request.urgency === "Medium",
                        "bg-green-100 text-green-800": request.urgency === "Low",
                        }
                    )}>
                        {request.urgency === "High" && <AlertTriangle className="h-3 w-3" />}
                        {request.urgency}
                    </span>
                    </TableCell>
                    <TableCell>
                    {request.dueDate ? format(request.dueDate, "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                    <span className={cn(
                        "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium",
                        {
                        "bg-yellow-100 text-yellow-800": request.status === "pending",
                        "bg-green-100 text-green-800": request.status === "completed",
                        "bg-red-100 text-red-800": request.status === "cancelled",
                        }
                    )}>
                        <Circle className={cn(
                        "h-2 w-2",
                        {
                            "fill-yellow-500": request.status === "pending",
                            "fill-green-500": request.status === "completed",
                            "fill-red-500": request.status === "cancelled",
                        }
                        )} />
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
                        {request.status === "pending" && onApprove && onReject && (
                            <>
                            <DropdownMenuItem 
                                onClick={() => onApprove(request.id)}
                                className="text-green-600"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => onReject(request.id)}
                                className="text-red-600"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                            </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(request.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDeleteClick(request.id)}
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
                <AlertDialogTitle>Are you sure you want to delete this request?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the request.
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