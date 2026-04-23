import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { projectsApi, tasksApi, usersApi } from "../services/api";
import type { Project, User } from "../types";

export function CreateTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultProjectId = searchParams.get("project") ?? "";

  const [form, setForm] = useState({
    project_id: defaultProjectId,
    title: "",
    description: "",
    user_id: "",
    status: "pending",
    priority: "medium",
    deadline: "",
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([projectsApi.getAll(), usersApi.getAll()]).then(([p, u]) => {
      setProjects(p.data as Project[]);
      setUsers(u.data as User[]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await tasksApi.create({
        project_id: form.project_id,
        title: form.title,
        description: form.description || undefined,
        user_id: form.user_id || undefined,
        status: form.status,
        priority: form.priority,
        deadline: form.deadline || undefined,
      });
      navigate("/tasks");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ?? "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Task</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project *
          </label>
          <select
            required
            className="input-field"
            value={form.project_id}
            onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.Project_ID} value={p.Project_ID}>
                {p.Name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            required
            className="input-field"
            placeholder="e.g. Install electrical wiring"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="input-field resize-none"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              className="input-field"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline
            </label>
            <input
              type="date"
              className="input-field"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign to
          </label>
          <select
            className="input-field"
            value={form.user_id}
            onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.User_ID} value={u.User_ID}>
                {u.Name} {u.Surname}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating…" : "Create Task"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
