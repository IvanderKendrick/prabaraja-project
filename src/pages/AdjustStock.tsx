import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AdjustStock = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/products")}
            className="bg-white hover:bg-white/10 rounded-md p-2 mr-4"
            aria-label="Back to Products"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold ">Adjust Stock</h1>
            <p className="">This feature is coming soon!</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <Button onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdjustStock;
