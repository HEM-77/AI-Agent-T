import type { Task } from "../types/task";
import TaskItem from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
};
function TaskList({ tasks, onToggleTask,onDeleteTask, }: TaskListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem key={task._id} task={task} onToggleTask={onToggleTask}  onDeleteTask={onDeleteTask}/>
      ))}
    </ul>
  );
}

export default TaskList;
