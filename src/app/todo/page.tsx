"use client";
import { useState, useEffect } from "react";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";

type TaskStatus = "toStart" | "inProgress" | "done";

type Task = {
  task_id: number;
  user_id: number;
  task_name: string;
  status: TaskStatus;
  important: boolean;
  created_at: string;
  subject_id?: number | null;
  completed_at?: string | null;
};

export default function TaskBoard() {
  const [taskInput, setTaskInput] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortByNewest, setSortByNewest] = useState(true);
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [addingTask, setAddingTask] = useState<boolean>(false);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/todo");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.tasks)) {
          throw new Error("Invalid data format received from server");
        }

        // Convert important to boolean
        const validTasks: Task[] = data.tasks
          .map((task: any) => ({
            ...task,
            important: Boolean(task.important),
            created_at: new Date(task.created_at).toISOString(),
          }))
          .filter(
            (task: any) =>
              task &&
              typeof task.task_id === "number" &&
              typeof task.task_name === "string" &&
              ["toStart", "inProgress", "done"].includes(task.status) &&
              typeof task.important === "boolean" &&
              typeof task.created_at === "string"
          );

        setTasks(validTasks);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to load tasks. Please try again later.");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!taskInput.trim() || addingTask) return;

    try {
      setAddingTask(true);
      setError(null);
      
      const response = await fetch("/api/todo", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          task_name: taskInput.trim(),
          status: "toStart",
          important: false
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.data || typeof result.data.task_id !== "number") {
        throw new Error("Invalid task data received from server");
      }

      const newTask: Task = {
        ...result.data,
        important: Boolean(result.data.important),
        created_at: new Date(result.data.created_at).toISOString(),
      };

      setTasks((prev) => [newTask, ...prev]);
      setTaskInput("");
      
    } catch (err) {
      console.error("Failed to add task:", err);
      setError(err instanceof Error ? err.message : "Failed to add task. Please try again.");
    } finally {
      setAddingTask(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      const taskToUpdate = tasks.find((t) => t.task_id === taskId);
      if (!taskToUpdate) return;

      const response = await fetch(`/api/todo/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_name: taskToUpdate.task_name,
          status: newStatus,
          subject_id: taskToUpdate.subject_id,
          important: taskToUpdate.important,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();

      setTasks((prev) =>
        prev.map((task) =>
          task.task_id === taskId
            ? { ...updatedTask, important: Boolean(updatedTask.important) }
            : task
        )
      );
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to update task status. Please try again.");
    }
  };

  const toggleImportant = async (taskId: number) => {
    try {
      const taskToUpdate = tasks.find((t) => t.task_id === taskId);
      if (!taskToUpdate) return;

      const newImportantStatus = !taskToUpdate.important;

      const response = await fetch(`/api/todo/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_name: taskToUpdate.task_name,
          status: taskToUpdate.status,
          important: newImportantStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();

      setTasks((prev) =>
        prev.map((task) =>
          task.task_id === taskId
            ? { ...updatedTask, important: Boolean(updatedTask.important) }
            : task
        )
      );
    } catch (err) {
      console.error("Failed to update task importance:", err);
      setError("Failed to update task importance. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/todo/${taskId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  const toggleSort = () => setSortByNewest(!sortByNewest);
  const toggleImportantFilter = () => setShowImportantOnly(!showImportantOnly);

  const getStepFromStatus = (status: TaskStatus): number => {
    switch (status) {
      case "toStart":
        return 1;
      case "inProgress":
        return 2;
      case "done":
        return 3;
      default:
        return 1;
    }
  };

  const processedTasks = [...tasks]
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortByNewest ? dateB - dateA : dateA - dateB;
    })
    .filter((task) => !showImportantOnly || task.important);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="p-6 font-sans flex justify-center items-center h-screen">
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 font-sans w-full max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">My Day</h1>
            <p className="text-gray-600 text-sm md:text-base">{formattedDate}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={toggleSort}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <ArrowsUpDownIcon className="w-4 h-4" />
              <span>Sort: {sortByNewest ? "Newest" : "Oldest"}</span>
            </button>
            <button
              onClick={toggleImportantFilter}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm ${
                showImportantOnly
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {showImportantOnly ? (
                <StarIconSolid className="w-4 h-4 text-yellow-500" />
              ) : (
                <StarIconOutline className="w-4 h-4" />
              )}
              <span>Important</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !addingTask) {
              handleAddTask();
            }
          }}
          placeholder="Enter a new task..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ 
            fontSize: '16px',
            WebkitAppearance: 'none'
          }}
          disabled={addingTask}
        />
        <button
          onClick={handleAddTask}
          disabled={!taskInput.trim() || addingTask}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium whitespace-nowrap sm:w-auto w-full flex items-center justify-center gap-2"
        >
          {addingTask ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            'Add Task'
          )}
        </button>
      </div>

      {/* Tasks */}
      {processedTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-base">
          {showImportantOnly
            ? "No important tasks found"
            : "No tasks found. Add a new task to get started!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedTasks.map((task) => {
            const currentStep = getStepFromStatus(task.status);
            return (
              <div
                key={task.task_id}
                className={`bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-4 ${
                  task.important ? "border-l-4 border-l-yellow-400" : ""
                }`}
                style={{
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Task Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 flex-1">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <button
                      onClick={() => toggleImportant(task.task_id)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      {task.important ? (
                        <StarIconSolid className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <StarIconOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <span className="font-semibold text-gray-900 text-base break-words flex-1">
                      {task.task_name}
                    </span>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto flex-shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(
                          task.task_id,
                          e.target.value as TaskStatus
                        )
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        WebkitAppearance: 'menulist'
                      }}
                    >
                      <option value="toStart">To Start</option>
                      <option value="inProgress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <button
                      onClick={() => handleDeleteTask(task.task_id)}
                      className="text-red-500 hover:text-red-700 px-2 py-1 rounded text-sm whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full mt-auto">
                  <div className="flex items-center justify-between gap-2 w-full">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentStep === 1 ? "bg-pink-600" : "bg-gray-400"
                        }`}
                      >
                        <img
                          src="/cat4.png"
                          alt="To Start"
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <span className="text-xs mt-1">To start</span>
                    </div>

                    {/* Connector 1 */}
                    <div
                      className={`h-1 flex-1 ${
                        currentStep >= 2 ? "bg-pink-600" : "bg-gray-300"
                      }`}
                    />

                    {/* Step 2 */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentStep === 2 ? "bg-pink-600" : "bg-gray-400"
                        }`}
                      >
                        <img
                          src="/cat2.png"
                          alt="In Progress"
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <span className="text-xs mt-1">In Progress</span>
                    </div>

                    {/* Connector 2 */}
                    <div
                      className={`h-1 flex-1 ${
                        currentStep === 3 ? "bg-pink-600" : "bg-gray-300"
                      }`}
                    />

                    {/* Step 3 */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentStep === 3 ? "bg-pink-600" : "bg-gray-400"
                        }`}
                      >
                        <img
                          src="/cat5.png"
                          alt="Done"
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <span className="text-xs mt-1">Done</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}