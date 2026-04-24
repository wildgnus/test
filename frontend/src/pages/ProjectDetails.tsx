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

  if (loading) return <div className="flex h-64 items-center justify-center subtle-text">Loading...</div>;
  if (!project) return <div className="rounded-xl border border-[#d58d7f] bg-[#fff3ef] p-4 text-[#8d2e1f]">Project not found.</div>;

  const unassignedUsers = allUsers.filter(
    (u) => !members.find((m) => m.User_ID === u.User_ID)
  );

  return (
    <div className="space-y-6">
      <div className="panel-strong flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title text-[#1f272a]">{project.Name}</h1>
          {project.Description && (
            <p className="mt-1 text-[#67624f]">{project.Description}</p>
          )}
        </div>
        {isManager && (
          <Link to={`/projects/${id}/edit`} className="btn-secondary">
            Edit Project
          </Link>
        )}
      </div>

      <div className="panel">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#2b2a22]">Budget</h2>
          <Link to="/budget" className="text-sm font-semibold text-[#1d5c63] hover:text-[#124147]">
            Full overview
          </Link>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Budget</p>
            <p className="text-lg font-bold text-[#2a2a23]">
              {formatCurrency(Number(project.Budget))}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Spent</p>
            <p className="text-lg font-bold text-[#b0671f]">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Remaining</p>
            <p className={`text-lg font-bold ${Number(project.Budget) - totalSpent < 0 ? "text-[#b3473f]" : "text-[#2f7d50]"}`}>
              {formatCurrency(Number(project.Budget) - totalSpent)}
            </p>
          </div>
        </div>
        <div className="h-2.5 w-full rounded-full bg-[#ddd4bb]">
          <div
            className={`h-2.5 rounded-full ${
              budgetPct >= 100 ? "bg-[#b3473f]" : budgetPct >= 80 ? "bg-[#b0671f]" : "bg-[#2f7d50]"
            }`}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        {budgetPct >= 100 && (
          <p className="mt-2 text-sm font-semibold text-[#b3473f]">
            Budget exceeded by {formatCurrency(totalSpent - Number(project.Budget))}
          </p>
        )}
      </div>

      <div className="panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#2b2a22]">Tasks ({tasks.length})</h2>
          {isManager && (
            <Link to={`/tasks/create?project=${id}`} className="btn-primary text-sm">
              Add Task
            </Link>
          )}
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-[#726b56]">No tasks for this project.</p>
        ) : (
          <ul className="divide-y divide-[#e2d9c0]">
            {tasks.map((t) => (
              <li key={t.Task_ID} className="py-3">
                <Link
                  to={`/tasks/${t.Task_ID}`}
                  className="-mx-2 flex items-center justify-between rounded-xl px-2 py-2 transition-colors hover:bg-white/75"
                >
                  <div className="flex items-center gap-3">
                    <span className={`badge ${priorityBadgeClass(t.Priority)}`}>
                      {t.Priority}
                    </span>
                    <span className="text-sm font-semibold text-[#2a2a23]">{t.Title}</span>
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

      <div className="panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#2b2a22]">Costs ({costs.length})</h2>
          <Link to="/receipts/upload" className="btn-secondary text-sm">
            Upload Receipt
          </Link>
        </div>
        {costs.length === 0 ? (
          <p className="text-sm text-[#726b56]">No costs recorded.</p>
        ) : (
          <ul className="divide-y divide-[#e2d9c0]">
            {costs.map((c) => (
              <li key={c.Cost_ID} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2a2a23]">
                    {c.Vendor_name ?? "Unknown vendor"}
                  </p>
                  <p className="text-xs text-[#786f59]">{formatDate(c.Cost_date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${categoryBadgeClass(c.Category)}`}>
                    {c.Category}
                  </span>
                  <span className="font-bold text-[#2a2a23]">
                    {formatCurrency(Number(c.Amount))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isManager && (
        <div className="panel">
          <h2 className="mb-4 text-lg font-semibold text-[#2b2a22]">Team Members</h2>
          {members.length > 0 && (
            <ul className="mb-4 space-y-2">
              {members.map((m) => (
                <li key={m.User_ID} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7ecef] text-sm font-semibold text-[#1d5c63]">
                    {m.Name[0]}{m.Surname[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2a2a23]">{m.Name} {m.Surname}</p>
                    <p className="text-xs text-[#786f59]">{m.Email}</p>
                  </div>
                  <span className="badge ml-auto bg-[#ece8dc] text-[#5e5746]">{m.Role}</span>
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
                <option value="">Select user to assign...</option>
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
                {assigning ? "Assigning..." : "Assign"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
