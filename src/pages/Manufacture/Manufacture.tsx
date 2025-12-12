import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import ManufactureContent from "./ManufactureContent";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

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

  // Dummy summary values
  const totalBOM = 3;
  const totalWIP = 3;

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header title={headerTitle} description={headerDescription} />

        {/* -------------------------- NEW SECTION: SUMMARY CARDS -------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 mt-4">
          {/* Card 1: Total BOM */}
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-gray-600">
                Total Bill of Material
              </p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {totalBOM}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total WIP */}
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-gray-600">
                Total Work In Process (Unfinished)
              </p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {totalWIP}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* ------------------------------------------------------------------------------ */}

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
