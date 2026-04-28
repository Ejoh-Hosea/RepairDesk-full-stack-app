import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { repairsApi } from "../../services/repairsApi.js";

export const fetchRepairs = createAsyncThunk(
  "repairs/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await repairsApi.getAll(params);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load repairs",
      );
    }
  },
);

export const createRepair = createAsyncThunk(
  "repairs/create",
  async (repairData, { rejectWithValue }) => {
    try {
      const { data } = await repairsApi.create(repairData);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create repair",
      );
    }
  },
);

export const updateRepair = createAsyncThunk(
  "repairs/update",
  async ({ id, data: repairData }, { rejectWithValue }) => {
    try {
      const { data } = await repairsApi.update(id, repairData);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update repair",
      );
    }
  },
);

export const deleteRepair = createAsyncThunk(
  "repairs/delete",
  async (id, { rejectWithValue }) => {
    try {
      await repairsApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete repair",
      );
    }
  },
);

const repairsSlice = createSlice({
  name: "repairs",
  initialState: {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    // Local filter state — fast, no API call needed for filter-only changes
    filters: { status: "", search: "" },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepairs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepairs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.repairs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRepairs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRepair.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // Add to top of list
      })
      .addCase(updateRepair.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteRepair.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r._id !== action.payload);
      });
  },
});

export const { setFilters, clearError } = repairsSlice.actions;

// Selector: apply filters on client side for instant feedback
export const selectFilteredRepairs = (state) => {
  const { items, filters } = state.repairs;
  return items.filter((r) => {
    const matchStatus = !filters.status || r.status === filters.status;
    const search = filters.search.toLowerCase();
    const matchSearch =
      !search ||
      r.phoneModel.toLowerCase().includes(search) ||
      r.issue.toLowerCase().includes(search) ||
      r.customerName.toLowerCase().includes(search);
    return matchStatus && matchSearch;
  });
};

export default repairsSlice.reducer;
