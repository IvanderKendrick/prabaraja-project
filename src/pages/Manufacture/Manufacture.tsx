import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import ManufactureContent from "./ManufactureContent";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Manufacture = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bill-of-materials");

  const toTitleCase = (key: string) =>
    key
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

  const headerTitle = `Manufacture – ${toTitleCase(activeTab)}`;
  const headerDescription = `Manage ${toTitleCase(activeTab)} records`;

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header title={headerTitle} description={headerDescription} />

        <div className="p-6 space-y-5">
          {/* TOP BAR */}
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="bill-of-materials">
                  Bill of Materials
                </TabsTrigger>
                <TabsTrigger value="production-plan">
                  Production Plan
                </TabsTrigger>
                <TabsTrigger value="work-in-process">
                  Work in Process
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Add New Button */}
            <Button
              className="bg-sidebar-active hover:bg-green-600 text-white"
              onClick={() => navigate("/addnewbom")}
            >
              + Add New
            </Button>
          </div>

          {/* CONTENT */}
          <ManufactureContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default Manufacture;
