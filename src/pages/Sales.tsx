import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SalesFilters } from "@/components/sales/SalesFilters";
import { SalesTable } from "@/components/sales/SalesTable";
import { SalesSummaryCards } from "@/components/sales/SalesSummaryCards";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  useSalesInvoices,
  useOrderDeliveries,
  useQuotations,
  useDeleteOrderDelivery,
  useDeleteQuotation,
} from "@/hooks/useSalesData";
import { useDeleteSale } from "@/hooks/useSales";
import {
  transformSalesInvoiceData,
  transformOrderDeliveryData,
  transformQuotationData,
} from "@/utils/salesDataUtils";

type FilterCategory = "all" | "unpaid" | "paid" | "late" | "awaiting";

const Sales = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const location = useLocation();
  const validTabs = useMemo(() => ["delivery", "order", "quotation"], []);
  const initialTab = validTabs.includes(tab as string)
    ? (tab as string)
    : "delivery";
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => {
    const nextTab = validTabs.includes(tab as string)
      ? (tab as string)
      : "delivery";
    if (nextTab !== activeTab) setActiveTab(nextTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, location.pathname]);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fetch data from Supabase based on active tab
  const { data: salesInvoices = [], isLoading: loadingSalesInvoices } =
    useSalesInvoices();
  const { data: orderDeliveries = [], isLoading: loadingOrderDeliveries } =
    useOrderDeliveries();
  const { data: quotations = [], isLoading: loadingQuotations } =
    useQuotations();

  // Delete mutation hooks
  const deleteSale = useDeleteSale();
  const deleteOrderDelivery = useDeleteOrderDelivery();
  const deleteQuotation = useDeleteQuotation();

  // Get data based on active tab
  const getCurrentTabData = () => {
    switch (activeTab) {
      case "delivery":
        return {
          data: transformSalesInvoiceData(salesInvoices),
          isLoading: loadingSalesInvoices,
          emptyMessage: "No sales invoices found.",
        };
      case "order":
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
  const searchFilteredData = searchValue
    ? filteredData.filter(
        (item) =>
          item.customer.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.number.toLowerCase().includes(searchValue.toLowerCase())
      )
    : filteredData;

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
            <TableCell
              colSpan={7}
              className="text-center py-8 text-muted-foreground"
            >
              {isLoading ? "Loading..." : message}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    // Check if we have data for this tab type or if still loading
    if (isLoading) {
      return (
        <>
          <SalesFilters
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
          {renderEmptyTable("Loading...")}
        </>
      );
    }

    if (sortedData.length === 0) {
      return (
        <>
          <SalesFilters
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
          {renderEmptyTable(emptyMessage)}
        </>
      );
    }

    return (
      <>
        <SalesFilters
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
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
  const allSalesData = [
    ...transformSalesInvoiceData(salesInvoices),
    ...transformOrderDeliveryData(orderDeliveries),
    ...transformQuotationData(quotations),
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Toaster />
        <Header
          title="Sales"
          description="Manage your company sales transaction"
        />

        <div className="p-6">
          <div className="space-y-6">
            {/* Always show summary cards regardless of active tab */}
            <SalesSummaryCards salesData={allSalesData} />

            {/* Tabs moved to Sidebar. Navigation handled via Sidebar submenu. */}

            {/* Render content based on active tab */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
