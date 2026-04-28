import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardApi } from "../../services/dashboardApi.js";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getStats();
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load stats",
      );
    }
  },
);

export const fetchTrends = createAsyncThunk(
  "dashboard/fetchTrends",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getTrends();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchActivity = createAsyncThunk(
  "dashboard/fetchActivity",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getActivity();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: null,
    trends: [],
    activity: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrends.fulfilled, (state, action) => {
        state.trends = action.payload;
      })
      .addCase(fetchActivity.fulfilled, (state, action) => {
        state.activity = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
