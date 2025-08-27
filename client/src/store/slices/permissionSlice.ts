
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface PermissionState {
  permissions: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: {},
  isLoading: false,
  error: null,
};

export const fetchUserPermissions = createAsyncThunk(
  'permissions/fetchUserPermissions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      
      if (!auth.token || !auth.user) {
        return { permissions: {} };
      }

      const response = await fetch('/api/user-permissions', {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { permissions: data.permissions || {} };
      } else {
        return { permissions: {} };
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch permissions');
    }
  }
);

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearPermissions: (state) => {
      state.permissions = {};
      state.error = null;
    },
    setPermissions: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.permissions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload.permissions;
        state.error = null;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPermissions, setPermissions } = permissionSlice.actions;

// Selectors
export const selectPermissions = (state: RootState) => state.permissions.permissions;
export const selectHasPermission = (permission: string) => (state: RootState) => {
  // Super admin has all permissions
  if (state.auth.user?.role === 'superadmin') {
    return true;
  }
  return state.permissions.permissions[permission] === true;
};

export default permissionSlice.reducer;
