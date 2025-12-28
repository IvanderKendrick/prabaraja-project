import { useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ApprovalSalesTableGeneric } from "@/components/sales/tables/ApprovalSalesTableGeneric";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApprovalSalesActions, ApprovalSalesType } from "@/hooks/useApprovalSalesActions";

type ApprovalSalesView = "quotation" | "order" | "invoice";

const approvalViewToAction: Record<ApprovalSalesView, Parameters<typeof ApprovalSalesTableGeneric>[0]["action"]> = {
  quotation: "getApprovalQuotation",
  order: "getApprovalOrder",
  invoice: "getApprovalInvoice",
};

const viewToApprovalType: Record<ApprovalSalesView, ApprovalSalesType> = {
  quotation: "QUOTATION",
  order: "ORDER",
  invoice: "INVOICE",
};

const ApprovalSales = () => {
  const [view, setView] = useState<ApprovalSalesView>("quotation");
  const [refreshKey, setRefreshKey] = useState(0);

  const { handleApprove, handleReject } = useApprovalSalesActions(viewToApprovalType[view]);

  const action = useMemo(() => approvalViewToAction[view], [view]);

  const onApproved = async (id: string) => {
    const ok = await handleApprove(id);
    if (ok) setRefreshKey((k: number) => k + 1);
  };

  const onRejected = async (id: string) => {
    const ok = await handleReject(id);
    if (ok) setRefreshKey((k: number) => k + 1);
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Sales Approval" description="Manage sales approvals for quotations, orders, and invoices" />

        <div className="p-6 space-y-4">
          {/* Tabs for desktop, Select for mobile */}
          <div className="hidden md:block">
            <Tabs value={view} onValueChange={(v) => setView(v as ApprovalSalesView)}>
              <TabsList>
                <TabsTrigger value="quotation">Quotation</TabsTrigger>
                <TabsTrigger value="order">Order</TabsTrigger>
                <TabsTrigger value="invoice">Invoice</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="md:hidden max-w-xs">
            <Select value={view} onValueChange={(v) => setView(v as ApprovalSalesView)}>
              <SelectTrigger>
                <SelectValue placeholder="Select approval type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quotation">Quotation</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ApprovalSalesTableGeneric key={refreshKey} action={action} onApprove={onApproved} onReject={onRejected} />
        </div>
      </div>
    </div>
  );
};

export default ApprovalSales;
