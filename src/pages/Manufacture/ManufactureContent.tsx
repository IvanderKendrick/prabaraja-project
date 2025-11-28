import React from "react";
import BillOfMaterialTable from "./BoM/BillOfMaterialTable";
import ProductionPlanTable from "./PP/ProductionPlanTable";
import WorkInProcessTable from "./WiP/WorkInProcessTable";

interface Props {
  activeTab: string;
}

const ManufactureContent: React.FC<Props> = ({ activeTab }) => {
  return (
    <div className="space-y-6">
      {activeTab === "bill-of-materials" && <BillOfMaterialTable />}
      {activeTab === "production-plan" && <ProductionPlanTable />}
      {activeTab === "work-in-process" && <WorkInProcessTable />}
    </div>
  );
};

export default ManufactureContent;
