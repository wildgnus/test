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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="panel-strong">
        <h1 className="page-title text-[#1f272a]">{isEdit ? "Edit Project" : "Create Project"}</h1>
        <p className="mt-1 text-[#67624f]">
          Define budget, scope, and deadline clearly before execution starts.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[#d58d7f] bg-[#fff3ef] p-3 text-sm text-[#8d2e1f]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#4f4836]">
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
          <label className="mb-1 block text-sm font-semibold text-[#4f4836]">
            Description
          </label>
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="Brief description of the project..."
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4f4836]">
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
            <label className="mb-1 block text-sm font-semibold text-[#4f4836]">
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

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
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
