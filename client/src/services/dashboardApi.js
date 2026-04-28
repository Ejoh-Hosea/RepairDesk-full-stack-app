import api from "./api.js";

export const dashboardApi = {
  getStats: () => api.get("/dashboard"),
  getTrends: () => api.get("/dashboard/trends"),
  getActivity: (limit = 20) =>
    api.get("/dashboard/activity", { params: { limit } }),
};
