import { useCallback, useEffect, useState } from "react";
import { tasksApi } from "../services/api";
import type { Task } from "../types";

export function useTasks(params?: {
  project_id?: string;
  status?: string;
  priority?: string;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tasksApi.getAll(params);
      setTasks(res.data as Task[]);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [params?.project_id, params?.status, params?.priority]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}
