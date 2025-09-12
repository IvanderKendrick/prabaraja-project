
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { EditAccountDialog } from "./EditAccountDialog";
import { TransactionHistoryDialog } from "./TransactionHistoryDialog";
import { TransferFundsDialog } from "./TransferFundsDialog";
import { ReceiveMoneyDialog } from "./ReceiveMoneyDialog";
import { ArchiveAccountDialog } from "./dialogs/ArchiveAccountDialog";
import { UnarchiveAccountDialog } from "./dialogs/UnarchiveAccountDialog";
import { DeleteAccountDialog } from "./dialogs/DeleteAccountDialog";
import { ArchivedAccountMenu } from "./menus/ArchivedAccountMenu";
import { ActiveAccountMenu } from "./menus/ActiveAccountMenu";

interface Account {
  code: string;
  name: string;
  balance: string;
  bankName?: string;
  accountNumber?: string;
  archived?: boolean;
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "inflow" | "outflow";
  accountCode: string;
  reference?: string;
}

interface AccountActionDropdownProps {
  account: Account;
  onArchive: (account: Account) => void;
  onEdit: (account: Account) => void;
  onUnarchive?: (account: Account) => void;
  onDelete?: (account: Account) => void;
  transactions?: Transaction[];
  allAccounts?: Account[];
  onTransferFunds?: (fromCode: string, toCode: string, amount: number, notes: string) => void;
  onReceiveMoney?: (accountCode: string, amount: number, payer: string, reference: string, date: Date, notes: string) => void;
}

export function AccountActionDropdown({ 
  account, 
  onArchive, 
  onEdit, 
  onUnarchive, 
  onDelete,
  transactions = [],
  allAccounts = [],
  onTransferFunds,
  onReceiveMoney
}: AccountActionDropdownProps) {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnarchiveDialog, setShowUnarchiveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);

  const handleEditSave = (updatedAccount: Account) => {
    onEdit(updatedAccount);
    setShowEditDialog(false);
  };

  const handleTransferFunds = (fromCode: string, toCode: string, amount: number, notes: string) => {
    if (onTransferFunds) {
      onTransferFunds(fromCode, toCode, amount, notes);
      setShowTransferDialog(false);
    }
  };

  const handleReceiveMoney = (accountCode: string, amount: number, payer: string, reference: string, date: Date, notes: string) => {
    if (onReceiveMoney) {
      onReceiveMoney(accountCode, amount, payer, reference, date, notes);
      setShowReceiveDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Action <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        {account.archived ? (
          <ArchivedAccountMenu 
            onUnarchive={() => setShowUnarchiveDialog(true)} 
            onDelete={() => setShowDeleteDialog(true)} 
          />
        ) : (
          <ActiveAccountMenu 
            account={account}
            allAccounts={allAccounts}
            transactions={transactions}
            onHistoryClick={() => setShowHistoryDialog(true)}
            onEditClick={() => setShowEditDialog(true)}
            onArchiveClick={() => setShowArchiveDialog(true)}
            onTransferClick={() => setShowTransferDialog(true)}
            onReceiveClick={() => setShowReceiveDialog(true)}
          />
        )}
      </DropdownMenu>

      {/* Dialogs */}
      <ArchiveAccountDialog 
        open={showArchiveDialog} 
        onOpenChange={setShowArchiveDialog} 
        account={account} 
        onArchive={onArchive} 
      />

      <UnarchiveAccountDialog 
        open={showUnarchiveDialog} 
        onOpenChange={setShowUnarchiveDialog} 
        account={account} 
        onUnarchive={onUnarchive || (() => {})} 
      />

      <DeleteAccountDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog} 
        account={account} 
        onDelete={onDelete || (() => {})} 
      />

      <EditAccountDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        account={account}
        onSave={handleEditSave}
      />
      
      <TransactionHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        account={account}
        transactions={transactions.filter(t => t.accountCode === account.code)}
      />

      {onTransferFunds && (
        <TransferFundsDialog
          open={showTransferDialog}
          onOpenChange={setShowTransferDialog}
          fromAccount={account}
          accounts={allAccounts.filter(a => !a.archived && a.code !== account.code)}
          onTransfer={handleTransferFunds}
        />
      )}

      {onReceiveMoney && (
        <ReceiveMoneyDialog
          open={showReceiveDialog}
          onOpenChange={setShowReceiveDialog}
          account={account}
          onReceive={handleReceiveMoney}
        />
      )}
    </>
  );
}
