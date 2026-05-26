import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';
import toast from 'react-hot-toast';

export const placeOrder    = createAsyncThunk('orders/place',  async (d, { rejectWithValue }) => { try { const { data } = await API.post('/orders/create', d); return data.order; } catch (e) { return rejectWithValue(e.response?.data?.message); } });
export const fetchOrders   = createAsyncThunk('orders/fetch',  async (_, { rejectWithValue }) => { try { const { data } = await API.get('/orders/user'); return data.orders; } catch (e) { return rejectWithValue(e.response?.data?.message); } });
export const cancelOrder   = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => { try { const { data } = await API.put(`/orders/${id}/cancel`); return data.order; } catch (e) { return rejectWithValue(e.response?.data?.message); } });

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], loading: false },
  reducers: {},
  extraReducers: b => {
    b.addCase(placeOrder.pending,    s => { s.loading = true })
     .addCase(placeOrder.fulfilled,  (s, { payload }) => {
       s.loading = false; s.orders.unshift(payload); toast.success('Order placed! 🎉');
     })
     .addCase(placeOrder.rejected,   (s, { payload }) => { s.loading = false; toast.error(payload || 'Order failed'); })
     .addCase(fetchOrders.pending,   s => { s.loading = true })
     .addCase(fetchOrders.fulfilled, (s, { payload }) => { s.loading = false; s.orders = payload })
     .addCase(fetchOrders.rejected,  s => { s.loading = false })
     .addCase(cancelOrder.fulfilled, (s, { payload }) => {
       const i = s.orders.findIndex(o => o._id === payload._id);
       if (i !== -1) s.orders[i] = payload; toast.success('Order cancelled');
     })
     .addCase(cancelOrder.rejected, (s, { payload }) => toast.error(payload || 'Cancel failed'));
  },
});

export default orderSlice.reducer;
