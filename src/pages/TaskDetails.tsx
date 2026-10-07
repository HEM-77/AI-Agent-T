import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTask, updateTask } from "../api/tasks";
import type { Task } from "../types/task";

function TaskDetails() {
  const { id } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTask() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const data = await getTask(id);

        setTask(data);
        setEditTitle(data.title);
      } catch (error) {
        console.error("Failed to load task:", error);
        setError("Couldn't load this task.");
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [id]);

  async function handleSave() {
    if (!task || !id) return;

    const trimmedTitle = editTitle.trim();

    if (!trimmedTitle) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatedTask = await updateTask(
        id,
        trimmedTitle,
        task.completed
      );

      setTask(updatedTask);
      setEditTitle(updatedTask.title);
    } catch (error) {
      console.error("Failed to update task:", error);
      setError("Couldn't update this task.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading task...</p>;
  }

  if (error && !task) {
    return <p>{error}</p>;
  }

  if (!task) {
    return <p>Task not found.</p>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          to="/dashboard"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-900">
            Task Details
          </h1>

          <input
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <p className="mt-5 text-slate-600">
            Status: {task.completed ? "Completed" : "Pending"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;