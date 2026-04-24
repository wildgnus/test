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

  if (loading) return <div className="flex h-64 items-center justify-center subtle-text">Loading...</div>;
  if (error) return <div className="rounded-xl border border-[#d58d7f] bg-[#fff3ef] p-4 text-[#8d2e1f]">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="panel-strong">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="page-title text-[#1f272a]">Tasks</h1>
            <p className="mt-1 text-[#67624f]">Filter by status and priority to focus your work quickly.</p>
          </div>
          {isManager && (
            <Link to="/tasks/create" className="btn-primary">
              Create Task
            </Link>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <select
            className="input-field w-auto min-w-[170px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="input-field w-auto min-w-[170px]"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="panel py-12 text-center text-[#726b56]">No tasks found.</div>
      ) : (
        <div className="panel overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-[#ede4cd] border-b border-[#d4c8ab]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#5b533f]">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5b533f]">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5b533f]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5b533f]">Deadline</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2d9c0]">
              {tasks.map((t) => (
                <tr key={t.Task_ID} className="bg-white/50 transition-colors hover:bg-white/80">
                  <td className="px-4 py-3 font-semibold text-[#2f2c22]">{t.Title}</td>
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
                  <td className="px-4 py-3 text-[#5f5846]">
                    {t.Deadline ? formatDate(t.Deadline) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/tasks/${t.Task_ID}`}
                      className="font-semibold text-[#1d5c63] hover:text-[#124147]"
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
