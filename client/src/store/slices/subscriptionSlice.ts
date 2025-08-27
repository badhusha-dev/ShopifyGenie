
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDelivery: string;
  amount: number;
  createdAt: string;
}

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
  selectedSubscription: Subscription | null;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  isLoading: false,
  error: null,
  selectedSubscription: null,
};

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/api/subscriptions');
      
      if (!response.ok) {
        return rejectWithValue('Failed to fetch subscriptions');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSelectedSubscription: (state, action) => {
      state.selectedSubscription = action.payload;
    },
    updateSubscriptionStatus: (state, action) => {
      const { subscriptionId, status } = action.payload;
      const subscription = state.subscriptions.find(s => s.id === subscriptionId);
      if (subscription) {
        subscription.status = status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload;
        state.error = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedSubscription, updateSubscriptionStatus, clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
