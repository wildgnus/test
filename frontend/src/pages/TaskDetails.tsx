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

  if (loading) return <div className="flex h-64 items-center justify-center subtle-text">Loading...</div>;
  if (!task) return <div className="rounded-xl border border-[#d58d7f] bg-[#fff3ef] p-4 text-[#8d2e1f]">Task not found.</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/tasks" className="text-sm font-semibold text-[#6f6753] hover:text-[#4f4836]">
          Back to Tasks
        </Link>
        {isManager && (
          <Link to={`/tasks/${id}/edit`} className="btn-secondary text-sm">
            Edit Task
          </Link>
        )}
      </div>

      <div className="panel space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#1f272a]">{task.Title}</h1>
          <span className={`badge flex-shrink-0 ${priorityBadgeClass(task.Priority)}`}>
            {task.Priority} priority
          </span>
        </div>

        {task.Description && (
          <p className="text-[#66604d]">{task.Description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Status</p>
            <span className={`badge mt-1 ${statusBadgeClass(task.Status)}`}>
              {task.Status.replace("_", " ")}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Deadline</p>
            <p className="mt-1 text-sm font-semibold text-[#2a2a23]">
              {task.Deadline ? formatDate(task.Deadline) : "None"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Created</p>
            <p className="mt-1 text-sm font-semibold text-[#2a2a23]">{formatDate(task.Created_at)}</p>
          </div>
        </div>

        {canUpdateStatus && (
          <div>
            <p className="mb-2 text-sm font-semibold text-[#4f4836]">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {(["pending", "in_progress", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || task.Status === s}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    task.Status === s
                      ? "cursor-default bg-[#ded7c4] text-[#7d7561]"
                      : "border border-[#c9bea1] bg-white/80 text-[#4f4836] hover:bg-white"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <h2 className="mb-3 text-lg font-semibold text-[#2b2a22]">Task Photo</h2>
        {task.Photo_path ? (
          <img
            src={`${process.env.REACT_APP_API_URL ?? "http://localhost:8000"}/${task.Photo_path}`}
            alt="Task"
            className="rounded-lg max-h-64 object-cover"
          />
        ) : (
          <p className="text-sm text-[#726b56]">No photo attached.</p>
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
              {uploadingPhoto ? "Uploading..." : task.Photo_path ? "Replace Photo" : "Add Photo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
