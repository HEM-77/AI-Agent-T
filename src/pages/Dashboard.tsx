import { useState } from "react";
import Header from "../components/Header";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import TaskStats from "../components/TaskStats";
import { useTasks } from "../hooks/useTasks";

type Filter = "all" | "completed" | "pending";

function Dashboard() {
  const [filter, setFilter] = useState<Filter>("all");

  const {
    tasks,
    loading,
    error,
    addTask,
    toggleTask,
    deleteTaskById,
  } = useTasks();

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