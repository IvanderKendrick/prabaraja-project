import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCOAAccounts,
  useJournalTransactionsAPI,
  COAAccount,
} from "@/hooks/useMasterDataAPI";
import { CreateCOADialog } from "@/components/masterdata/CreateCOADialog";
import { CreateJournalDialog } from "@/components/masterdata/CreateJournalDialog";
import { EditCOADialog } from "@/components/masterdata/EditCOADialog";
import { DeleteCOADialog } from "@/components/masterdata/DeleteCOADialog";
import { Pencil, Trash2 } from "lucide-react";

const MasterData = () => {
  const navigate = useNavigate();
  const [selectedCoaCode, setSelectedCoaCode] = useState<string>("");
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [editingAccount, setEditingAccount] = useState<COAAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<COAAccount | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: chartOfAccounts,
    loading: coaLoading,
    refetch: refetchCOA,
  } = useCOAAccounts();
  const { data: journalTransactions, loading: journalLoading } =
    useJournalTransactionsAPI(selectedCoaCode);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("id-ID");
  };

  const generateJournalNumber = (dateString: string, id: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Fallback to current date if invalid
      const fallbackDate = new Date();
      const dateFormatted = fallbackDate
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      return `JRN-${dateFormatted}-${id.slice(-4)}`;
    }
    const dateFormatted = date.toISOString().slice(0, 10).replace(/-/g, "");
    return `JRN-${dateFormatted}-${id.slice(-4)}`;
  };

  const calculateRunningBalance = (
    transactions: any[],
    currentIndex: number
  ) => {
    let balance = 0;
    for (let i = 0; i <= currentIndex; i++) {
      balance += (transactions[i].debit || 0) - (transactions[i].credit || 0);
    }
    return balance;
  };

  const handleEdit = (account: COAAccount) => {
    setEditingAccount(account);
    setEditDialogOpen(true);
  };

  const handleDelete = (account: COAAccount) => {
    setDeletingAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    refetchCOA();
  };

  const handleDeleteSuccess = () => {
    refetchCOA();
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-8">
          <h1 className="text-2xl font-semibold">Chart of Accounts</h1>
          <p className="">
            Manage your chart of accounts and reference information
          </p>
        </div>

        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate("/note-journal")}>
              Note Journal
            </Button>
            <CreateCOADialog>
              <Button>Create New COA</Button>
            </CreateCOADialog>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="coa" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="coa">COA</TabsTrigger>
              <TabsTrigger value="journal">Journal</TabsTrigger>
            </TabsList>

            <TabsContent value="coa" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">
                        Balance in IDR
                      </TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coaLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : chartOfAccounts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No chart of accounts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      chartOfAccounts?.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono">
                            {account.account_code}
                          </TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell>{account.category}</TableCell>
                          <TableCell>All</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(account.entry_balance || 0)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(account)}
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(account)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="journal" className="space-y-4">
              <div className="space-y-4">
                {/* COA Selection */}
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedCoaCode}
                    onValueChange={setSelectedCoaCode}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select COA Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {chartOfAccounts?.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.account_code}
                        >
                          {account.account_code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setShowJournalEntries(true)}
                    disabled={!selectedCoaCode}
                  >
                    Generate Journal Entry
                  </Button>
                </div>

                {/* Journal Entries Table */}
                {showJournalEntries && selectedCoaCode && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Journal Number</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {journalLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              Loading journal entries...
                            </TableCell>
                          </TableRow>
                        ) : journalTransactions?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              No journal entries found for selected account
                            </TableCell>
                          </TableRow>
                        ) : (
                          journalTransactions?.map((transaction, index) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                {formatDate(transaction.transaction_date)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-mono text-blue-600"
                                  onClick={() => {
                                    // Handle journal detail view
                                    console.log(
                                      "Show journal details for:",
                                      transaction.id
                                    );
                                  }}
                                >
                                  {generateJournalNumber(
                                    transaction.transaction_date,
                                    transaction.id
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {transaction.debit
                                  ? formatCurrency(transaction.debit)
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {transaction.credit
                                  ? formatCurrency(transaction.credit)
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(
                                  calculateRunningBalance(
                                    journalTransactions,
                                    index
                                  )
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingAccount && (
        <EditCOADialog
          account={editingAccount}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Dialog */}
      <DeleteCOADialog
        account={deletingAccount}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default MasterData;
