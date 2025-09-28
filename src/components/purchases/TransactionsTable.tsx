
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Purchase, 
  isInvoice, 
  isShipment, 
  isOrder, 
  isOffer, 
  isRequest,
  isQuotation
} from "@/types/purchase";
import { InvoicesTable } from "./tables/InvoicesTable";
import { ShipmentsTable } from "./tables/ShipmentsTable";
import { OrdersTable } from "./tables/OrdersTable";
import { OffersTable } from "./tables/OffersTable";
import { RequestsTable } from "./tables/RequestsTable";
import { PurchaseQuotationsTable } from "./tables/PurchaseQuotationsTable";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogHeader, DialogFooter, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface TransactionsTableProps {
  transactions: Purchase[];
  activeTab: string;
  onDeleteTransaction: (id: string) => void;
  onApproveTransaction?: (id: string) => void;
  onRejectTransaction?: (id: string) => void;
  onReceivePayment?: (id: string) => void;
}

export function TransactionsTable({
  transactions,
  activeTab = "invoices",
  onDeleteTransaction,
  onApproveTransaction = () => {},
  onRejectTransaction = () => {},
  onReceivePayment = () => {},
}: TransactionsTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log('TransactionsTable - activeTab:', activeTab);
  console.log('TransactionsTable - transactions received:', transactions.length);
  console.log('TransactionsTable - transaction types:', transactions.map(t => t.type));

  // Filter transactions based on active tab with corrected logic
  const filteredTransactions = transactions.filter(transaction => {
    console.log('Filtering transaction:', { id: transaction.id, type: transaction.type, status: transaction.status });
    
    if (activeTab === "approval") {
      // For approval tab, show only pending offers
      const isPendingOffer = isOffer(transaction) && transaction.status === "pending";
      console.log('Approval filter - isPendingOffer:', isPendingOffer);
      return isPendingOffer;
    }
    
    // For other tabs, match the transaction type with the tab name (corrected logic)
    // Tab names are plural (invoices, orders, etc.) but transaction types are singular
    const tabToTypeMap: Record<string, string> = {
      "invoices": "invoice",
      "shipments": "shipment", 
      "orders": "order",
      "offers": "offer",
      "requests": "request",
      "quotations": "quotation"
    };
    
    const expectedType = tabToTypeMap[activeTab];
    const matchesTab = transaction.type === expectedType;
    
    console.log('Tab filter - activeTab:', activeTab, 'expectedType:', expectedType, 'transaction.type:', transaction.type, 'matches:', matchesTab);
    return matchesTab;
  });

  console.log('TransactionsTable - filtered transactions:', filteredTransactions.length);

  // Common action handlers
  const handleEdit = (id: string) => {
    const tabToTypeMap: Record<string, string> = {
      invoices: "invoice",
      shipments: "shipment",
      orders: "order",
      offers: "offer",
      requests: "request",
      quotations: "quotation",
      approval: "offer",
    };
    const type = tabToTypeMap[activeTab] || "invoice";
    navigate(`/edit-purchase/${id}?type=${type}`);
  };
  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      onDeleteTransaction(transactionToDelete);
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
      toast({
        title: "Deleted",
        description: "Transaction removed successfully",
        variant: "default",
      });
    }
  };

  const cancelDelete = () => setIsDeleteDialogOpen(false);

  // Render appropriate table based on activeTab
  const renderTable = () => {
    console.log('Rendering table for activeTab:', activeTab);
    console.log('Available transactions for this tab:', filteredTransactions.length);

    switch(activeTab) {
      case "invoices":
        const invoices = filteredTransactions.filter(isInvoice);
        console.log('Invoices to render:', invoices.length);
        return (
          <InvoicesTable
            invoices={invoices}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReceivePayment={onReceivePayment}
          />
        );
      case "shipments":
        const shipments = filteredTransactions.filter(isShipment);
        console.log('Shipments to render:', shipments.length);
        return (
          <ShipmentsTable
            shipments={shipments}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        );
      case "orders":
        const orders = filteredTransactions.filter(isOrder);
        console.log('Orders to render:', orders.length);
        return (
          <OrdersTable
            orders={orders}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        );
      case "offers":
        const offers = filteredTransactions.filter(isOffer);
        console.log('Offers to render:', offers.length);
        return (
          <OffersTable
            offers={offers}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        );
      case "requests":
        const requests = filteredTransactions.filter(isRequest);
        console.log('Requests to render:', requests.length);
        return (
          <RequestsTable
            requests={requests}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        );
      case "quotations":
        console.log('Rendering quotations table with API data');
        return (
          <PurchaseQuotationsTable
            onDelete={handleDelete}
            onEdit={handleEdit}
            onView={(id) => navigate(`/purchase-quotation/${id}`)}
          />
        );
      case "approval":
        const offersForApproval = filteredTransactions.filter(isOffer);
        console.log('Offers for approval to render:', offersForApproval.length);
        return (
          <OffersTable
            offers={offersForApproval}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onApprove={onApproveTransaction}
            onReject={onRejectTransaction}
          />
        );
      default:
        console.log('Unknown tab, showing default message');
        return (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No table view available for this tab</p>
            <p className="text-sm text-gray-400">Active tab: {activeTab}</p>
          </div>
        );
    }
  };

  return (
    <>
      {renderTable()}
      
      {/* Shared Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this transaction?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              No
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
