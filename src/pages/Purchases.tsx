import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { PurchaseContent } from "@/components/purchases/PurchaseContent";

const Purchases = () => {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header
          title="Purchases"
          description="Manage your purchase transactions"
        />
        <div className="p-6">
          <PurchaseContent />
        </div>
      </div>
    </div>
  );
};

export default Purchases;
