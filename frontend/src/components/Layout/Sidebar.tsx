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
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/projects", label: "Projects", icon: "📁" },
  { to: "/tasks", label: "Tasks", icon: "✅" },
  { to: "/budget", label: "Budget", icon: "💰" },
  { to: "/receipts/upload", label: "Upload Receipt", icon: "🧾" },
];

export function Sidebar() {
  const { isManager } = useAuth();

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 pt-6">
      <nav className="px-3 space-y-1">
        {navItems
          .filter((item) => !item.managerOnly || isManager)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
