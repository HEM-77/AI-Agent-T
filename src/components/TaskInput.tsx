import { useState } from "react"
import type { FormEvent } from "react"

type TaskInputProps = {
  onAddTask: (input: string) => void
}

function TaskInput({ onAddTask }: TaskInputProps) {
  const [input, setInput] = useState("")

  function handleAdd(e: FormEvent) {
    e.preventDefault()

    onAddTask(input)
    setInput("")
  }

  return (
    <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new task"
        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
      />

      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
      >
        Add
      </button>
    </form>
  )
}

export default TaskInput
