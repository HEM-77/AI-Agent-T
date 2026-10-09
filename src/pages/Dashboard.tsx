import { useState } from "react";
import Header from "../components/Header";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import TaskStats from "../components/TaskStats";
import { useTasks } from "../hooks/useTasks";
import { analyzeTasks, type AIAnalysisResponse } from "../api/ai";
type Filter = "all" | "completed" | "pending";

function Dashboard() {
  const [filter, setFilter] = useState<Filter>("all");
  const [aiResult, setAiResult] = useState<AIAnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const { tasks, loading, error, addTask, toggleTask, deleteTaskById } =
    useTasks();

  const filteredTasks =
    filter === "all"
      ? tasks
      : filter === "completed"
        ? tasks.filter((task) => task.completed)
        : tasks.filter((task) => !task.completed);

  function filterButtonClasses(value: Filter) {
    const base =
      "rounded-md border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-900/20";

    return filter === value
      ? `${base} border-slate-900 bg-slate-900 text-white`
      : `${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`;
  }

  async function handleAnalyzeTasks() {
    if (tasks.length === 0) {
      setAiError("Add at least one task before analyzing.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    try {
      const taskTitles = tasks.map((task) => task.title);

      const result = await analyzeTasks(taskTitles);

      console.log("AI analysis:", result);

      setAiResult(result);
    } catch (error) {
      console.error("AI analysis failed:", error);

      setAiError(
        error instanceof Error ? error.message : "Failed to analyze tasks",
      );
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Header title="Task Dashboard" />

        <TaskInput onAddTask={addTask} />

        <div className="mt-6">
          <TaskStats tasks={tasks} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={filterButtonClasses("all")}
          >
            All
          </button>

          <button
            onClick={() => setFilter("completed")}
            className={filterButtonClasses("completed")}
          >
            Completed
          </button>

          <button
            onClick={() => setFilter("pending")}
            className={filterButtonClasses("pending")}
          >
            Pending
          </button>
        </div>

        {/* AI SECTION */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                AI Task Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Let the AI analyze and prioritize your tasks.
              </p>
            </div>

            <button
              onClick={handleAnalyzeTasks}
              disabled={aiLoading}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiLoading ? "Analyzing..." : "Analyze My Tasks"}
            </button>
          </div>

          {aiError && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {aiError}
            </div>
          )}

          {aiResult && (
            <div className="space-y-3">
              {aiResult.tasks.map((item) => (
                <div
                  key={item.taskId}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium text-slate-900">
                      {tasks.find((task) => task._id === item.taskId)?.title ??
                        "Unknown task"}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                      {item.priority}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          {loading ? (
            <p>Loading tasks...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTaskById}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
