import { createCrudSlice } from './createCrudSlice';
import { paymentService } from '../../services/paymentService';

const { slice, thunks } = createCrudSlice('payments', paymentService);

export const { fetchAll: fetchPayments, fetchById: fetchPaymentById, create: createPayment, update: updatePayment, remove: deletePayment } = thunks;
export const { clearSelected: clearSelectedPayment, setPage: setPaymentsPage } = slice.actions;
export default slice.reducer;
