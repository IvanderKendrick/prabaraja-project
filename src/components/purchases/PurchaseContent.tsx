import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { PurchaseType } from "@/types/purchase";
import { PurchaseFilters } from "./PurchaseFilters";
import { PurchaseAddButton } from "./PurchaseAddButton";
// import { StatsCards } from "./StatsCards";
import { AddPurchaseDialog } from "@/components/AddPurchaseDialog";
import { InvoicesTable } from "./tables/InvoicesTable";
import { OffersTable } from "./tables/OffersTable";
import { OrdersTable } from "./tables/OrdersTable";
import { RequestsTable } from "./tables/RequestsTable";
import { ShipmentsTable } from "./tables/ShipmentsTable";
import { PurchaseQuotationsTable } from "./tables/PurchaseQuotationsTable";
import { ApprovalTable } from "./tables/ApprovalTable";

export function PurchaseContent() {
  const { tab } = useParams();
  const location = useLocation();
  const validTabs = useMemo(
    () => [
      "invoices",
      "shipments",
      "orders",
      "requests",
      "offers",
      "quotations",
      "approval",
    ],
    []
  );
  const initialTab = validTabs.includes(tab as string)
    ? (tab as string)
    : "invoices";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const nextTab = validTabs.includes(tab as string)
      ? (tab as string)
      : "invoices";
    if (nextTab !== activeTab) setActiveTab(nextTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, location.pathname]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  // Simple stats calculation (these would ideally come from the API)
  // const unpaidAmount = 0;
  // const overdueCount = 0;
  // const last30DaysPayments = 0;

  // Handle delete transaction
  // const handleDeleteTransaction = async (id: string) => {
  //   try {
  //     // This would need to be implemented based on the specific API endpoints
  //     toast.success("Transaction deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting transaction:", error);
  //     toast.error("Failed to delete transaction");
  //   }
  // };

  const getAuthToken = () => {
    const authDataRaw = localStorage.getItem(
      "sb-xwfkrjtqcqmmpclioakd-auth-token"
    );
    if (!authDataRaw) throw new Error("No access token found in localStorage");
    const authData = JSON.parse(authDataRaw);
    const token = authData.access_token;
    if (!token) throw new Error("Access token missing in parsed auth data");
    return token;
  };

  // Handle delete transaction
  // Handle delete transaction
  const handleDeleteTransaction = async (
    id: string,
    type: "quotation" | "request" | "shipment" | "invoice"
  ) => {
    try {
      // Map tipe ke nama action sesuai instruksi
      const actionMap: Record<typeof type, string> = {
        quotation: "deleteQuotation",
        request: "deleteRequest",
        shipment: "deleteShipment",
        invoice: "deleteInvoice",
      };

      const token = getAuthToken(); // atau sesuai tempat kamu simpan token
      if (!token) throw new Error("Token not found");

      const response = await fetch(
        "https://pbw-backend-api.vercel.app/api/purchases",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: actionMap[type],
            id: id,
          }),
        }
      );

      const data = await response.json().catch(() => null); // coba parse JSON

      // ✅ Jika respons JSON valid dan punya key error
      if (data && typeof data.error !== "undefined") {
        if (data.error === true) {
          toast.error(data.message || "Failed to delete transaction");
          return;
        } else {
          toast.success("Transaction deleted successfully");
          return;
        }
      }

      // ✅ Kalau tidak ada field "error", fallback ke status response
      if (!response.ok) {
        toast.error("Failed to delete transaction");
        return;
      }

      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  // Handle approve transaction
  const handleApproveTransaction = async (id: string) => {
    try {
      // This would need to be implemented based on the specific API endpoints
      toast.success("Transaction approved successfully");
    } catch (error) {
      console.error("Error approving transaction:", error);
      toast.error("Failed to approve transaction");
    }
  };

  // Handle reject transaction
  const handleRejectTransaction = async (id: string) => {
    try {
      // This would need to be implemented based on the specific API endpoints
      toast.success("Transaction rejected successfully");
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      toast.error("Failed to reject transaction");
    }
  };

  // Handle receive payment
  const handleReceivePayment = (id: string) => {
    navigate(`/receive-payment/${id}`);
  };

  // Handle edit transaction
  const handleEditTransaction = (id: string) => {
    // Navigate to edit page based on active tab
    switch (activeTab) {
      case "invoices":
        navigate(`/edit-invoice/${id}`);
        break;
      // case "offers":
      //   navigate(`/edit-offer/${id}`);
      //   break;
      // case "orders":
      //   navigate(`/edit-order/${id}`);
      //   break;
      case "requests":
        navigate(`/edit-request/${id}`);
        break;
      case "shipments":
        navigate(`/edit-shipment/${id}`);
        break;
      case "quotations":
        navigate(`/edit-quotation/${id}`);
        break;
      default:
        break;
    }
  };

  // Get the default purchase type based on the active tab
  const getDefaultPurchaseType = (): PurchaseType => {
    switch (activeTab) {
      case "invoices":
        return "invoice";
      case "shipments":
        return "shipment";
      case "orders":
        return "order";
      case "offers":
        return "offer";
      case "requests":
        return "request";
      case "quotations":
        return "quotation";
      default:
        return "invoice";
    }
  };

  // Handle clicking the "Add Purchase" button
  const handleAddPurchaseClick = (type: PurchaseType) => {
    navigate(`/create-new-purchase?type=${type}`);
  };

  // Handle add purchase dialog
  const handleAddPurchase = (purchaseData: any) => {
    // This would need to be implemented based on the specific API endpoints
    toast.success("Purchase created successfully");
    setIsDialogOpen(false);
  };

  // Render the appropriate table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case "invoices":
        return (
          <InvoicesTable
            onDelete={(id) => handleDeleteTransaction(id, "invoice")}
            onEdit={handleEditTransaction}
            onReceivePayment={handleReceivePayment}
            onView={(id) => navigate(`/purchase-invoice/${id}`)}
          />
        );
      case "offers":
        return (
          <OffersTable onView={(id) => navigate(`/purchase-offers/${id}`)} />
        );
      case "orders":
        return (
          <OrdersTable onView={(id) => navigate(`/purchase-order/${id}`)} />
        );
      case "requests":
        return (
          <RequestsTable
            onDelete={(id) => handleDeleteTransaction(id, "request")}
            onEdit={handleEditTransaction}
            onApprove={handleApproveTransaction}
            onReject={handleRejectTransaction}
            onView={(id) => navigate(`/purchase-request/${id}`)}
          />
        );
      case "shipments":
        return (
          <ShipmentsTable
            onDelete={(id) => handleDeleteTransaction(id, "shipment")}
            onEdit={handleEditTransaction}
            onView={(id) => navigate(`/purchase-shipment/${id}`)}
          />
        );
      case "quotations":
        return (
          <PurchaseQuotationsTable
            onDelete={(id) => handleDeleteTransaction(id, "quotation")}
            onEdit={handleEditTransaction}
            onView={(id) => navigate(`/purchase-quotation/${id}`)}
          />
        );
      case "approval":
        return (
          <ApprovalTable
            // onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
            onApprove={handleApproveTransaction}
            onReject={handleRejectTransaction}
          />
        );
      default:
        return (
          <InvoicesTable
            onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
            onReceivePayment={handleReceivePayment}
          />
        );
    }
  };

  let content;

  switch (activeTab) {
    case "invoices":
      content = (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <PurchaseAddButton onAddPurchase={handleAddPurchaseClick} />
          </div>
        </div>
      );
      break;

    case "shipments":
      content = (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <PurchaseAddButton onAddPurchase={handleAddPurchaseClick} />
          </div>
        </div>
      );
      break;

    case "requests":
      content = (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <PurchaseAddButton onAddPurchase={handleAddPurchaseClick} />
          </div>
        </div>
      );
      break;

    case "quotations":
      content = (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <PurchaseAddButton onAddPurchase={handleAddPurchaseClick} />
          </div>
        </div>
      );
      break;

    default:
    // content = <p>No tab selected</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">{content}</div>

      {/* <StatsCards 
        unpaidAmount={unpaidAmount}
        overdueCount={overdueCount}
        last30DaysPayments={last30DaysPayments}
      /> */}

      <PurchaseFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {renderTable()}

      <AddPurchaseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddPurchase}
        defaultType={getDefaultPurchaseType()}
      />
    </div>
  );
}
