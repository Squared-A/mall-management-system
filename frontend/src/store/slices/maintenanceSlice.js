import { createCrudSlice } from './createCrudSlice';
import { maintenanceService } from '../../services/maintenanceService';

const { slice, thunks } = createCrudSlice('maintenance', maintenanceService);

export const { fetchAll: fetchMaintenanceRequests, fetchById: fetchMaintenanceById, create: createMaintenanceRequest, update: updateMaintenanceRequest, remove: deleteMaintenanceRequest } = thunks;
export const { clearSelected: clearSelectedMaintenance, setPage: setMaintenancePage } = slice.actions;
export default slice.reducer;
