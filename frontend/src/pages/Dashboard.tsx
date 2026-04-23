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

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.Name} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening on your projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: projects.length, icon: "📁", color: "text-blue-600" },
          { label: "Total Budget", value: formatCurrency(totalBudget), icon: "💵", color: "text-green-600" },
          { label: "Total Spent", value: formatCurrency(totalSpent), icon: "💳", color: "text-orange-600" },
          { label: "Active Tasks", value: inProgressTasks, icon: "⚡", color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Budget bar */}
      {totalBudget > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-800">Overall Budget</h2>
            <span className="text-sm text-gray-500">
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                totalSpent / totalBudget >= 1
                  ? "bg-red-500"
                  : totalSpent / totalBudget >= 0.8
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {((totalSpent / totalBudget) * 100).toFixed(1)}% used
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-gray-400 text-sm">No projects yet.</p>
          ) : (
            <ul className="space-y-3">
              {projects.slice(0, 4).map((p) => (
                <li key={p.Project_ID}>
                  <Link
                    to={`/projects/${p.Project_ID}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{p.Name}</p>
                      <p className="text-xs text-gray-400">
                        Deadline: {formatDate(p.Deadline)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(Number(p.Budget))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {isManager && (
            <Link to="/projects/create" className="btn-primary mt-4 inline-block text-sm">
              + New Project
            </Link>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">My Tasks</h2>
            <Link to="/tasks" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-sm">No tasks assigned.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.slice(0, 5).map((t) => (
                <li key={t.Task_ID}>
                  <Link
                    to={`/tasks/${t.Task_ID}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800 truncate">{t.Title}</p>
                    <span className={`badge ml-2 flex-shrink-0 ${statusBadgeClass(t.Status)}`}>
                      {t.Status.replace("_", " ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
