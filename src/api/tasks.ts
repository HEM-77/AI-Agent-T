import type { Task } from "../types/task";

const API_URL = "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function handleUnauthorized(response: Response) {
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return true;
  }

  return false;
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: getAuthHeaders(),
  });
  if (handleUnauthorized(response)) {
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    console.error("getTasks failed:", {
      status: response.status,
      message: errorData?.message,
      hasToken: Boolean(localStorage.getItem("token")),
    });

    throw new Error(errorData?.message || "Failed to fetch tasks");
  }

  return response.json();
}

export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch task");
  }

  return response.json();
}

export async function createTask(title: string): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
}

export async function updateTask(
  id: string,
  title: string,
  completed: boolean,
): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      title,
      completed,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  return response.json();
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
}
