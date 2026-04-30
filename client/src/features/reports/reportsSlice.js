import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reportsApi } from "../../services/reportsApi.js";

export const fetchMonthlyReport = createAsyncThunk(
  "reports/fetchMonthly",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await reportsApi.getMonthly();
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load report",
      );
    }
  },
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    monthly: null, // { monthly[], thisMonth{}, allTime{} }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.monthly = action.payload;
      })
      .addCase(fetchMonthlyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reportsSlice.reducer;
