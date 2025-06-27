"use client";
import { useState } from "react";

type Task = {
  text: string;
  status: "toStart" | "inProgress" | "done";
};

export default function TaskBoard() {
  const [task, setTask] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = () => {
    if (!task) return;
    setTasks((prev) => [...prev, { text: task, status: "toStart" }]);
    setTask("");
  };

  const handleStatusChange = (index: number, newStatus: Task["status"]) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].status = newStatus;
    setTasks(updatedTasks);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Task Board</h1>

      {/* Input */}
      <div className="flex mb-6">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a task"
          className="border border-gray-300 rounded px-4 py-2 w-80 mr-2"
        />
        <button
          onClick={handleAddTask}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-3 gap-6">
        {/* To Start */}
        <div>
          <h2 className="text-xl font-semibold mb-4">To Start</h2>
          {tasks
            .filter((item) => item.status === "toStart")
            .map((item, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded shadow mb-3 text-gray-800 flex items-center justify-between gap-2"
              >
                <span className="flex-1">{item.text}</span>
                <select
                  value={item.status}
                  onChange={(e) =>
                    handleStatusChange(
                      tasks.findIndex(
                        (taskItem) =>
                          taskItem.text === item.text &&
                          taskItem.status === item.status
                      ),
                      e.target.value as Task["status"]
                    )
                  }
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="toStart">To Start</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            ))}
        </div>

        {/* In Progress */}
        <div>
          <h2 className="text-xl font-semibold mb-4">In Progress</h2>
          {tasks
            .filter((item) => item.status === "inProgress")
            .map((item, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded shadow mb-3 text-gray-800 flex items-center justify-between gap-2"
              >
                <span className="flex-1">{item.text}</span>
                <select
                  value={item.status}
                  onChange={(e) =>
                    handleStatusChange(
                      tasks.findIndex(
                        (taskItem) =>
                          taskItem.text === item.text &&
                          taskItem.status === item.status
                      ),
                      e.target.value as Task["status"]
                    )
                  }
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="toStart">To Start</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            ))}
        </div>

        {/* Done */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Done</h2>
          {tasks
            .filter((item) => item.status === "done")
            .map((item, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded shadow mb-3 text-gray-800 flex items-center justify-between gap-2"
              >
                <span className="flex-1">{item.text}</span>
                <select
                  value={item.status}
                  onChange={(e) =>
                    handleStatusChange(
                      tasks.findIndex(
                        (taskItem) =>
                          taskItem.text === item.text &&
                          taskItem.status === item.status
                      ),
                      e.target.value as Task["status"]
                    )
                  }
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="toStart">To Start</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
