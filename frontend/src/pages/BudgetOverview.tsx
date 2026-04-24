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
  const [expandedCost, setExpandedCost] = useState<string | null>(null);

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

  if (loading) return <div className="flex h-64 items-center justify-center subtle-text">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="panel-strong">
        <h1 className="page-title text-[#1f272a]">Budget Overview</h1>
        <p className="mt-1 text-[#67624f]">See spending pressure across all projects before issues escalate.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="panel">
          <p className="text-sm text-[#6f6753]">Total Budget</p>
          <p className="mt-1 text-2xl font-bold text-[#2a2a23]">
            {formatCurrency(totalBudget)}
          </p>
        </div>
        <div className="panel">
          <p className="text-sm text-[#6f6753]">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-[#b0671f]">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="panel">
          <p className="text-sm text-[#6f6753]">Remaining</p>
          <p className={`mt-1 text-2xl font-bold ${totalBudget - totalSpent < 0 ? "text-[#b3473f]" : "text-[#2f7d50]"}`}>
            {formatCurrency(totalBudget - totalSpent)}
          </p>
        </div>
      </div>

      <div className="panel">
        <h2 className="mb-4 text-lg font-semibold text-[#2b2a22]">Projects</h2>
        {data.length === 0 ? (
          <p className="text-sm text-[#726b56]">No projects yet.</p>
        ) : (
          <div className="space-y-5">
            {data.map((d) => (
              <div
                key={d.project.Project_ID}
                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                  selectedProject === d.project.Project_ID
                    ? "border-[#3a8088] bg-[#e6f1f2]"
                    : "border-[#d8cdb1] bg-white/60 hover:border-[#baa97f]"
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
                    className="font-semibold text-[#2a2a23] hover:text-[#1d5c63]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {d.project.Name}
                  </Link>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#665f4b]">
                      {formatCurrency(d.spent)} / {formatCurrency(Number(d.project.Budget))}
                    </span>
                    {d.pct >= 100 && (
                      <span className="text-xs font-semibold text-[#b3473f]">OVER BUDGET</span>
                    )}
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-[#ddd4bb]">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      d.pct >= 100
                        ? "bg-[#b3473f]"
                        : d.pct >= 80
                        ? "bg-[#b0671f]"
                        : "bg-[#2f7d50]"
                    }`}
                    style={{ width: `${Math.min(d.pct, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#786f59]">
                  {d.pct.toFixed(1)}% used · Deadline: {formatDate(d.project.Deadline)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedData && (
        <div className="panel">
          <h2 className="mb-4 text-lg font-semibold text-[#2b2a22]">
            {selectedData.project.Name} — Cost Details
          </h2>

          {categorySummary.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {categorySummary.map(([cat, total]) => (
                <div key={cat} className="rounded-lg border border-[#d8cdb1] bg-white/70 px-3 py-2">
                  <span className={`badge ${categoryBadgeClass(cat)}`}>{cat}</span>
                  <p className="mt-1 text-sm font-semibold text-[#2a2a23]">{formatCurrency(total)}</p>
                </div>
              ))}
            </div>
          )}

          {selectedData.costs.length === 0 ? (
            <p className="text-sm text-[#726b56]">No costs recorded.</p>
          ) : (
            <div className="space-y-2">
              {selectedData.costs.map((c) => (
                <React.Fragment key={c.Cost_ID}>
                  <div
                    onClick={() => setExpandedCost(expandedCost === c.Cost_ID ? null : c.Cost_ID)}
                    className="flex items-center justify-between rounded-lg border border-[#d8cdb1] bg-white/50 px-4 py-3 cursor-pointer hover:bg-white/80 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <span className={`text-sm transition-transform ${expandedCost === c.Cost_ID ? "rotate-90" : ""}`}>
                          ▶
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-[#2a2a23]">{c.Vendor_name ?? "No Vendor"}</p>
                          <span className={`badge ${categoryBadgeClass(c.Category)}`}>
                            {c.Category}
                          </span>
                        </div>
                        <p className="text-xs text-[#665f4b] mt-1">{formatDate(c.Cost_date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#2a2a23]">
                        {formatCurrency(Number(c.Amount))}
                      </p>
                    </div>
                  </div>

                  {expandedCost === c.Cost_ID && (
                    <div className="ml-8 mb-3 rounded-lg border border-[#e2d9c0] bg-[#f9f7f2] p-4">
                      <h4 className="font-semibold text-[#2a2a23] mb-3">Items</h4>
                      {!c.Items || c.Items.length === 0 ? (
                        <p className="text-sm text-[#726b56]">No items recorded for this cost.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="border-b border-[#d4c8ab] bg-[#ede4cd]">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-[#5b533f]">
                                  Item Name
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#5b533f]">
                                  Quantity
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#5b533f]">
                                  Price
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#5b533f]">
                                  Subtotal
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2d9c0]">
                              {c.Items.map((item, idx) => (
                                <tr key={idx} className="bg-white/60">
                                  <td className="px-3 py-2 text-[#2a2a23]">
                                    {item.Name ?? "-"}
                                  </td>
                                  <td className="px-3 py-2 text-right text-[#665f4b]">
                                    {item.Quantity ? parseFloat(String(item.Quantity)).toFixed(2) : "-"}
                                  </td>
                                  <td className="px-3 py-2 text-right text-[#665f4b]">
                                    {item.Price ? formatCurrency(Number(item.Price)) : "-"}
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold text-[#2a2a23]">
                                    {item.Price && item.Quantity
                                      ? formatCurrency(Number(item.Price) * Number(item.Quantity))
                                      : "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
