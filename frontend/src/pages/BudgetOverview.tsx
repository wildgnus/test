import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { costsApi, projectsApi } from "../services/api";
import type { Cost, Project } from "../types";
import {
  categoryBadgeClass,
  formatCurrency,
  formatDate,
} from "../utils/helpers";

interface ProjectBudget {
  project: Project;
  costs: Cost[];
  spent: number;
  remaining: number;
  pct: number;
}

export function BudgetOverview() {
  const [data, setData] = useState<ProjectBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([projectsApi.getAll(), costsApi.getAll()]).then(([pRes, cRes]) => {
      const projects = pRes.data as Project[];
      const allCosts = cRes.data as Cost[];

      const rows = projects.map((p) => {
        const costs = allCosts.filter((c) => c.Project_ID === p.Project_ID);
        const spent = costs.reduce((s, c) => s + Number(c.Amount), 0);
        const budget = Number(p.Budget);
        return {
          project: p,
          costs,
          spent,
          remaining: budget - spent,
          pct: budget > 0 ? (spent / budget) * 100 : 0,
        };
      });
      setData(rows);
    }).finally(() => setLoading(false));
  }, []);

  const totalBudget = data.reduce((s, d) => s + Number(d.project.Budget), 0);
  const totalSpent = data.reduce((s, d) => s + d.spent, 0);

  const selectedData = selectedProject
    ? data.find((d) => d.project.Project_ID === selectedProject)
    : null;

  const categorySummary = selectedData
    ? Object.entries(
        selectedData.costs.reduce<Record<string, number>>((acc, c) => {
          acc[c.Category] = (acc[c.Category] ?? 0) + Number(c.Amount);
          return acc;
        }, {})
      )
    : [];

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Budget Overview</h1>

      {/* Global summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalBudget)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${totalBudget - totalSpent < 0 ? "text-red-600" : "text-green-600"}`}>
            {formatCurrency(totalBudget - totalSpent)}
          </p>
        </div>
      </div>

      {/* Per-project breakdown */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Projects</h2>
        {data.length === 0 ? (
          <p className="text-gray-400 text-sm">No projects yet.</p>
        ) : (
          <div className="space-y-5">
            {data.map((d) => (
              <div
                key={d.project.Project_ID}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedProject === d.project.Project_ID
                    ? "border-primary-300 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  setSelectedProject(
                    selectedProject === d.project.Project_ID ? null : d.project.Project_ID
                  )
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/projects/${d.project.Project_ID}`}
                    className="font-medium text-gray-900 hover:text-primary-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {d.project.Name}
                  </Link>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      {formatCurrency(d.spent)} / {formatCurrency(Number(d.project.Budget))}
                    </span>
                    {d.pct >= 100 && (
                      <span className="text-red-600 font-semibold text-xs">OVER BUDGET</span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      d.pct >= 100
                        ? "bg-red-500"
                        : d.pct >= 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(d.pct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {d.pct.toFixed(1)}% used · Deadline: {formatDate(d.project.Deadline)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected project costs */}
      {selectedData && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">
            {selectedData.project.Name} — Cost Details
          </h2>

          {categorySummary.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {categorySummary.map(([cat, total]) => (
                <div key={cat} className="bg-gray-50 rounded-lg px-3 py-2">
                  <span className={`badge ${categoryBadgeClass(cat)}`}>{cat}</span>
                  <p className="text-sm font-semibold mt-1">{formatCurrency(total)}</p>
                </div>
              ))}
            </div>
          )}

          {selectedData.costs.length === 0 ? (
            <p className="text-gray-400 text-sm">No costs recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Vendor</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedData.costs.map((c) => (
                  <tr key={c.Cost_ID}>
                    <td className="px-3 py-2 text-gray-800">
                      {c.Vendor_name ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`badge ${categoryBadgeClass(c.Category)}`}>
                        {c.Category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{formatDate(c.Cost_date)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900">
                      {formatCurrency(Number(c.Amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
