import React from "react";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="flex gap-6 m-6">
      <button
        className={`px-4 py-2 rounded-md ${
          activeTab === "Products" ? "bg-white  border-b-4" : "text-gray-500"
        }`}
        onClick={() => setActiveTab("Products")}
      >
        Products
      </button>
      <button
        className={`px-4 py-2 rounded-md ${
          activeTab === "Warehouses" ? "bg-white  border-b-4" : "text-gray-500"
        }`}
        onClick={() => setActiveTab("Warehouses")}
      >
        Warehouses
      </button>
    </div>
  );
};
