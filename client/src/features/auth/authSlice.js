import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../services/authApi.js";
import { setAccessToken, clearAccessToken } from "../../services/api.js";

// Thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(credentials);
      setAccessToken(data.data.accessToken);
      return data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      clearAccessToken();
    } catch (err) {
      clearAccessToken(); // Clear even if server call fails
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.me();
      return data.data;
    } catch {
      return rejectWithValue("Session expired");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    bootstrapped: false, // Has the app tried to restore session yet?
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.bootstrapped = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Restore session
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.bootstrapped = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.bootstrapped = true;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
