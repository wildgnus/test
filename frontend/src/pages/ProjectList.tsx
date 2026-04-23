import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { projectsApi } from "../services/api";
import type { Project } from "../types";
import { formatCurrency, formatDate } from "../utils/helpers";
import { useProjects } from "../hooks/useProjects";

export function ProjectList() {
  const { isManager } = useAuth();
  const { projects, loading, error, refetch } = useProjects();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = projects.filter((p) =>
    p.Name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await projectsApi.delete(id);
      await refetch();
    } catch {
      alert("Failed to delete project.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        {isManager && (
          <Link to="/projects/create" className="btn-primary">
            + New Project
          </Link>
        )}
      </div>

      <input
        type="text"
        placeholder="Search projects…"
        className="input-field max-w-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          {search ? "No projects match your search." : "No projects yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ProjectCard
              key={p.Project_ID}
              project={p}
              isManager={isManager}
              deleting={deleting === p.Project_ID}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  isManager,
  deleting,
  onDelete,
}: {
  project: Project;
  isManager: boolean;
  deleting: boolean;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{project.Name}</h3>
        {isManager && (
          <div className="flex gap-2">
            <Link
              to={`/projects/${project.Project_ID}/edit`}
              className="text-xs text-primary-600 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(project.Project_ID, project.Name)}
              disabled={deleting}
              className="text-xs text-red-500 hover:underline disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {project.Description && (
        <p className="text-sm text-gray-500 line-clamp-2">{project.Description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Budget</p>
          <p className="font-semibold text-green-700">{formatCurrency(Number(project.Budget))}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Deadline</p>
          <p className="font-semibold text-blue-700">{formatDate(project.Deadline)}</p>
        </div>
      </div>

      <Link
        to={`/projects/${project.Project_ID}`}
        className="btn-secondary text-center text-sm"
      >
        View Details →
      </Link>
    </div>
  );
}
