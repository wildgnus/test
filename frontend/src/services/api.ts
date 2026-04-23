import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: {
    email: string;
    password: string;
    name: string;
    surname: string;
    role: string;
  }) => api.post("/auth/register", data),
};

export const usersApi = {
  getMe: () => api.get("/users/me"),
  getAll: () => api.get("/users"),
};

export const projectsApi = {
  getAll: () => api.get("/projects"),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: {
    name: string;
    description?: string;
    budget: number;
    deadline: string;
  }) => api.post("/projects", data),
  update: (
    id: string,
    data: Partial<{ name: string; description: string; budget: number; deadline: string }>
  ) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  assignUser: (projectId: string, userId: string) =>
    api.post(`/projects/${projectId}/assign`, { user_id: userId }),
  getUsers: (projectId: string) => api.get(`/projects/${projectId}/users`),
};

export const tasksApi = {
  getAll: (params?: { project_id?: string; status?: string; priority?: string }) =>
    api.get("/tasks", { params }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: {
    project_id: string;
    title: string;
    description?: string;
    user_id?: string;
    status?: string;
    priority?: string;
    deadline?: string;
  }) => api.post("/tasks", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/tasks/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }),
  uploadPhoto: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/tasks/${id}/photo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const costsApi = {
  getAll: () => api.get("/costs"),
  getByProject: (projectId: string) => api.get(`/costs/project/${projectId}`),
};

export const receiptsApi = {
  upload: (file: File, projectId: string, category: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("project_id", projectId);
    form.append("category", category);
    return api.post("/receipts/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default api;
