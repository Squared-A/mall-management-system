import { createCrudSlice } from './createCrudSlice';
import { shopService } from '../../services/shopService';

const { slice, thunks } = createCrudSlice('shops', shopService);

export const { fetchAll: fetchShops, fetchById: fetchShopById, create: createShop, update: updateShop, remove: deleteShop } = thunks;
export const { clearSelected: clearSelectedShop, setPage: setShopsPage } = slice.actions;
export default slice.reducer;
