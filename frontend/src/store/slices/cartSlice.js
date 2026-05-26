import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart    = createAsyncThunk('cart/fetch',  async (_, { rejectWithValue }) => { try { const { data } = await API.get('/cart'); return data.cart; } catch (e) { return rejectWithValue(e.response?.data?.message); } });
export const addToCart    = createAsyncThunk('cart/add',    async ({ productId, quantity = 1 }, { rejectWithValue }) => { try { const { data } = await API.post('/cart/add', { productId, quantity }); return data.cart; } catch (e) { return rejectWithValue(e.response?.data?.message); } });
export const updateCart   = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => { try { const { data } = await API.put(`/cart/update/${productId}`, { quantity }); return data.cart; } catch (e) { return rejectWithValue(e.response?.data?.message); } });
export const removeCart   = createAsyncThunk('cart/remove', async (pid, { rejectWithValue }) => { try { const { data } = await API.delete(`/cart/remove/${pid}`); return data.cart; } catch (e) { return rejectWithValue(e.response?.data?.message); } });
export const clearCart    = createAsyncThunk('cart/clear',  async (_, { rejectWithValue }) => { try { await API.delete('/cart/clear'); return { items: [], total: 0 }; } catch (e) { return rejectWithValue(e.response?.data?.message); } });

const set = (state, { payload }) => { state.loading = false; state.items = payload?.items || []; state.total = payload?.total || 0; };

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0, loading: false },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchCart.pending,    s => { s.loading = true })
     .addCase(fetchCart.fulfilled,  set)
     .addCase(addToCart.pending,    s => { s.loading = true })
     .addCase(addToCart.fulfilled,  (s, a) => { set(s, a); toast.success('Added to cart! 🛒') })
     .addCase(addToCart.rejected,   (s, { payload }) => { s.loading = false; toast.error(payload || 'Failed to add') })
     .addCase(updateCart.fulfilled, set)
     .addCase(removeCart.fulfilled, (s, a) => { set(s, a); toast.success('Item removed') })
     .addCase(clearCart.fulfilled,  s => { s.items = []; s.total = 0 });
  },
});

export const selectCartCount = s => (s.cart.items || []).reduce((a, i) => a + i.quantity, 0);
export default cartSlice.reducer;
