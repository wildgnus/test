import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { tasksApi } from "../services/api";
import type { Task } from "../types";
import { formatDate, priorityBadgeClass, statusBadgeClass } from "../utils/helpers";

export function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, isManager } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    tasksApi.getById(id).then((res) => {
      setTask(res.data as Task);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    setUpdatingStatus(true);
    try {
      const res = await tasksApi.updateStatus(task.Task_ID, newStatus);
      setTask(res.data as Task);
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;
    setUploadingPhoto(true);
    try {
      const res = await tasksApi.uploadPhoto(task.Task_ID, file);
      setTask(res.data as Task);
    } catch {
      alert("Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const canUpdateStatus =
    isManager || (task?.User_ID === user?.User_ID);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>;
  if (!task) return <div className="text-red-600 p-4">Task not found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/tasks" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Tasks
        </Link>
        {isManager && (
          <Link to={`/tasks/${id}/edit`} className="btn-secondary text-sm">
            Edit Task
          </Link>
        )}
      </div>

      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">{task.Title}</h1>
          <span className={`badge flex-shrink-0 ${priorityBadgeClass(task.Priority)}`}>
            {task.Priority} priority
          </span>
        </div>

        {task.Description && (
          <p className="text-gray-600">{task.Description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
            <span className={`badge mt-1 ${statusBadgeClass(task.Status)}`}>
              {task.Status.replace("_", " ")}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Deadline</p>
            <p className="text-sm font-medium mt-1">
              {task.Deadline ? formatDate(task.Deadline) : "None"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Created</p>
            <p className="text-sm font-medium mt-1">{formatDate(task.Created_at)}</p>
          </div>
        </div>

        {/* Status update */}
        {canUpdateStatus && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {(["pending", "in_progress", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || task.Status === s}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    task.Status === s
                      ? "bg-gray-200 text-gray-500 cursor-default"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photo */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Task Photo</h2>
        {task.Photo_path ? (
          <img
            src={`${process.env.REACT_APP_API_URL ?? "http://localhost:8000"}/${task.Photo_path}`}
            alt="Task"
            className="rounded-lg max-h-64 object-cover"
          />
        ) : (
          <p className="text-gray-400 text-sm">No photo attached.</p>
        )}
        {canUpdateStatus && (
          <div className="mt-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="btn-secondary text-sm"
            >
              {uploadingPhoto ? "Uploading…" : task.Photo_path ? "Replace Photo" : "Add Photo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
