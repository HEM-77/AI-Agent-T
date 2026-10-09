export type AIAnalyzedTask = {
  taskId: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
};

export type AIAnalysisResponse = {
  tasks: AIAnalyzedTask[];
};

export async function analyzeTasks(
  tasks: string[],
): Promise<AIAnalysisResponse> {
  const response = await fetch("http://localhost:5000/ai/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      tasks,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Failed to analyze tasks",
    );
  }

  const data = await response.json();

  return data.result;
}