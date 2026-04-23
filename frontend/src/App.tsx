import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { BudgetOverview } from "./pages/BudgetOverview";
import { CreateProject } from "./pages/CreateProject";
import { CreateTask } from "./pages/CreateTask";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ProjectDetails } from "./pages/ProjectDetails";
import { ProjectList } from "./pages/ProjectList";
import { Register } from "./pages/Register";
import { TaskDetails } from "./pages/TaskDetails";
import { TaskList } from "./pages/TaskList";
import { UploadReceipt } from "./pages/UploadReceipt";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected — all authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/edit"
        element={
          <ProtectedRoute managerOnly>
            <Layout>
              <CreateProject />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/create"
        element={
          <ProtectedRoute managerOnly>
            <Layout>
              <CreateProject />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout>
              <TaskList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/create"
        element={
          <ProtectedRoute managerOnly>
            <Layout>
              <CreateTask />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TaskDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <Layout>
              <BudgetOverview />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipts/upload"
        element={
          <ProtectedRoute>
            <Layout>
              <UploadReceipt />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
