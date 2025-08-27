
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import permissionSlice from './slices/permissionSlice';
import themeSlice from './slices/themeSlice';
import inventorySlice from './slices/inventorySlice';
import customerSlice from './slices/customerSlice';
import orderSlice from './slices/orderSlice';
import loyaltySlice from './slices/loyaltySlice';
import subscriptionSlice from './slices/subscriptionSlice';
import vendorSlice from './slices/vendorSlice';
import accountingSlice from './slices/accountingSlice';
import uiSlice from './slices/uiSlice';
import { persistMiddleware } from './middleware/persistMiddleware';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    permissions: permissionSlice,
    theme: themeSlice,
    inventory: inventorySlice,
    customers: customerSlice,
    orders: orderSlice,
    loyalty: loyaltySlice,
    subscriptions: subscriptionSlice,
    vendors: vendorSlice,
    accounting: accountingSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(persistMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
