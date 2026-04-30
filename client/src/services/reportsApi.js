import api from "./api.js";

export const reportsApi = {
  getMonthly: () => api.get("/reports/monthly"),
};
