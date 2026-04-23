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
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏗️</div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Join ConstructPro</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Account created! Redirecting to login…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name
              </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              className="input-field"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => {
                clearError();
                setForm((f) => ({ ...f, password: e.target.value }));
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
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

          <button type="submit" disabled={loading || success} className="btn-primary w-full mt-2">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
