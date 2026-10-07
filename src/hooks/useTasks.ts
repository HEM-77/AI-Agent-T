import { useEffect, useState } from "react";
import type { Task } from "../types/task";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);

      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setError("Couldn't load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  loadTasks();
}, []);

async function addTask(input: string) {
  try {
    const newTask = await createTask(input);

    setTasks((prev) => [...prev, newTask]);
  } catch (error) {
    console.error("Failed to create task:", error);
  }
}
async function toggleTask(id: string) {
  const task = tasks.find((task) => task._id === id);

  if (!task) return;

  try {
    const updatedTask = await updateTask(id,  task.title,!task.completed);

    setTasks((prev) =>
      prev.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  } catch (error) {
    console.error("Failed to toggle task:", error);
  }
}
async function deleteTaskById(id: string) {
  try {
    await deleteTask(id);

    setTasks((prev) =>
      prev.filter((task) => task._id !== id)
    );
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
}
return {
  tasks,
  loading,
  error,
  addTask,
  toggleTask,
  deleteTaskById,
};
}