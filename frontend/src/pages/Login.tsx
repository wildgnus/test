import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(form.email, form.password);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 md:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[88vh] max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-[#d3c8af] bg-[#f8f3e4] shadow-[0_20px_60px_rgba(45,38,26,0.18)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#1d5c63]/35 bg-[#1d5c63]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1d5c63]">
              Construction Control Room
            </p>
            <h1 className="text-4xl font-bold leading-tight text-[#1f2a2d] xl:text-5xl">
              Keep projects calm even when sites get chaotic.
            </h1>
            <p className="mt-4 max-w-md text-lg text-[#5e5948]">
              Track costs, tasks, and receipts in one place built for real project pressure.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-[#d6cdb7] bg-white/55 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-[#6b6450]">Visibility</p>
              <p className="mt-2 font-semibold text-[#2c2a21]">Live task and budget pulse</p>
            </div>
            <div className="rounded-2xl border border-[#d6cdb7] bg-white/55 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-[#6b6450]">Field Ready</p>
              <p className="mt-2 font-semibold text-[#2c2a21]">Receipt uploads from site</p>
            </div>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-8 lg:p-10 xl:p-14">
          <div className="w-full">
            <div className="mb-8">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d5c63] text-sm font-bold tracking-[0.08em] text-white">
                CP
              </div>
              <h2 className="text-3xl font-bold text-[#1e1f1a]">Welcome back</h2>
              <p className="mt-1 text-[#64604f]">Sign in to continue to your workspace.</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-[#cf7d6a] bg-[#fff3ef] px-3 py-2 text-sm text-[#8d2e1f]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f4836]">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => {
                    clearError();
                    setForm((f) => ({ ...f, email: e.target.value }));
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f4836]">Password</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => {
                    clearError();
                    setForm((f) => ({ ...f, password: e.target.value }));
                  }}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-1 w-full">
                {loading ? "Signing in..." : "Enter workspace"}
              </button>
            </form>

            <p className="mt-5 text-sm text-[#6a6454]">
              Need an account?{" "}
              <Link to="/register" className="font-semibold text-[#1d5c63] hover:text-[#124147]">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
