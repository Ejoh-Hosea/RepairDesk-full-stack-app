import axios from "axios";

// In dev, Vite proxies /api → localhost:5000. In prod, same origin.
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Send cookies with every request
  headers: { "Content-Type": "application/json" },
});

// Attach access token from memory to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// In-memory token storage (more secure than localStorage)
let _accessToken = null;
export const setAccessToken = (token) => {
  _accessToken = token;
};
export const getAccessToken = () => _accessToken;
export const clearAccessToken = () => {
  _accessToken = null;
};

// Auto-refresh on 401 — transparent to the caller
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token),
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // Queue requests while refresh is in flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
