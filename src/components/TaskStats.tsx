import type { Task } from "../types/task";

type TaskStatsProps = {
  tasks: Task[];
};

function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Total
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{total}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Completed
        </p>
        <p className="mt-1 text-xl font-semibold text-emerald-600">{completed}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Pending
        </p>
        <p className="mt-1 text-xl font-semibold text-amber-600">{pending}</p>
      </div>
    </div>
  );
}

export default TaskStats;
