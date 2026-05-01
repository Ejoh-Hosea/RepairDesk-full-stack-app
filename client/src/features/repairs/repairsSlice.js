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
    filters: { status: "", search: "", datePreset: "all" },
    currentPage: 1,
    pageSize: 10,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = { status: "", search: "", datePreset: "all" };
      state.currentPage = 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
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
        state.items.unshift(action.payload);
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

export const { setFilters, clearFilters, setPage, clearError } =
  repairsSlice.actions;

const getDateRange = (preset) => {
  const now = new Date();
  const startOf = (d) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };

  switch (preset) {
    case "today":
      return { from: startOf(new Date()), to: null };
    case "yesterday": {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const start = startOf(d);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    }
    case "week": {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return { from: startOf(d), to: null };
    }
    case "month": {
      return {
        from: startOf(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: null,
      };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    }
    default:
      return { from: null, to: null };
  }
};

export const selectFilteredRepairs = (state) => {
  const { items, filters } = state.repairs;
  const { from, to } = getDateRange(filters.datePreset);

  return items.filter((r) => {
    const matchStatus = !filters.status || r.status === filters.status;
    const search = filters.search.toLowerCase();
    const matchSearch =
      !search ||
      r.phoneModel.toLowerCase().includes(search) ||
      r.issue.toLowerCase().includes(search) ||
      r.customerName.toLowerCase().includes(search);
    const created = new Date(r.createdAt);
    const matchDate = (!from || created >= from) && (!to || created <= to);
    return matchStatus && matchSearch && matchDate;
  });
};

export const selectPaginatedRepairs = (state) => {
  const filtered = selectFilteredRepairs(state);
  const { currentPage, pageSize } = state.repairs;
  const start = (currentPage - 1) * pageSize;
  return {
    repairs: filtered.slice(start, start + pageSize),
    totalCount: filtered.length,
    currentPage,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
};

export default repairsSlice.reducer;
