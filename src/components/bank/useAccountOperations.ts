import { useState, useEffect } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { parseInputCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { handleError, showSuccessMessage } from "@/utils/errorHandler";

interface Account {
  code: string;
  name: string;
  balance: string;
  bankName?: string;
  bankType?: string;
  accountNumber?: string;
  archived?: boolean;
  accountType?: string;
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

export function useAccountOperations() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Debug: Log user context
  useEffect(() => {
    console.log('🔍 Cash & Bank Debug - User context:', {
      userId: user?.id,
      userEmail: user?.email,
      userExists: !!user
    });
  }, [user]);

  // Fetch accounts from database
  const fetchAccounts = async () => {
    if (!user?.id) {
      console.log('❌ Cash & Bank Debug - No user ID found, skipping fetch');
      setLoading(false);
      return;
    }
    
    console.log('🔍 Cash & Bank Debug - Starting fetchAccounts for user:', user.id);
    
    try {
      console.log('🔍 Cash & Bank Debug - Executing Supabase query...');
      const { data, error } = await supabase
        .from('cashbank')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      console.log('🔍 Cash & Bank Debug - Supabase response:', {
        data: data,
        dataLength: data?.length || 0,
        error: error,
        userId: user.id
      });

      if (error) {
        console.error('❌ Cash & Bank Debug - Supabase error:', error);
        throw error;
      }

      const formattedAccounts = data?.map(account => {
        console.log('🔍 Cash & Bank Debug - Processing account:', {
          id: account.id,
          number: account.number,
          name: account.account_name,
          balance: account.balance,
          userId: account.user_id
        });

        return {
          code: account.number.toString(),
          name: account.account_name,
          balance: account.balance >= 0 
            ? `Rp ${account.balance.toLocaleString('id-ID')}` 
            : `(Rp ${Math.abs(account.balance).toLocaleString('id-ID')})`,
          bankName: account.bank_name,
          bankType: account.account_type,
          accountNumber: account.bank_number,
          archived: account.status === 'Archived',
          accountType: account.account_type
        };
      }) || [];

      console.log('🔍 Cash & Bank Debug - Formatted accounts:', {
        count: formattedAccounts.length,
        accounts: formattedAccounts
      });

      setAccounts(formattedAccounts);
    } catch (error) {
      console.error('❌ Cash & Bank Debug - Error in fetchAccounts:', error);
      handleError(error, 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions from database
  const fetchTransactions = async () => {
    if (!user?.id) {
      console.log('❌ Cash & Bank Debug - No user ID found for transactions');
      return;
    }
    
    console.log('🔍 Cash & Bank Debug - Starting fetchTransactions for user:', user.id);
    
    try {
      // Fetch transfer transactions
      const { data: transfers, error: transferError } = await supabase
        .from('bank_transfer_transactions')
        .select('*')
        .eq('user_id', user.id);

      // Fetch receive transactions
      const { data: receives, error: receiveError } = await supabase
        .from('bank_receive_transactions')
        .select('*')
        .eq('user_id', user.id);

      // Get all cashbank accounts to map IDs to numbers
      const { data: cashbankAccounts, error: accountsError } = await supabase
        .from('cashbank')
        .select('id, number')
        .eq('user_id', user.id);

      console.log('🔍 Cash & Bank Debug - Transaction queries result:', {
        transfers: transfers?.length || 0,
        receives: receives?.length || 0,
        transferError: transferError,
        receiveError: receiveError,
        accountsError: accountsError
      });

      if (transferError) throw transferError;
      if (receiveError) throw receiveError;
      if (accountsError) throw accountsError;

      // Create a map of account ID to account number
      const accountMap = new Map();
      cashbankAccounts?.forEach(account => {
        accountMap.set(account.id, account.number.toString());
      });

      const formattedTransactions: Transaction[] = [];

      // Format transfer transactions
      transfers?.forEach(transfer => {
        // Outflow from source account
        formattedTransactions.push({
          id: `${transfer.id}-out`,
          date: new Date(transfer.created_at),
          description: `Transfer to account`,
          amount: transfer.amount,
          type: "outflow",
          accountCode: accountMap.get(transfer.from_account) || '',
          reference: transfer.notes || "Fund transfer"
        });

        // Inflow to target account
        formattedTransactions.push({
          id: `${transfer.id}-in`,
          date: new Date(transfer.created_at),
          description: `Transfer from account`,
          amount: transfer.amount,
          type: "inflow",
          accountCode: accountMap.get(transfer.to_account) || '',
          reference: transfer.notes || "Fund transfer"
        });
      });

      // Format receive transactions
      receives?.forEach(receive => {
        formattedTransactions.push({
          id: receive.id,
          date: new Date(receive.date_received),
          description: `Payment from ${receive.payer_name}${receive.notes ? `: ${receive.notes}` : ''}`,
          amount: receive.amount,
          type: "inflow",
          accountCode: accountMap.get(receive.receiving_account) || '',
          reference: receive.reference || receive.payer_name
        });
      });

      console.log('🔍 Cash & Bank Debug - Final transactions:', {
        totalCount: formattedTransactions.length,
        transfers: transfers?.length || 0,
        receives: receives?.length || 0
      });

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('❌ Cash & Bank Debug - Error fetching transactions:', error);
      handleError(error, 'Failed to load transaction history');
    }
  };

  useEffect(() => {
    console.log('🔍 Cash & Bank Debug - useEffect triggered with user:', {
      userId: user?.id,
      isAuthenticated: !!user
    });
    
    if (user?.id) {
      fetchAccounts();
      fetchTransactions();
    } else {
      console.log('⚠️ Cash & Bank Debug - No authenticated user, clearing data');
      setAccounts([]);
      setTransactions([]);
      setLoading(false);
    }
  }, [user?.id]);

  const generateUniqueAccountCode = async () => {
    if (!user?.id) return null;
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const accountCode = `1${timestamp}${randomSuffix}`;
      
      console.log('🔍 Cash & Bank Debug - Checking account code availability:', accountCode);
      
      // Check if this account code already exists
      const { data: existingAccount, error } = await supabase
        .from('cashbank')
        .select('number')
        .eq('number', parseInt(accountCode))
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No existing account found, this code is available
        console.log('✅ Cash & Bank Debug - Account code available:', accountCode);
        return accountCode;
      } else if (error) {
        console.error('❌ Cash & Bank Debug - Error checking account code:', error);
        throw error;
      }
      
      console.log('⚠️ Cash & Bank Debug - Account code already exists, trying again');
      attempts++;
    }
    
    throw new Error('Unable to generate unique account code after multiple attempts');
  };

  const handleCreateAccount = async (formData: any) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      console.log('🔍 Cash & Bank Debug - Creating account with data:', formData);
      
      let accountCode = formData.accountCode;
      if (!accountCode) {
        accountCode = await generateUniqueAccountCode();
        if (!accountCode) {
          toast.error('Failed to generate unique account code');
          return;
        }
      } else {
        // Check if custom account code already exists
        const { data: existingAccount, error: checkError } = await supabase
          .from('cashbank')
          .select('number')
          .eq('number', parseInt(accountCode))
          .eq('user_id', user.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Cash & Bank Debug - Error checking custom account code:', checkError);
          throw checkError;
        }
        
        if (existingAccount) {
          toast.error('Account code already exists. Please choose a different code.');
          return;
        }
      }

      const { error } = await supabase
        .from('cashbank')
        .insert({
          user_id: user.id,
          number: parseInt(accountCode),
          account_name: formData.accountName,
          account_type: formData.bankType,
          bank_name: formData.bankName,
          bank_number: formData.accountNumber,
          balance: formData.startBalance,
          status: 'Active'
        });

      if (error) {
        console.error('❌ Cash & Bank Debug - Insert error:', error);
        throw error;
      }

      console.log('✅ Cash & Bank Debug - Account created successfully');
      showSuccessMessage("Account created successfully");
      fetchAccounts();
    } catch (error) {
      console.error('❌ Cash & Bank Debug - Error creating account:', error);
      handleError(error, 'Failed to create account');
    }
  };

  const handleArchiveAccount = async (accountToArchive: Account) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('cashbank')
        .update({ status: 'Archived' })
        .eq('user_id', user.id)
        .eq('number', parseInt(accountToArchive.code));

      if (error) throw error;

      showSuccessMessage("Account archived successfully");
      fetchAccounts();
    } catch (error) {
      console.error('Error archiving account:', error);
      handleError(error, 'Failed to archive account');
    }
  };

  const handleUnarchiveAccount = async (accountToUnarchive: Account) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('cashbank')
        .update({ status: 'Active' })
        .eq('user_id', user.id)
        .eq('number', parseInt(accountToUnarchive.code));

      if (error) throw error;

      showSuccessMessage("Account unarchived successfully");
      fetchAccounts();
    } catch (error) {
      console.error('Error unarchiving account:', error);
      handleError(error, 'Failed to unarchive account');
    }
  };

  const handleDeleteAccount = async (accountToDelete: Account) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('cashbank')
        .delete()
        .eq('user_id', user.id)
        .eq('number', parseInt(accountToDelete.code));

      if (error) throw error;

      showSuccessMessage("Account deleted permanently");
      fetchAccounts();
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting account:', error);
      handleError(error, 'Failed to delete account');
    }
  };

  const handleEditAccount = async (updatedAccount: Account) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('cashbank')
        .update({
          account_name: updatedAccount.name,
          bank_name: updatedAccount.bankName,
          bank_number: updatedAccount.accountNumber,
          balance: parseInputCurrency(updatedAccount.balance.replace(/[()]/g, ''))
        })
        .eq('user_id', user.id)
        .eq('number', parseInt(updatedAccount.code));

      if (error) throw error;

      showSuccessMessage("Account updated successfully");
      fetchAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      handleError(error, 'Failed to update account');
    }
  };
  
  const handleTransferFunds = async (fromCode: string, toCode: string, amount: number, notes: string) => {
    if (!user?.id) return;

    try {
      // Get source and destination accounts with their IDs and types
      const { data: fromAccountData } = await supabase
        .from('cashbank')
        .select('id, balance, account_type')
        .eq('user_id', user.id)
        .eq('number', parseInt(fromCode))
        .single();

      const { data: toAccountData } = await supabase
        .from('cashbank')
        .select('id, balance, account_type')
        .eq('user_id', user.id)
        .eq('number', parseInt(toCode))
        .single();

      if (!fromAccountData || !toAccountData) {
        throw new Error('Account not found. Please refresh and try again.');
      }

      // Check for invalid account type transfers
      if (fromAccountData.account_type === 'Credit' && toAccountData.account_type === 'Debit') {
        throw new Error('credit_to_debit_transfer');
      }
      
      if (fromAccountData.account_type === 'Debit' && toAccountData.account_type === 'Credit') {
        throw new Error('debit_to_credit_transfer');
      }

      // Check for sufficient funds
      if (fromAccountData.balance < amount) {
        throw new Error('insufficient_funds');
      }

      const sourceBefore = fromAccountData.balance;
      const targetBefore = toAccountData.balance;
      const sourceAfter = sourceBefore - amount;
      const targetAfter = targetBefore + amount;

      // Create transfer transaction record using account IDs
      const { error: transferError } = await supabase
        .from('bank_transfer_transactions')
        .insert({
          user_id: user.id,
          from_account: fromAccountData.id,
          to_account: toAccountData.id,
          amount: amount,
          notes: notes,
          number: Date.now(), // Simple number generation
          source_balance_before: sourceBefore,
          source_balance_after: sourceAfter,
          target_balance_before: targetBefore,
          target_balance_after: targetAfter
        });

      if (transferError) throw transferError;

      // Update account balances using IDs
      const { error: updateFromError } = await supabase
        .from('cashbank')
        .update({ balance: sourceAfter })
        .eq('id', fromAccountData.id);

      const { error: updateToError } = await supabase
        .from('cashbank')
        .update({ balance: targetAfter })
        .eq('id', toAccountData.id);

      if (updateFromError || updateToError) {
        throw new Error('Failed to update account balances');
      }

      showSuccessMessage("Funds transferred successfully");
      fetchAccounts();
      fetchTransactions();
    } catch (error) {
      console.error('Error transferring funds:', error);
      if (error.message?.includes('22P02')) {
        handleError(error, 'Internal account mapping issue. Please refresh and try again.');
      } else {
        handleError(error, 'Failed to transfer funds');
      }
    }
  };
  
  const handleReceiveMoney = async (accountCode: string, amount: number, payer: string, reference: string, date: Date, notes: string) => {
    if (!user?.id) return;

    try {
      // Get account ID and current balance
      const { data: account } = await supabase
        .from('cashbank')
        .select('id, balance')
        .eq('user_id', user.id)
        .eq('number', parseInt(accountCode))
        .single();

      if (!account) {
        throw new Error('Account not found. Please refresh and try again.');
      }

      const balanceBefore = account.balance;
      const balanceAfter = balanceBefore + amount;

      // Create receive transaction record using account ID
      const { error: receiveError } = await supabase
        .from('bank_receive_transactions')
        .insert({
          user_id: user.id,
          receiving_account: account.id,
          amount: amount,
          payer_name: payer,
          reference: reference,
          date_received: date.toISOString().split('T')[0],
          notes: notes,
          number: Date.now(), // Simple number generation
          target_balance_before: balanceBefore,
          target_balance_after: balanceAfter
        });

      if (receiveError) throw receiveError;

      // Update account balance using ID
      const { error: updateError } = await supabase
        .from('cashbank')
        .update({ balance: balanceAfter })
        .eq('id', account.id);

      if (updateError) throw updateError;

      showSuccessMessage("Money received successfully");
      fetchAccounts();
      fetchTransactions();
    } catch (error) {
      console.error('Error receiving money:', error);
      if (error.message?.includes('22P02')) {
        handleError(error, 'Internal account mapping issue. Please refresh and try again.');
      } else {
        handleError(error, 'Failed to receive money');
      }
    }
  };

  const calculateTotal = (filteredAccounts: Account[]) => {
    return filteredAccounts.reduce((total, account) => {
      const amount = parseInt(account.balance.replace(/[^\d-]/g, '')) || 0;
      return total + amount;
    }, 0);
  };

  const getAccountTransactions = (accountCode: string) => {
    return transactions.filter(t => t.accountCode === accountCode);
  };

  return {
    accounts,
    transactions,
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
  };
}
