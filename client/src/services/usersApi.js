import api from "./api.js";

export const usersApi = {
  getAll: () => api.get("/users"),
  create: (data) => api.post("/users", data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  resetPassword: (id, newPassword) =>
    api.patch(`/users/${id}/password`, { newPassword }),
  delete: (id) => api.delete(`/users/${id}`),
};
