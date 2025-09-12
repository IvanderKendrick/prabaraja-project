
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { History, Pencil, Archive, ArrowRightLeft, PiggyBank, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Account {
  code: string;
  name: string;
  balance: string;
  bankName?: string;
  accountNumber?: string;
  archived?: boolean;
}

interface ActiveAccountMenuProps {
  account: Account;
  allAccounts: Account[];
  transactions: any[];
  onHistoryClick: () => void;
  onEditClick: () => void;
  onArchiveClick: () => void;
  onTransferClick: () => void;
  onReceiveClick: () => void;
}

export function ActiveAccountMenu({ 
  account, 
  allAccounts, 
  transactions,
  onHistoryClick, 
  onEditClick, 
  onArchiveClick, 
  onTransferClick, 
  onReceiveClick 
}: ActiveAccountMenuProps) {
  const navigate = useNavigate();

  // const handleCashflowAnalysisClick = () => {
  //   navigate('/cashflow-analysis', { 
  //     state: { 
  //       selectedAccount: account.code,
  //       accounts: allAccounts,
  //       transactions
  //     }
  //   });
  // };

  return (
    <DropdownMenuContent align="end" className="w-[200px] bg-background border z-50">
      <DropdownMenuItem onClick={onHistoryClick} className="cursor-pointer">
        <History className="mr-2 h-4 w-4 text-[#8B5CF6]" />
        History
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onEditClick} className="cursor-pointer">
        <Pencil className="mr-2 h-4 w-4 text-[#0FA0CE]" />
        Edit Account
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onArchiveClick} className="cursor-pointer">
        <Archive className="mr-2 h-4 w-4 text-[#ea384c]" />
        Archive Account
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onTransferClick} className="cursor-pointer">
        <ArrowRightLeft className="mr-2 h-4 w-4 text-[#3B82F6]" />
        Transfer Funds
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onReceiveClick} className="cursor-pointer">
        <PiggyBank className="mr-2 h-4 w-4 text-[#10B981]" />
        Receive Money
      </DropdownMenuItem>
      {/*
      <DropdownMenuItem onClick={handleCashflowAnalysisClick} className="cursor-pointer">
        <BarChart className="mr-2 h-4 w-4 text-[#8B5CF6]" />
        Cashflow Analysis
      </DropdownMenuItem>
      */}
    </DropdownMenuContent>
  );
}
