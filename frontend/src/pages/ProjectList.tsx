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

  if (loading) return <div className="flex h-64 items-center justify-center subtle-text">Loading...</div>;
  if (error) return <div className="rounded-xl border border-[#d58d7f] bg-[#fff3ef] p-4 text-[#8d2e1f]">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="panel-strong">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="page-title text-[#1f272a]">Projects</h1>
            <p className="mt-1 text-[#67624f]">Track deadlines, budgets, and team allocation per project.</p>
          </div>
          {isManager && (
            <Link to="/projects/create" className="btn-primary">
              Create Project
            </Link>
          )}
        </div>

        <input
          type="text"
          placeholder="Search project name"
          className="input-field mt-4 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="panel py-14 text-center text-[#726b56]">
          {search ? "No projects match your search." : "No projects yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p, index) => (
            <ProjectCard
              key={p.Project_ID}
              project={p}
              isManager={isManager}
              deleting={deleting === p.Project_ID}
              onDelete={handleDelete}
              style={{ animationDelay: `${index * 65}ms` }}
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
  style,
}: {
  project: Project;
  isManager: boolean;
  deleting: boolean;
  onDelete: (id: string, name: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div className="panel stagger-in flex flex-col gap-3" style={style}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#25251f]">{project.Name}</h3>
        {isManager && (
          <div className="flex gap-2">
            <Link
              to={`/projects/${project.Project_ID}/edit`}
              className="text-xs font-semibold text-[#1d5c63] hover:text-[#124147]"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(project.Project_ID, project.Name)}
              disabled={deleting}
              className="text-xs font-semibold text-[#a43e34] hover:text-[#873128] disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {project.Description && (
        <p className="line-clamp-2 text-sm text-[#66604d]">{project.Description}</p>
      )}

      <div className="mt-auto grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#d6ccb1] bg-[#f0ead9] p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Budget</p>
          <p className="font-bold text-[#2f7d50]">{formatCurrency(Number(project.Budget))}</p>
        </div>
        <div className="rounded-xl border border-[#d6ccb1] bg-[#f0ead9] p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Deadline</p>
          <p className="font-bold text-[#1d5c63]">{formatDate(project.Deadline)}</p>
        </div>
      </div>

      <Link
        to={`/projects/${project.Project_ID}`}
        className="btn-secondary mt-1 text-center text-sm"
      >
        View Details
      </Link>
    </div>
  );
}
