
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { BankHeader } from "@/components/bank/BankHeader";
import { AccountsTable } from "@/components/bank/AccountsTable";
import { AccountSummaryCards } from "@/components/bank/AccountSummaryCards";
import { useAccountOperations } from "@/components/bank/useAccountOperations";

const CashnBank = () => {
  const [showArchived, setShowArchived] = useState(false);
  const {
    accounts,
    loading,
    handleCreateAccount,
    handleArchiveAccount,
    handleUnarchiveAccount,
    handleDeleteAccount,
    handleEditAccount,
    handleTransferFunds,
    handleReceiveMoney,
    calculateTotal,
    getAccountTransactions
  } = useAccountOperations();

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
            <h1 className="text-2xl font-semibold text-white">Cash & Bank</h1>
            <p className="text-white/80">Manage your company Bank accounts</p>
          </div>
          <div className="p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading accounts...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
          <h1 className="text-2xl font-semibold text-white">Cash & Bank</h1>
          <p className="text-white/80"> Manage your company Bank accounts </p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <BankHeader 
              showArchived={showArchived} 
              setShowArchived={setShowArchived} 
              onCreateAccount={handleCreateAccount} 
            />

            <AccountsTable 
              accounts={accounts}
              showArchived={showArchived}
              onArchive={handleArchiveAccount}
              onUnarchive={handleUnarchiveAccount}
              onDelete={handleDeleteAccount}
              onEdit={handleEditAccount}
              onTransferFunds={handleTransferFunds}
              onReceiveMoney={handleReceiveMoney}
              getAccountTransactions={getAccountTransactions}
            />
          </div>

          <AccountSummaryCards 
            accounts={accounts} 
            calculateTotal={calculateTotal} 
          />
        </div>
      </div>
    </div>
  );
};

export default CashnBank;
