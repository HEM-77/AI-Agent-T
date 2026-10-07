import type { Task } from "../types/task";
import { Link } from "react-router-dom";

type TaskItemProps = {
  task: Task;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
};

function TaskItem({ task, onToggleTask, onDeleteTask }: TaskItemProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={task.completed ? "text-emerald-600" : "text-slate-300"}
        >
          {task.completed ? "✓" : "○"}
        </span>
        <span
          className={
            task.completed
              ? "truncate text-sm text-slate-400 line-through"
              : "truncate text-sm text-slate-900"
          }
        >
          <Link to={`/tasks/${task._id}`}>{task.title}</Link>
        </span>
      </span>

      <button
        onClick={() => onToggleTask(task._id)}
        className={
          task.completed
            ? "shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            : "shrink-0 rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        }
      >
        {task.completed ? "Undo" : "Complete"}
      </button>
      <button
        onClick={() => onDeleteTask(task._id)}
        className="shrink-0 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
      >
        Delete
      </button>
    </li>
  );
}

export default TaskItem;
