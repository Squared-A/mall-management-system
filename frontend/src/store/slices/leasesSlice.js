import { createCrudSlice } from './createCrudSlice';
import { leaseService } from '../../services/leaseService';

const { slice, thunks } = createCrudSlice('leases', leaseService);

export const { fetchAll: fetchLeases, fetchById: fetchLeaseById, create: createLease, update: updateLease, remove: deleteLease } = thunks;
export const { clearSelected: clearSelectedLease, setPage: setLeasesPage } = slice.actions;
export default slice.reducer;
