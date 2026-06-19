import { createCrudSlice } from './createCrudSlice';
import { tenantService } from '../../services/tenantService';

const { slice, thunks } = createCrudSlice('tenants', tenantService);

export const { fetchAll: fetchTenants, fetchById: fetchTenantById, create: createTenant, update: updateTenant, remove: deleteTenant } = thunks;
export const { clearSelected: clearSelectedTenant, setPage: setTenantsPage } = slice.actions;
export default slice.reducer;
