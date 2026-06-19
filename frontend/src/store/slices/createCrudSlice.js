import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Factory that generates a standard CRUD slice (list/detail/create/update/delete)
 * for a given entity backed by a service object with list/getById/create/update/remove methods.
 *
 * @param {string} name - slice name (e.g. 'shops')
 * @param {object} service - service object exposing list, getById, create, update, remove
 * @returns {{ slice, thunks }}
 */
export const createCrudSlice = (name, service) => {
  const fetchAll = createAsyncThunk(`${name}/fetchAll`, async (params, { rejectWithValue }) => {
    try {
      return await service.list(params);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || `Failed to load ${name}`);
    }
  });

  const fetchById = createAsyncThunk(`${name}/fetchById`, async (id, { rejectWithValue }) => {
    try {
      return await service.getById(id);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || `Failed to load ${name} item`);
    }
  });

  const create = createAsyncThunk(`${name}/create`, async (payload, { rejectWithValue }) => {
    try {
      return await service.create(payload);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || `Failed to create ${name} item`);
    }
  });

  const update = createAsyncThunk(`${name}/update`, async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await service.update(id, payload);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || `Failed to update ${name} item`);
    }
  });

  const remove = createAsyncThunk(`${name}/delete`, async (id, { rejectWithValue }) => {
    try {
      await service.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || `Failed to delete ${name} item`);
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

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      clearSelected: (state) => {
        state.selected = null;
      },
      setPage: (state, action) => {
        state.page = action.payload;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchAll.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.loading = false;
          const payload = action.payload;
          state.items = payload.items || payload[name] || payload || [];
          state.total = payload.total ?? state.items.length;
        })
        .addCase(fetchAll.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(fetchById.fulfilled, (state, action) => {
          state.selected = action.payload;
        })
        .addCase(create.fulfilled, (state, action) => {
          state.items.unshift(action.payload);
          state.total += 1;
        })
        .addCase(update.fulfilled, (state, action) => {
          const idx = state.items.findIndex((i) => i._id === action.payload._id);
          if (idx !== -1) state.items[idx] = action.payload;
          if (state.selected?._id === action.payload._id) state.selected = action.payload;
        })
        .addCase(remove.fulfilled, (state, action) => {
          state.items = state.items.filter((i) => i._id !== action.payload);
          state.total -= 1;
        });
    },
  });

  return {
    slice,
    thunks: { fetchAll, fetchById, create, update, remove },
  };
};
