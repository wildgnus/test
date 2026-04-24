import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Register() {
  const { register, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "builder" as "manager" | "builder",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(form);
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 md:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[88vh] max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-[#d3c8af] bg-[#f8f3e4] shadow-[0_20px_60px_rgba(45,38,26,0.18)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden lg:block p-10 xl:p-14">
          <p className="mb-5 inline-flex rounded-full border border-[#c56a3d]/35 bg-[#c56a3d]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9e4f28]">
            New Team Member
          </p>
          <h1 className="text-4xl font-bold leading-tight text-[#1f2a2d] xl:text-5xl">
            Build your account and start moving projects forward.
          </h1>
          <p className="mt-4 max-w-md text-lg text-[#5e5948]">
            Managers organize teams, builders update progress, everyone sees clear numbers.
          </p>

          <div className="mt-10 space-y-3 text-sm">
            <div className="rounded-2xl border border-[#d6cdb7] bg-white/55 p-4 font-semibold text-[#2c2a21]">
              Single shared source for project truth
            </div>
            <div className="rounded-2xl border border-[#d6cdb7] bg-white/55 p-4 font-semibold text-[#2c2a21]">
              Faster reporting with structured receipts
            </div>
            <div className="rounded-2xl border border-[#d6cdb7] bg-white/55 p-4 font-semibold text-[#2c2a21]">
              Better handovers between office and site
            </div>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-8 lg:p-10 xl:p-14">
          <div className="w-full">
            <div className="mb-7">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#c56a3d] text-sm font-bold tracking-[0.08em] text-white">
                CP
              </div>
              <h2 className="text-3xl font-bold text-[#1e1f1a]">Create account</h2>
              <p className="mt-1 text-[#64604f]">Set up your details and join the workspace.</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-[#cf7d6a] bg-[#fff3ef] px-3 py-2 text-sm text-[#8d2e1f]">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border border-[#6da67d] bg-[#edf8ef] px-3 py-2 text-sm text-[#215f35]">
                Account created. Redirecting to sign in...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#4f4836]">First name</label>
                  <input
                    required
                    className="input-field"
                    placeholder="John"
                    value={form.name}
                    onChange={(e) => {
                      clearError();
                      setForm((f) => ({ ...f, name: e.target.value }));
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#4f4836]">Last name</label>
                  <input
                    required
                    className="input-field"
                    placeholder="Doe"
                    value={form.surname}
                    onChange={(e) => {
                      clearError();
                      setForm((f) => ({ ...f, surname: e.target.value }));
                    }}
                  />
                </div>
              </div>

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
                  minLength={8}
                  className="input-field"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => {
                    clearError();
                    setForm((f) => ({ ...f, password: e.target.value }));
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f4836]">Role</label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      role: e.target.value as "manager" | "builder",
                    }))
                  }
                >
                  <option value="builder">Builder</option>
                  <option value="manager">Construction Manager</option>
                </select>
              </div>

              <button type="submit" disabled={loading || success} className="btn-primary mt-1 w-full">
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-sm text-[#6a6454]">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#1d5c63] hover:text-[#124147]">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
