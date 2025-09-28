import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AdjustStock = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Adjust Stock" description="This feature is coming soon!" />
        <div className="p-6">
          <Button onClick={() => navigate("/products")}>Back to Products</Button>
        </div>
      </div>
    </div>
  );
};

export default AdjustStock;
