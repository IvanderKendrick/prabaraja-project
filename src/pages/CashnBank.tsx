import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { BankHeader } from "@/components/bank/BankHeader";
import { Header } from "@/components/Header";
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
    getAccountTransactions,
  } = useAccountOperations();

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Header
            title="Cash & Bank"
            description="Manage your company bank accounts"
          />
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
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header
          title="Cash & Bank"
          description="Manage your company bank accounts"
        />

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
