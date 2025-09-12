import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PurchaseTabControlsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  pendingRequestCount?: number;
}

export function PurchaseTabControls({
  activeTab,
  setActiveTab,
  pendingRequestCount = 0,
}: PurchaseTabControlsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="shipments">Shipments</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="offers">Offers</TabsTrigger>
        <TabsTrigger value="requests">Requests</TabsTrigger>
        <TabsTrigger 
          value="approval"
          className="flex items-center gap-2"
        >
          Approval
          {pendingRequestCount > 0 && (
            <Badge className="px-2 py-0.5 text-xs">
              {pendingRequestCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}