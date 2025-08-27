
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Account {
  id: string;
  name: string;
  code: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  balance: number;
  parentId?: string;
  description: string;
}

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  entries: Array<{
    accountId: string;
    accountName: string;
    debit: number;
    credit: number;
  }>;
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted';
}

interface AccountingState {
  accounts: Account[];
  journalEntries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  selectedAccount: Account | null;
  selectedJournalEntry: JournalEntry | null;
}

const initialState: AccountingState = {
  accounts: [],
  journalEntries: [],
  isLoading: false,
  error: null,
  selectedAccount: null,
  selectedJournalEntry: null,
};

export const fetchAccounts = createAsyncThunk(
  'accounting/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/api/accounts');
      
      if (!response.ok) {
        return rejectWithValue('Failed to fetch accounts');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchJournalEntries = createAsyncThunk(
  'accounting/fetchJournalEntries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/api/journal-entries');
      
      if (!response.ok) {
        return rejectWithValue('Failed to fetch journal entries');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const accountingSlice = createSlice({
  name: 'accounting',
  initialState,
  reducers: {
    setSelectedAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    setSelectedJournalEntry: (state, action) => {
      state.selectedJournalEntry = action.payload;
    },
    addJournalEntry: (state, action) => {
      state.journalEntries.unshift(action.payload);
    },
    updateAccountBalance: (state, action) => {
      const { accountId, amount } = action.payload;
      const account = state.accounts.find(a => a.id === accountId);
      if (account) {
        account.balance += amount;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJournalEntries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.journalEntries = action.payload;
        state.error = null;
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSelectedAccount, 
  setSelectedJournalEntry, 
  addJournalEntry, 
  updateAccountBalance, 
  clearError 
} = accountingSlice.actions;

export default accountingSlice.reducer;
