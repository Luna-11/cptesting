"use client";
import { useState } from "react";

export default function TodoList() {
  const [tasks, setTasks] = useState<{ text: string; status: string }[]>([]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (input.trim()) {
      setTasks([...tasks, { text: input, status: "Nothing" }]);
      setInput("");
    }
  };

  const updateStatus = (index: number, status: string) => {
    setTasks(
      tasks.map((task, i) => (i === index ? { ...task, status } : task))
    );
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">To-Do List</h1>
      <div className="flex w-full mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 flex-1 rounded-l-md"
          placeholder="Enter a task"
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      <ul className="w-full">
        {tasks.map((task, index) => (
          <li
            key={index}
            className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded-md"
          >
            <span>{task.text}</span>
            <select
              value={task.status}
              onChange={(e) => updateStatus(index, e.target.value)}
              className="border p-1 rounded"
            >
              <option value="Nothing">Nothing</option>
              <option value="Half Done">Half Done</option>
              <option value="Done">Done</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
