import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { PurchaseContent } from "@/components/purchases/PurchaseContent";
import { useParams } from "react-router-dom";

const Purchases = () => {
  const { tab } = useParams();

  const activeKey = (tab as string) || "invoices";

  const toTitleCase = (key: string) =>
    key
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const headerTitle = `Purchases ${toTitleCase(activeKey)}`;
  const headerDescription = `Manage your purchase ${activeKey.toLowerCase()} transactions`;

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header
          title={headerTitle}
          description={headerDescription}
        />
        <div className="p-6">
          <PurchaseContent />
        </div>
      </div>
    </div>
  );
};

export default Purchases;
