import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ApprovalTableGeneric } from "@/components/purchases/tables/ApprovalTableGeneric";
import { useApprovalActions } from "@/hooks/useApprovalActions";

const ApprovalRequest = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { handleApprove, handleReject, isLoading } = useApprovalActions('REQUEST');

  // Handle approve approval
  const handleApproveApproval = async (id: string) => {
    const success = await handleApprove(id);
    if (success) {
      // Refresh the table data
      setRefreshKey(prev => prev + 1);
    }
  };

  // Handle reject approval
  const handleRejectApproval = async (id: string) => {
    const success = await handleReject(id);
    if (success) {
      // Refresh the table data
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header
          title="Approval Request"
          description="Manage request approvals"
        />
        <div className="p-6">
          <ApprovalTableGeneric
            key={refreshKey}
            action="getApprovalRequest"
            onApprove={handleApproveApproval}
            onReject={handleRejectApproval}
          />
        </div>
      </div>
    </div>
  );
};

export default ApprovalRequest;
