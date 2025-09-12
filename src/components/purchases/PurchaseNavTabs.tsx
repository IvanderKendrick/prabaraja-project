
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Truck, ShoppingCart, Tag, FileQuestion, CheckCircle } from "lucide-react";

interface PurchaseNavTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const PurchaseNavTabs = ({ activeTab, setActiveTab }: PurchaseNavTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full max-w-4xl border-b bg-transparent p-0">
        <TabsTrigger 
          value="invoices" 
          className={`flex items-center gap-2 rounded-none border-b-2 px-4 py-2 ${
            activeTab === "invoices" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          <FileText className="h-4 w-4" />
          Invoices
        </TabsTrigger>
        
        <TabsTrigger 
          value="shipments" 
          className={`flex items-center gap-2 rounded-none border-b-2 px-4 py-2 ${
            activeTab === "shipments" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          <Truck className="h-4 w-4" />
          Shipments
        </TabsTrigger>
        
        <TabsTrigger 
          value="orders" 
          className={`flex items-center gap-2 rounded-none border-b-2 px-4 py-2 ${
            activeTab === "orders" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Orders
        </TabsTrigger>
        
        <TabsTrigger 
          value="requests" 
          className={`flex items-center gap-2 rounded-none border-b-2 px-4 py-2 ${
            activeTab === "requests" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          <FileQuestion className="h-4 w-4" />
          Requests
        </TabsTrigger>
        
        <TabsTrigger 
          value="offers" 
          className={`flex items-center gap-2 rounded-none border-b-2 px-4 py-2 ${
            activeTab === "offers" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          <Tag className="h-4 w-4" />
          Offers
        </TabsTrigger>
        
        <TabsTrigger 
          value="quotation" 
          className={`flex items-center gap-2 rounded-none border-b-2 px-4 py-2 ${
            activeTab === "quotation" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          <FileText className="h-4 w-4" />
          Quotation
        </TabsTrigger>
        
        <TabsTrigger 
          value="approval" 
          className={`flex items-center gap-2 rounded-none border-b-2 px-4 py-2 ${
            activeTab === "approval" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Approval
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
