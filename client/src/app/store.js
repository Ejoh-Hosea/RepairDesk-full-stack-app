import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import repairsReducer from "../features/repairs/repairsSlice.js";
import dashboardReducer from "../features/dashboard/dashboardSlice.js";
import usersReducer from "../features/users/usersSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    repairs: repairsReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
  },
});
