
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  status: 'active' | 'inactive';
  totalPaid: number;
  outstandingAmount: number;
}

interface VendorState {
  vendors: Vendor[];
  isLoading: boolean;
  error: string | null;
  selectedVendor: Vendor | null;
}

const initialState: VendorState = {
  vendors: [],
  isLoading: false,
  error: null,
  selectedVendor: null,
};

export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/api/vendors');
      
      if (!response.ok) {
        return rejectWithValue('Failed to fetch vendors');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setSelectedVendor: (state, action) => {
      state.selectedVendor = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendors = action.payload;
        state.error = null;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedVendor, clearError } = vendorSlice.actions;
export default vendorSlice.reducer;
