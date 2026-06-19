import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mallService } from '../../services/mallService';

export const fetchMalls = createAsyncThunk('malls/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await mallService.list(params);
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to load malls');
  }
});

export const fetchMallById = createAsyncThunk('malls/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await mallService.getById(id);
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to load mall');
  }
});

export const createMall = createAsyncThunk('malls/create', async (payload, { rejectWithValue }) => {
  try {
    return await mallService.create(payload);
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to create mall');
  }
});

export const updateMall = createAsyncThunk('malls/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await mallService.update(id, payload);
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to update mall');
  }
});

export const deleteMall = createAsyncThunk('malls/delete', async (id, { rejectWithValue }) => {
  try {
    await mallService.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to delete mall');
  }
});

const initialState = {
  items: [],
  selected: null,
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
};

const mallsSlice = createSlice({
  name: 'malls',
  initialState,
  reducers: {
    clearSelectedMall: (state) => {
      state.selected = null;
    },
    setMallsPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMalls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMalls.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.items = payload.items || payload.malls || payload || [];
        state.total = payload.total ?? state.items.length;
      })
      .addCase(fetchMalls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMallById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createMall.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateMall.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?._id === action.payload._id) state.selected = action.payload;
      })
      .addCase(deleteMall.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m._id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { clearSelectedMall, setMallsPage } = mallsSlice.actions;
export default mallsSlice.reducer;
