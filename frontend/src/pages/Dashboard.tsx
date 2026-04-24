import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { costsApi, projectsApi, tasksApi } from "../services/api";
import type { Cost, Project, Task } from "../types";
import { formatCurrency, formatDate, statusBadgeClass } from "../utils/helpers";

export function Dashboard() {
  const { user, isManager } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectsApi.getAll(),
      tasksApi.getAll(),
      costsApi.getAll(),
    ]).then(([p, t, c]) => {
      setProjects(p.data as Project[]);
      setTasks(t.data as Task[]);
      setCosts(c.data as Cost[]);
    }).finally(() => setLoading(false));
  }, []);

  const totalBudget = projects.reduce((s, p) => s + Number(p.Budget), 0);
  const totalSpent = costs.reduce((s, c) => s + Number(c.Amount), 0);
  const pendingTasks = tasks.filter((t) => t.Status === "pending").length;
  const inProgressTasks = tasks.filter((t) => t.Status === "in_progress").length;
  const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return <div className="flex h-64 items-center justify-center subtle-text">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="panel-strong stagger-in">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#69624d]">Daily Briefing</p>
        <h1 className="mt-2 text-3xl font-bold text-[#1f272a] md:text-4xl">
          Welcome back, {user?.Name}.
        </h1>
        <p className="mt-2 max-w-2xl text-[#5f5a49]">
          Today you have {pendingTasks} pending tasks and {inProgressTasks} tasks currently in progress.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Projects", value: projects.length, note: "Open scopes" },
          { label: "Budget", value: formatCurrency(totalBudget), note: "Planned total" },
          { label: "Spent", value: formatCurrency(totalSpent), note: "Recorded costs" },
          { label: "In Progress", value: inProgressTasks, note: "Active tasks" },
        ].map((stat, index) => (
          <article
            key={stat.label}
            className="panel stagger-in"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <p className="text-xs uppercase tracking-[0.09em] text-[#6c6652]">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#1f272a]">{stat.value}</p>
            <p className="mt-1 text-xs text-[#7b7562]">{stat.note}</p>
          </article>
        ))}
      </div>

      {totalBudget > 0 && (
        <section className="panel">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#2b2a22]">Budget Utilization</h2>
            <span className="text-sm text-[#665f4b]">
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-[#ddd4bb]">
            <div
              className={`h-3 rounded-full transition-all ${
                utilization >= 100
                  ? "bg-[#b3473f]"
                  : utilization >= 80
                  ? "bg-[#b0671f]"
                  : "bg-[#2f7d50]"
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[#746d59]">
            {utilization.toFixed(1)}% of planned budget used.
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="panel stagger-in" style={{ animationDelay: "120ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2b2a22]">Recent Projects</h2>
            <Link to="/projects" className="text-sm font-semibold text-[#1d5c63] hover:text-[#124147]">
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-[#7b7562]">No projects yet.</p>
          ) : (
            <ul className="space-y-3">
              {projects.slice(0, 4).map((p) => (
                <li key={p.Project_ID}>
                  <Link
                    to={`/projects/${p.Project_ID}`}
                    className="flex items-center justify-between rounded-xl border border-[#d9cfb6] bg-white/65 p-3 transition-colors hover:bg-white"
                  >
                    <div>
                      <p className="font-semibold text-[#2a2a23]">{p.Name}</p>
                      <p className="text-xs text-[#7a7461]">
                        Deadline: {formatDate(p.Deadline)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#2f7d50]">
                      {formatCurrency(Number(p.Budget))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {isManager && (
            <Link to="/projects/create" className="btn-primary mt-4 inline-block text-sm">
              Create Project
            </Link>
          )}
        </section>

        <section className="panel stagger-in" style={{ animationDelay: "180ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2b2a22]">My Tasks</h2>
            <Link to="/tasks" className="text-sm font-semibold text-[#1d5c63] hover:text-[#124147]">
              View all
            </Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-[#7b7562]">No tasks assigned.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.slice(0, 5).map((t) => (
                <li key={t.Task_ID}>
                  <Link
                    to={`/tasks/${t.Task_ID}`}
                    className="flex items-center justify-between rounded-xl border border-[#d9cfb6] bg-white/65 p-3 transition-colors hover:bg-white"
                  >
                    <p className="truncate text-sm font-semibold text-[#2a2a23]">{t.Title}</p>
                    <span className={`badge ml-2 flex-shrink-0 ${statusBadgeClass(t.Status)}`}>
                      {t.Status.replace("_", " ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
