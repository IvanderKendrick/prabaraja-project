import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SalesFilters } from "@/components/sales/SalesFilters";
import { SalesTable } from "@/components/sales/SalesTable";
import { SalesQuotationsTable } from "@/components/sales/SalesQuotationsTable";
import { SalesOffersTable } from "@/components/sales/SalesOffersTable";
import { SalesOrdersTable } from "@/components/sales/SalesOrdersTable";
import { SalesShipmentsTable } from "@/components/sales/SalesShipmentsTable";
import { SalesInvoicesTable } from "@/components/sales/SalesInvoicesTable";
import { SalesSummaryCards } from "@/components/sales/SalesSummaryCards";
import { SalesBillingSummary } from "@/components/sales/SalesBillingSummary";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useSalesInvoices, useOrderDeliveries, useQuotations, useDeleteOrderDelivery, useDeleteQuotation } from "@/hooks/useSalesData";
import { useDeleteSale } from "@/hooks/useSales";
import { useSalesDeleteActions } from "@/hooks/useSalesDeleteActions";
import { transformSalesInvoiceData, transformOrderDeliveryData, transformQuotationData } from "@/utils/salesDataUtils";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

type FilterCategory = "all" | "unpaid" | "paid" | "late" | "awaiting";

const Sales = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const location = useLocation();
  const validTabs = useMemo(() => ["quotation", "offers", "orders", "shipments", "invoices", "billing-summary"], []);
  const initialTab = validTabs.includes(tab as string) ? (tab as string) : "quotation";
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => {
    const nextTab = validTabs.includes(tab as string) ? (tab as string) : "quotation";
    if (nextTab !== activeTab) setActiveTab(nextTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, location.pathname]);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fetch data from Supabase based on active tab
  const { data: salesInvoices = [], isLoading: loadingSalesInvoices } = useSalesInvoices();

  // Only fetch order deliveries when relevant tabs are active
  const fetchOrderDeliveries = ["orders", "offers", "shipments", "billing-summary"].includes(activeTab);
  const { data: orderDeliveries = [], isLoading: loadingOrderDeliveries } = useOrderDeliveries(fetchOrderDeliveries);

  // Only fetch quotations when relevant tabs are active
  const fetchQuotations = ["quotation", "billing-summary"].includes(activeTab);
  const { data: quotations = [], isLoading: loadingQuotations } = useQuotations(fetchQuotations);

  // Delete mutation hooks
  const deleteSale = useDeleteSale();
  const deleteOrderDelivery = useDeleteOrderDelivery();
  const deleteQuotation = useDeleteQuotation();
  const { deleteQuotation: deleteQuotationAPI, deleteOrder, deleteShipment, deleteInvoice } = useSalesDeleteActions();

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string; type?: "quotation" | "order" | "shipment" | "invoice" }>({ open: false });

  // Get data based on active tab
  // (searchFilteredData is computed later after filteredData is defined)

  // Sort by date descending
  const getCurrentTabData = () => {
    switch (activeTab) {
      case "invoices":
        return {
          data: transformSalesInvoiceData(salesInvoices),
          isLoading: loadingSalesInvoices,
          emptyMessage: "No sales invoices found.",
        };
      case "orders":
        return {
          data: transformOrderDeliveryData(orderDeliveries),
          isLoading: loadingOrderDeliveries,
          emptyMessage: "No orders found.",
        };
      case "quotation":
        return {
          data: transformQuotationData(quotations),
          isLoading: loadingQuotations,
          emptyMessage: "No quotations found.",
        };
      case "offers":
        return {
          data: transformOrderDeliveryData(orderDeliveries),
          isLoading: loadingOrderDeliveries,
          emptyMessage: "No offers found.",
        };
      case "shipments":
        return {
          data: transformOrderDeliveryData(orderDeliveries),
          isLoading: loadingOrderDeliveries,
          emptyMessage: "No shipments found.",
        };
      case "billing-summary":
        return {
          data: [...transformSalesInvoiceData(salesInvoices), ...transformOrderDeliveryData(orderDeliveries), ...transformQuotationData(quotations)],
          isLoading: loadingSalesInvoices || loadingOrderDeliveries || loadingQuotations,
          emptyMessage: "No data found.",
        };
      default:
        return {
          data: [],
          isLoading: false,
          emptyMessage: "No data found.",
        };
    }
  };

  const { data: currentData, isLoading, emptyMessage } = getCurrentTabData();

  // Filter by selected category
  const filteredData =
    filterCategory === "all"
      ? [...currentData]
      : currentData.filter((item) => {
          switch (filterCategory) {
            case "paid":
              return item.status === "Paid";
            case "unpaid":
              return item.status === "Unpaid";
            case "late":
              return item.status === "Late Payment";
            case "awaiting":
              return item.status === "Awaiting Payment";
            default:
              return true;
          }
        });

  // Further filter by search term if provided
  const searchFilteredData = searchValue ? filteredData.filter((item) => item.customer.toLowerCase().includes(searchValue.toLowerCase()) || item.number.toLowerCase().includes(searchValue.toLowerCase())) : filteredData;

  // Sort data by date (newest to oldest)
  const sortedData = [...searchFilteredData].sort((a, b) => {
    // Convert DD/MM/YYYY format to Date objects for comparison
    const [aDay, aMonth, aYear] = a.date.split("/").map(Number);
    const [bDay, bMonth, bYear] = b.date.split("/").map(Number);

    const dateA = new Date(aYear, aMonth - 1, aDay);
    const dateB = new Date(bYear, bMonth - 1, bDay);

    // Sort in descending order (newest first)
    return dateB.getTime() - dateA.getTime();
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle delete action
  const handleDeleteSale = async (id: string) => {
    try {
      // Determine which table to delete from based on the transformed data
      const allData = getCurrentTabData().data;
      const itemToDelete = allData.find((item) => item.id === id);

      if (!itemToDelete) {
        toast({
          title: "Error",
          description: "Item not found",
          variant: "destructive",
        });
        return;
      }

      // Determine which delete function to use based on the number prefix
      if (itemToDelete.number.startsWith("INV-")) {
        // Use sales delete hook
        await deleteSale.mutateAsync(id);
      } else if (itemToDelete.number.startsWith("ORD-")) {
        // Use order delivery delete hook
        await deleteOrderDelivery.mutateAsync(id);
      } else if (itemToDelete.number.startsWith("QUO-")) {
        // Use quotation delete hook
        await deleteQuotation.mutateAsync(id);
      }

      toast({
        title: "Success",
        description: "Item deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  // Handle edit action
  const handleEditSale = (id: string) => {
    navigate(`/edit-sales/${id}`);
    if (activeTab === "quotation") {
      return (
        <>
          <SalesFilters filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchValue={searchValue} setSearchValue={setSearchValue} activeTab={activeTab} />
          <SalesQuotationsTable onEdit={(id) => navigate(`/sales-quotation/edit/${id}`)} onDelete={(id) => setDeleteDialog({ open: true, id, type: "quotation" })} />
        </>
      );
    }
  };

  // Reset pagination when changing tabs
  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
    setCurrentPage(1);
    setFilterCategory("all");
    setSearchValue("");
    navigate(`/sales/${nextTab}`);
  };

  // Render empty table for empty tabs
  const renderEmptyTable = (message: string) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              {isLoading ? "Loading..." : message}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    // For API-based tabs (Quotation, Offers, Orders, Shipments, Invoices)
    if (activeTab === "quotation") {
      return (
        <>
          <SalesFilters filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchValue={searchValue} setSearchValue={setSearchValue} activeTab={activeTab} />
          <SalesQuotationsTable onEdit={(id) => navigate(`/sales-quotation/edit/${id}`)} onDelete={(id) => setDeleteDialog({ open: true, id, type: "quotation" })} />
        </>
      );
    }

    if (activeTab === "offers") {
      return (
        <>
          <SalesFilters filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchValue={searchValue} setSearchValue={setSearchValue} activeTab={activeTab} />
          <SalesOffersTable />
        </>
      );
    }

    if (activeTab === "orders") {
      return (
        <>
          <SalesFilters filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchValue={searchValue} setSearchValue={setSearchValue} activeTab={activeTab} />
          <SalesOrdersTable onEdit={(id) => navigate(`/sales-order/edit/${id}`)} onDelete={(id) => setDeleteDialog({ open: true, id, type: "order" })} />
        </>
      );
    }

    if (activeTab === "shipments") {
      return (
        <>
          <SalesFilters filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchValue={searchValue} setSearchValue={setSearchValue} activeTab={activeTab} />
          <SalesShipmentsTable onEdit={(id) => navigate(`/sales-shipment/edit/${id}`)} onDelete={(id) => setDeleteDialog({ open: true, id, type: "shipment" })} />
        </>
      );
    }

    if (activeTab === "invoices") {
      return (
        <>
          <SalesFilters filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchValue={searchValue} setSearchValue={setSearchValue} activeTab={activeTab} />
          <SalesInvoicesTable onEdit={(id) => navigate(`/sales-invoice/edit/${id}`)} onDelete={(id) => setDeleteDialog({ open: true, id, type: "invoice" })} />
        </>
      );
    }

    // For billing-summary tab, use the existing Supabase-based logic
    const { data: currentData, isLoading, emptyMessage } = getCurrentTabData();

    // Filter by selected category
    const filteredData =
      filterCategory === "all"
        ? [...currentData]
        : currentData.filter((item) => {
            switch (filterCategory) {
              case "paid":
                return item.status === "Paid";
              case "unpaid":
                return item.status === "Unpaid";
              case "late":
                return item.status === "Late Payment";
              case "awaiting":
                return item.status === "Awaiting Payment";
              default:
                return true;
            }
          });

    // Further filter by search term if provided
    const searchFilteredData = searchValue ? filteredData.filter((item) => item.customer.toLowerCase().includes(searchValue.toLowerCase()) || item.number.toLowerCase().includes(searchValue.toLowerCase())) : filteredData;

    // Sort by date descending
    const sortedData = [...searchFilteredData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Check if we have data for this tab type or if still loading
    if (isLoading) {
      return (
        <>
          <SalesFilters filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchValue={searchValue} setSearchValue={setSearchValue} activeTab={activeTab} />
          {renderEmptyTable("Loading...")}
        </>
      );
    }

    if (sortedData.length === 0) {
      return (
        <>
          <SalesFilters filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchValue={searchValue} setSearchValue={setSearchValue} activeTab={activeTab} />
          {renderEmptyTable(emptyMessage)}
        </>
      );
    }

    return (
      <>
        <SalesFilters filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchValue={searchValue} setSearchValue={setSearchValue} activeTab={activeTab} />
        <SalesTable
          filteredSalesData={paginatedData}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={sortedData.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showTopControls={false}
          onDelete={handleDeleteSale}
          onEdit={handleEditSale}
        />
      </>
    );
  };

  // Get all data for summary cards (combine all tabs data)
  const allSalesData = [...transformSalesInvoiceData(salesInvoices), ...transformOrderDeliveryData(orderDeliveries), ...transformQuotationData(quotations)];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Toaster />
        {/* Dynamic header title based on active tab in sidebar */}
        <Header
          title={
            activeTab === "quotation"
              ? "Sales Quotations"
              : activeTab === "offers"
              ? "Sales Offers"
              : activeTab === "orders"
              ? "Sales Orders"
              : activeTab === "shipments"
              ? "Sales Shipments"
              : activeTab === "invoices"
              ? "Sales Invoices"
              : activeTab === "billing-summary"
              ? "Billing Summary"
              : "Sales"
          }
          description="Manage your company sales transaction"
        />

        <div className="p-6">
          <div className="space-y-6">
            {/* Billing summary view inside Sales */}
            {activeTab === "billing-summary" ? (
              <SalesBillingSummary />
            ) : (
              <>
                {/* Tabs moved to Sidebar. Navigation handled via Sidebar submenu. */}
                {/* Render content based on active tab */}
                {renderTabContent()}
              </>
            )}

            <ConfirmDeleteDialog
              open={deleteDialog.open}
              title={
                deleteDialog.type === "quotation"
                  ? "Delete Quotation"
                  : deleteDialog.type === "order"
                  ? "Delete Order"
                  : deleteDialog.type === "shipment"
                  ? "Delete Shipment"
                  : deleteDialog.type === "invoice"
                  ? "Delete Invoice"
                  : "Delete Item"
              }
              description={
                deleteDialog.type === "quotation"
                  ? "Are you sure you want to delete this transaction? This action cannot be undone. This will permanently delete the Quotation."
                  : "Are you sure you want to delete this transaction? This action cannot be undone."
              }
              onConfirm={async () => {
                if (!deleteDialog.id || !deleteDialog.type) return;
                let success = false;
                if (deleteDialog.type === "quotation") success = await deleteQuotationAPI(deleteDialog.id);
                else if (deleteDialog.type === "order") success = await deleteOrder(deleteDialog.id);
                else if (deleteDialog.type === "shipment") success = await deleteShipment(deleteDialog.id);
                else if (deleteDialog.type === "invoice") success = await deleteInvoice(deleteDialog.id);

                setDeleteDialog({ open: false });
                if (success) {
                  // Refresh current tab content
                  window.location.reload();
                }
              }}
              onClose={() => setDeleteDialog({ open: false })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
