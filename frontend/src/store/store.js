import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import mallsReducer from './slices/mallsSlice';
import shopsReducer from './slices/shopsSlice';
import tenantsReducer from './slices/tenantsSlice';
import leasesReducer from './slices/leasesSlice';
import paymentsReducer from './slices/paymentsSlice';
import maintenanceReducer from './slices/maintenanceSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    malls: mallsReducer,
    shops: shopsReducer,
    tenants: tenantsReducer,
    leases: leasesReducer,
    payments: paymentsReducer,
    maintenance: maintenanceReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});
