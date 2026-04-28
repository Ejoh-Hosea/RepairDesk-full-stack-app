import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersApi } from "../../services/usersApi.js";

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await usersApi.getAll();
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load users",
      );
    }
  },
);

export const createUser = createAsyncThunk(
  "users/create",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await usersApi.create(userData);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create user",
      );
    }
  },
);

export const updateUserRole = createAsyncThunk(
  "users/updateRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const { data } = await usersApi.updateRole(id, role);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update role",
      );
    }
  },
);

export const resetUserPassword = createAsyncThunk(
  "users/resetPassword",
  async ({ id, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await usersApi.resetPassword(id, newPassword);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reset password",
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await usersApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete user",
      );
    }
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    loading: false,
    error: null,
    actionError: null, // Separate error for modal actions vs page load
  },
  reducers: {
    clearActionError: (state) => {
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.actionError = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.actionError = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u._id === action.payload.id);
        if (idx !== -1) state.items[idx].role = action.payload.role;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.actionError = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionError = action.payload;
      });
  },
});

export const { clearActionError } = usersSlice.actions;
export default usersSlice.reducer;
