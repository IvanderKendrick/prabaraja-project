
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Truck } from "lucide-react";

interface SalesNavTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SalesNavTabs = ({ activeTab, setActiveTab }: SalesNavTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
      <TabsList className="w-full max-w-md border-b bg-transparent p-0">
        <TabsTrigger 
          value="delivery" 
          className={`flex items-center gap-2 rounded-none border-b-2 px-4 py-2 ${
            activeTab === "delivery" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          <FileText className="h-4 w-4" />
          Sales Invoices
        </TabsTrigger>
        
        <TabsTrigger 
          value="order" 
          className={`flex items-center gap-2 rounded-none border-b-2 px-4 py-2 ${
            activeTab === "order" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"
          }`}
        >
          <Truck className="h-4 w-4" />
          Order & Delivery
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
      </TabsList>
    </Tabs>
  );
};
