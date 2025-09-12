
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { AccountActionDropdown } from "@/components/bank/AccountActionDropdown";

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
  category?: string;
  reference?: string;
}

interface AccountsTableProps {
  accounts: Account[];
  showArchived: boolean;
  onArchive: (account: Account) => void;
  onUnarchive: (account: Account) => void;
  onDelete: (account: Account) => void;
  onEdit: (account: Account) => void;
  onTransferFunds: (fromCode: string, toCode: string, amount: number, notes: string) => void;
  onReceiveMoney: (accountCode: string, amount: number, payer: string, reference: string, date: Date, notes: string) => void;
  getAccountTransactions: (accountCode: string) => Transaction[];
}

export function AccountsTable({
  accounts,
  showArchived,
  onArchive,
  onUnarchive,
  onDelete,
  onEdit,
  onTransferFunds,
  onReceiveMoney,
  getAccountTransactions
}: AccountsTableProps) {
  const visibleAccounts = accounts.filter(account => account.archived === showArchived);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account code</TableHead>
          <TableHead>Account name</TableHead>
          <TableHead>Account Bank</TableHead>
          <TableHead>Balance in Prabasena</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleAccounts.map((account) => (
          <TableRow key={account.code}>
            <TableCell>{account.code}</TableCell>
            <TableCell>{account.name}</TableCell>
            <TableCell>{account.bankName}</TableCell>
            <TableCell>{account.balance}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end items-center space-x-1">
                <AccountActionDropdown
                  account={account}
                  onArchive={onArchive}
                  onEdit={onEdit}
                  onUnarchive={onUnarchive}
                  onDelete={onDelete}
                  transactions={getAccountTransactions(account.code)}
                  allAccounts={accounts}
                  onTransferFunds={onTransferFunds}
                  onReceiveMoney={onReceiveMoney}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
