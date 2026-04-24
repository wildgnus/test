import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[#d5ccb2] bg-[#f6f1df]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="grid h-10 w-10 place-content-center rounded-xl border border-[#c9bea1] text-[#49422f] lg:hidden"
            aria-label="Toggle menu"
          >
            <span className="block h-0.5 w-4 bg-current" />
            <span className="mt-1 block h-0.5 w-4 bg-current" />
            <span className="mt-1 block h-0.5 w-4 bg-current" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-[#203238]">
            <span className="grid h-10 w-10 place-content-center rounded-xl bg-[#1d5c63] text-white text-xs tracking-[0.08em]">CP</span>
            <span className="hidden sm:block">Construct Platform</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block rounded-xl border border-[#cfc4a7] bg-white/65 px-3 py-1.5 text-xs text-[#4f4736]">
            <span className="font-semibold">{user?.Name} {user?.Surname}</span>
            <span className="ml-2 rounded-full bg-[#efe8d1] px-2 py-0.5 uppercase tracking-wide text-[10px]">
                {user?.Role}
            </span>
          </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-[#1d5c63] px-3 py-1.5 text-sm font-semibold text-[#1d5c63] transition-colors hover:bg-[#1d5c63] hover:text-white"
            >
              Logout
            </button>
        </div>
      </div>
    </nav>
  );
}
