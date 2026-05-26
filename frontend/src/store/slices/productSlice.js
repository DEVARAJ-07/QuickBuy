import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchProducts  = createAsyncThunk('products/all', async (params, { rejectWithValue }) => { try { const { data } = await API.get('/products', { params }); return data; } catch (e) { return rejectWithValue(e.response?.data?.message); } });
export const fetchProductById = createAsyncThunk('products/one', async (id, { rejectWithValue }) => { try { const { data } = await API.get(`/products/${id}`); return data.product; } catch (e) { return rejectWithValue(e.response?.data?.message); } });
export const addReview = createAsyncThunk('products/review', async ({ id, data: rd }, { rejectWithValue }) => { try { const { data } = await API.post(`/products/${id}/review`, rd); return data.product; } catch (e) { return rejectWithValue(e.response?.data?.message); } });

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [], product: null, total: 0, pages: 1, loading: false,
    filters: { search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' },
  },
  reducers: {
    setFilters: (s, { payload }) => { s.filters = { ...s.filters, ...payload } },
    resetFilters: s => { s.filters = { search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' } },
    clearProduct: s => { s.product = null },
  },
  extraReducers: b => {
    b.addCase(fetchProducts.pending,    s => { s.loading = true })
     .addCase(fetchProducts.fulfilled,  (s, { payload }) => {
       s.loading = false; s.items = payload.products; s.total = payload.total; s.pages = payload.pages;
     })
     .addCase(fetchProducts.rejected,   s => { s.loading = false })
     .addCase(fetchProductById.pending, s => { s.loading = true; s.product = null })
     .addCase(fetchProductById.fulfilled, (s, { payload }) => { s.loading = false; s.product = payload })
     .addCase(fetchProductById.rejected,  s => { s.loading = false })
     .addCase(addReview.fulfilled, (s, { payload }) => { s.product = payload });
  },
});

export const { setFilters, resetFilters, clearProduct } = productSlice.actions;
export default productSlice.reducer;
