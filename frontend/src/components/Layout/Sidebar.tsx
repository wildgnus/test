import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  managerOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "OV" },
  { to: "/projects", label: "Projects", icon: "PJ" },
  { to: "/tasks", label: "Tasks", icon: "TS" },
  { to: "/budget", label: "Budget", icon: "BG" },
  { to: "/receipts/upload", label: "Receipts", icon: "RC" },
];

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isManager } = useAuth();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 mt-16 w-72 transform border-r border-[#cec4a7] bg-[#f7f1de] px-3 py-5 shadow-2xl transition-transform duration-300 lg:static lg:mt-0 lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:translate-x-0 lg:shadow-none ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-4 rounded-xl border border-[#d2c6aa] bg-white/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5f563f]">
        Workspace
      </div>

      <nav className="space-y-1.5">
        {navItems
          .filter((item) => !item.managerOnly || isManager)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#1d5c63] text-white shadow-md"
                    : "text-[#544d38] hover:bg-white/70 hover:text-[#2f2a1d]"
                }`
              }
            >
              <span className="grid h-7 w-7 place-content-center rounded-lg border border-current/20 text-[10px] tracking-[0.08em]">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
