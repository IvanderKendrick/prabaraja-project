
import React from "react";
import { PackagePlus, Warehouse, CirclePlus } from "lucide-react";
import { DropdownOption } from "@/types/products";
import { useNavigate } from "react-router-dom";

export const useDropdownOptions = () => {
  const navigate = useNavigate();

  const dropdownOptions: DropdownOption[] = [
    {
      label: "Add New Product",
      action: () => navigate("/add-product"), // Navigate to the "Add Product" page
      icon: <PackagePlus size={16} color="#F97316" />,
    },
    {
      label: "Add New Warehouse",
      action: () => navigate("/add-warehouse"), // Navigate to the "Add Warehouse" page
      icon: <Warehouse size={16} color="#8B5CF6" />,
    },
    {
      label: "Adjust Stock",
      action: () => navigate("/adjust-stock"), // Navigate to the "Adjust Stock" page
      icon: <CirclePlus size={16} color="#0EA5E9" />,
    },
  ];

  return dropdownOptions;
};
