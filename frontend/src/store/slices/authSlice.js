import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';
import toast from 'react-hot-toast';

const saved = { user: null, token: null };
try {
  saved.token = localStorage.getItem('qb-token');
  saved.user  = JSON.parse(localStorage.getItem('qb-user') || 'null');
} catch {}

export const registerUser = createAsyncThunk('auth/register', async (fd, { rejectWithValue }) => {
  try { const { data } = await API.post('/auth/register', fd); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try { const { data } = await API.post('/auth/login', creds); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (fd, { rejectWithValue }) => {
  try { const { data } = await API.put('/auth/profile', fd); return data.user; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Update failed'); }
});

export const toggleWishlist = createAsyncThunk('auth/wishlist', async (pid, { rejectWithValue }) => {
  try { const { data } = await API.put(`/auth/wishlist/${pid}`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: saved.user, token: saved.token,
    isAuthenticated: !!saved.token, loading: false,
  },
  reducers: {
    logout(state) {
      state.user = null; state.token = null; state.isAuthenticated = false;
      localStorage.removeItem('qb-token'); localStorage.removeItem('qb-user');
      toast.success('Logged out!');
    },
  },
  extraReducers: b => {
    b.addCase(registerUser.pending,   s => { s.loading = true })
     .addCase(registerUser.fulfilled, (s, { payload }) => {
       s.loading = false; s.user = payload.user; s.token = payload.token; s.isAuthenticated = true;
       localStorage.setItem('qb-token', payload.token);
       localStorage.setItem('qb-user', JSON.stringify(payload.user));
       toast.success(payload.message || 'Welcome!');
     })
     .addCase(registerUser.rejected, (s, { payload }) => { s.loading = false; toast.error(payload); })
     .addCase(loginUser.pending,   s => { s.loading = true })
     .addCase(loginUser.fulfilled, (s, { payload }) => {
       s.loading = false; s.user = payload.user; s.token = payload.token; s.isAuthenticated = true;
       localStorage.setItem('qb-token', payload.token);
       localStorage.setItem('qb-user', JSON.stringify(payload.user));
       toast.success(payload.message || 'Welcome back!');
     })
     .addCase(loginUser.rejected, (s, { payload }) => { s.loading = false; toast.error(payload); })
     .addCase(updateProfile.fulfilled, (s, { payload }) => {
       s.user = payload; localStorage.setItem('qb-user', JSON.stringify(payload));
       toast.success('Profile updated!');
     })
     .addCase(toggleWishlist.fulfilled, (s, { payload }) => {
       if (s.user) { s.user.wishlist = payload.wishlist; localStorage.setItem('qb-user', JSON.stringify(s.user)); }
       toast.success(payload.message);
     });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
