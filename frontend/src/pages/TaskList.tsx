import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTasks } from "../hooks/useTasks";
import { formatDate, priorityBadgeClass, statusBadgeClass } from "../utils/helpers";

export function TaskList() {
  const { isManager } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const { tasks, loading, error } = useTasks({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        {isManager && (
          <Link to="/tasks/create" className="btn-primary">
            + New Task
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="input-field w-auto"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No tasks found.</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Deadline</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((t) => (
                <tr key={t.Task_ID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{t.Title}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${priorityBadgeClass(t.Priority)}`}>
                      {t.Priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusBadgeClass(t.Status)}`}>
                      {t.Status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {t.Deadline ? formatDate(t.Deadline) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/tasks/${t.Task_ID}`}
                      className="text-primary-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
