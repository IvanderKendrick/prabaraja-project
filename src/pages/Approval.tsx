import { useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ApprovalTableGeneric } from "@/components/purchases/tables/ApprovalTableGeneric";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApprovalActions, ApprovalType } from "@/hooks/useApprovalActions";

type ApprovalView = "quotation" | "request" | "shipment" | "invoice" | "billing";

const approvalViewToAction: Record<ApprovalView, Parameters<typeof ApprovalTableGeneric>[0]["action"]> = {
  quotation: "getApprovalQuotation",
  request: "getApprovalRequest",
  shipment: "getApprovalShipment",
  invoice: "getApprovalInvoice",
  billing: "getApprovalBillingInvoice",
};

const viewToApprovalType: Record<ApprovalView, ApprovalType> = {
  quotation: "QUOTATION",
  request: "REQUEST",
  shipment: "SHIPMENT",
  invoice: "INVOICE",
  billing: "BILLING",
};

const Approval = () => {
  const [view, setView] = useState<ApprovalView>("quotation");
  const [refreshKey, setRefreshKey] = useState(0);

  const { handleApprove, handleReject } = useApprovalActions(viewToApprovalType[view]);

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
        <Header title="Approval" description="Manage approvals across all types" />

        <div className="p-6 space-y-4">
          {/* Tabs for desktop, Select for mobile */}
          <div className="hidden md:block">
            <Tabs value={view} onValueChange={(v) => setView(v as ApprovalView)}>
              <TabsList>
                <TabsTrigger value="quotation">Quotation</TabsTrigger>
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="shipment">Shipment</TabsTrigger>
                <TabsTrigger value="invoice">Invoice</TabsTrigger>
                <TabsTrigger value="billing">Billing Invoice</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="md:hidden max-w-xs">
            <Select value={view} onValueChange={(v) => setView(v as ApprovalView)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quotation">Quotation</SelectItem>
                <SelectItem value="request">Request</SelectItem>
                <SelectItem value="shipment">Shipment</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="billing">Billing Invoice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ApprovalTableGeneric
            key={refreshKey}
            action={action}
            onApprove={onApproved}
            onReject={onRejected}
          />
        </div>
      </div>
    </div>
  );
};

export default Approval;


