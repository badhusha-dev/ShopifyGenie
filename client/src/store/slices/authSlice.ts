import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff' | 'customer';
  shopDomain?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Safe localStorage access
const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  token: getStoredToken(),
  isLoading: false,
  error: null,
  isAuthenticated: !!getStoredToken(),
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Login failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      // Store token in localStorage safely
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('authToken', data.token);
        } catch (error) {
          console.warn('Failed to store token in localStorage:', error);
        }
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role = 'customer' }: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Registration failed');
      }

      localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token || getStoredToken();

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token is invalid, clear it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        return rejectWithValue('Authentication token expired');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('fetchCurrentUser error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user data');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout endpoint (optional, as JWT is stateless)
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getStoredToken()}`,
          },
        });
      } catch (error) {
        // Ignore network errors during logout
        console.warn('Logout API call failed:', error);
      }

      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('authToken');
        } catch (error) {
          console.warn('Failed to clear token from localStorage:', error);
        }
      }

      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false; // This line might need adjustment based on how you manage auth status
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Clear previous errors when fetching
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // Assuming payload is the user object directly
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null; // Clear token if fetch fails (e.g., expired)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
      })
      // Logout
      .addCase(logout.pending, (state) => {
        // Optionally handle loading state for logout if it's async and shows UI feedback
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { logout: logoutAction, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;