import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useParams } from "react-router-dom";
import { InventoryContent } from "./InventoryContent";

const Inventory = () => {
  const { tab } = useParams();

  // Tentukan tab aktif berdasarkan URL
  const activeKey = (tab as string) || "stock";

  // Konversi slug ke format Title Case
  const toTitleCase = (key: string) =>
    key
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  // Title dan deskripsi di header
  const headerTitle = `Inventory ${toTitleCase(activeKey)}`;
  const headerDescription = `Manage your inventory ${activeKey.toLowerCase()} records`;

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar kiri */}
      <Sidebar />

      {/* Konten kanan */}
      <div className="flex-1 overflow-auto">
        <Header title={headerTitle} description={headerDescription} />

        <div className="p-6">
          <InventoryContent activeTab={activeKey} />
        </div>
      </div>
    </div>
  );
};

export default Inventory;
