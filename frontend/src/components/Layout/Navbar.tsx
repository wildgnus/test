import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🏗️</span>
            <span>ConstructPro</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-200">
              {user?.Name} {user?.Surname}
              <span className="ml-2 bg-primary-800 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                {user?.Role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-primary-800 hover:bg-primary-900 px-3 py-1.5 rounded-lg transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
