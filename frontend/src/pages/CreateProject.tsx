import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { projectsApi } from "../services/api";
import type { Project } from "../types";

export function CreateProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    budget: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    projectsApi.getById(id!).then((res) => {
      const p = res.data as Project;
      setForm({
        name: p.Name,
        description: p.Description ?? "",
        budget: String(p.Budget),
        deadline: p.Deadline,
      });
    });
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      budget: parseFloat(form.budget),
      deadline: form.deadline,
    };
    try {
      if (isEdit) {
        await projectsApi.update(id!, payload);
      } else {
        await projectsApi.create(payload);
      }
      navigate("/projects");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ?? "Failed to save project"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? "Edit Project" : "New Project"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name *
          </label>
          <input
            required
            className="input-field"
            placeholder="e.g. Office Renovation"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="Brief description of the project…"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (USD) *
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              placeholder="50000"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline *
            </label>
            <input
              required
              type="date"
              className="input-field"
              value={form.deadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, deadline: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving…" : isEdit ? "Update Project" : "Create Project"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
