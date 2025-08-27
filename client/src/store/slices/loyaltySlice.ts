
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'earned' | 'redeemed';
  points: number;
  orderId?: string;
  description: string;
  createdAt: string;
}

interface LoyaltyTier {
  id: string;
  name: string;
  minimumPoints: number;
  benefits: string[];
  color: string;
}

interface LoyaltyState {
  transactions: LoyaltyTransaction[];
  tiers: LoyaltyTier[];
  isLoading: boolean;
  error: string | null;
  stats: {
    totalEarned: number;
    totalRedeemed: number;
    averagePointsPerCustomer: number;
  };
}

const initialState: LoyaltyState = {
  transactions: [],
  tiers: [],
  isLoading: false,
  error: null,
  stats: {
    totalEarned: 0,
    totalRedeemed: 0,
    averagePointsPerCustomer: 0,
  },
};

export const fetchLoyaltyTransactions = createAsyncThunk(
  'loyalty/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/api/loyalty/transactions');
      
      if (!response.ok) {
        return rejectWithValue('Failed to fetch loyalty transactions');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchLoyaltyTiers = createAsyncThunk(
  'loyalty/fetchTiers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/api/loyalty/tiers');
      
      if (!response.ok) {
        return rejectWithValue('Failed to fetch loyalty tiers');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
      
      // Update stats
      if (action.payload.type === 'earned') {
        state.stats.totalEarned += action.payload.points;
      } else {
        state.stats.totalRedeemed += action.payload.points;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoyaltyTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoyaltyTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        
        // Calculate stats
        const earned = action.payload.filter((t: LoyaltyTransaction) => t.type === 'earned');
        const redeemed = action.payload.filter((t: LoyaltyTransaction) => t.type === 'redeemed');
        
        state.stats.totalEarned = earned.reduce((sum: number, t: LoyaltyTransaction) => sum + t.points, 0);
        state.stats.totalRedeemed = redeemed.reduce((sum: number, t: LoyaltyTransaction) => sum + t.points, 0);
        
        state.error = null;
      })
      .addCase(fetchLoyaltyTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLoyaltyTiers.fulfilled, (state, action) => {
        state.tiers = action.payload;
      });
  },
});

export const { addTransaction, clearError } = loyaltySlice.actions;
export default loyaltySlice.reducer;
