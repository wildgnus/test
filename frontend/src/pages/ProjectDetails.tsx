import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { costsApi, projectsApi, tasksApi, usersApi } from "../services/api";
import type { Cost, Project, Task, User } from "../types";
import {
  categoryBadgeClass,
  formatCurrency,
  formatDate,
  priorityBadgeClass,
  statusBadgeClass,
} from "../utils/helpers";

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { isManager } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignId, setAssignId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      projectsApi.getById(id),
      tasksApi.getAll({ project_id: id }),
      costsApi.getByProject(id),
      projectsApi.getUsers(id),
      isManager ? usersApi.getAll() : Promise.resolve({ data: [] }),
    ]).then(([p, t, c, m, u]) => {
      setProject(p.data as Project);
      setTasks(t.data as Task[]);
      setCosts(c.data as Cost[]);
      setMembers(m.data as User[]);
      setAllUsers(u.data as User[]);
    }).finally(() => setLoading(false));
  }, [id, isManager]);

  const totalSpent = costs.reduce((s, c) => s + Number(c.Amount), 0);
  const budgetPct = project ? (totalSpent / Number(project.Budget)) * 100 : 0;

  const handleAssign = async () => {
    if (!id || !assignId) return;
    setAssigning(true);
    try {
      await projectsApi.assignUser(id, assignId);
      const res = await projectsApi.getUsers(id);
      setMembers(res.data as User[]);
      setAssignId("");
    } catch (err: unknown) {
      alert((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "Failed to assign user");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>;
  if (!project) return <div className="text-red-600 p-4">Project not found.</div>;

  const unassignedUsers = allUsers.filter(
    (u) => !members.find((m) => m.User_ID === u.User_ID)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.Name}</h1>
          {project.Description && (
            <p className="text-gray-500 mt-1">{project.Description}</p>
          )}
        </div>
        {isManager && (
          <Link to={`/projects/${id}/edit`} className="btn-secondary">
            Edit Project
          </Link>
        )}
      </div>

      {/* Budget summary */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800">Budget</h2>
          <Link to="/budget" className="text-sm text-primary-600 hover:underline">
            Full overview →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Budget</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(Number(project.Budget))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Spent</p>
            <p className="text-lg font-bold text-orange-600">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Remaining</p>
            <p className={`text-lg font-bold ${Number(project.Budget) - totalSpent < 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(Number(project.Budget) - totalSpent)}
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              budgetPct >= 100 ? "bg-red-500" : budgetPct >= 80 ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        {budgetPct >= 100 && (
          <p className="text-sm text-red-600 font-medium mt-2">
            ⚠️ Budget exceeded by {formatCurrency(totalSpent - Number(project.Budget))}
          </p>
        )}
      </div>

      {/* Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Tasks ({tasks.length})</h2>
          {isManager && (
            <Link to={`/tasks/create?project=${id}`} className="btn-primary text-sm">
              + Add Task
            </Link>
          )}
        </div>
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-sm">No tasks for this project.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tasks.map((t) => (
              <li key={t.Task_ID} className="py-3">
                <Link
                  to={`/tasks/${t.Task_ID}`}
                  className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 -mx-2 py-1 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`badge ${priorityBadgeClass(t.Priority)}`}>
                      {t.Priority}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{t.Title}</span>
                  </div>
                  <span className={`badge ${statusBadgeClass(t.Status)}`}>
                    {t.Status.replace("_", " ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Costs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Costs ({costs.length})</h2>
          <Link to="/receipts/upload" className="btn-secondary text-sm">
            Upload Receipt
          </Link>
        </div>
        {costs.length === 0 ? (
          <p className="text-gray-400 text-sm">No costs recorded.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {costs.map((c) => (
              <li key={c.Cost_ID} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {c.Vendor_name ?? "Unknown vendor"}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(c.Cost_date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${categoryBadgeClass(c.Category)}`}>
                    {c.Category}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(Number(c.Amount))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Team */}
      {isManager && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Team Members</h2>
          {members.length > 0 && (
            <ul className="mb-4 space-y-2">
              {members.map((m) => (
                <li key={m.User_ID} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                    {m.Name[0]}{m.Surname[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.Name} {m.Surname}</p>
                    <p className="text-xs text-gray-400">{m.Email}</p>
                  </div>
                  <span className="badge bg-gray-100 text-gray-600 ml-auto">{m.Role}</span>
                </li>
              ))}
            </ul>
          )}
          {unassignedUsers.length > 0 && (
            <div className="flex gap-2">
              <select
                className="input-field flex-1"
                value={assignId}
                onChange={(e) => setAssignId(e.target.value)}
              >
                <option value="">Select user to assign…</option>
                {unassignedUsers.map((u) => (
                  <option key={u.User_ID} value={u.User_ID}>
                    {u.Name} {u.Surname} ({u.Role})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!assignId || assigning}
                className="btn-primary"
              >
                {assigning ? "Assigning…" : "Assign"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
