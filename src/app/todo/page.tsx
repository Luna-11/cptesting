"use client";
import { useState, useEffect } from "react";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { Work_Sans } from "next/font/google";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
});

type TaskStatus = "toStart" | "inProgress" | "done";

type Task = {
  task_id: number;
  user_id: number;
  task_name: string;
  status: TaskStatus;
  important: boolean | number;
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

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/todo');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }
        
        // Convert important from number to boolean and validate tasks
        const validTasks = data.map(task => ({
          ...task,
          important: Boolean(task.important),
          created_at: new Date(task.created_at).toISOString()
        })).filter((task): task is Task => (
          task &&
          typeof task.task_id === 'number' &&
          typeof task.task_name === 'string' &&
          ['toStart', 'inProgress', 'done'].includes(task.status) &&
          (typeof task.important === 'boolean' || typeof task.important === 'number') &&
          typeof task.created_at === 'string'
        ));
        
        setTasks(validTasks);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Failed to load tasks. Please try again later.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;
    
    try {
      setError(null);
      const response = await fetch('/api/todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_name: taskInput
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { data } = await response.json();
      
      if (!data || typeof data.task_id !== 'number') {
        throw new Error('Invalid task data received');
      }
      
      // Convert important to boolean for new task
      const newTask = {
        ...data,
        important: Boolean(data.important)
      };
      
      setTasks(prev => [newTask, ...prev]);
      setTaskInput("");
    } catch (err) {
      console.error('Failed to add task:', err);
      setError('Failed to add task. Please try again.');
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      const taskToUpdate = tasks.find(t => t.task_id === taskId);
      if (!taskToUpdate) return;

      const response = await fetch(`/api/todo/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_name: taskToUpdate.task_name,
          status: newStatus,
          subject_id: taskToUpdate.subject_id,
          important: Boolean(taskToUpdate.important)
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedTask = await response.json();
      
      setTasks(prev => prev.map(task => 
        task.task_id === taskId ? {
          ...updatedTask,
          important: Boolean(updatedTask.important)
        } : task
      ));
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const toggleImportant = async (taskId: number) => {
    try {
      const taskToUpdate = tasks.find(t => t.task_id === taskId);
      if (!taskToUpdate) return;

      const newImportantStatus = !taskToUpdate.important;
      
      const response = await fetch(`/api/todo/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_name: taskToUpdate.task_name,
          status: taskToUpdate.status,
          important: newImportantStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedTask = await response.json();
      
      setTasks(prev => prev.map(task => 
        task.task_id === taskId ? {
          ...updatedTask,
          important: Boolean(updatedTask.important)
        } : task
      ));
    } catch (err) {
      console.error('Failed to update task importance:', err);
      setError('Failed to update task importance. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/todo/${taskId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setTasks(prev => prev.filter(task => task.task_id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const toggleSort = () => {
    setSortByNewest(!sortByNewest);
  };

  const toggleImportantFilter = () => {
    setShowImportantOnly(!showImportantOnly);
  };

  const getStepFromStatus = (status: TaskStatus): number => {
    switch (status) {
      case "toStart": return 1;
      case "inProgress": return 2;
      case "done": return 3;
      default: return 1;
    }
  };

  // Process tasks for display
  const processedTasks = [...tasks]
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortByNewest ? dateB - dateA : dateA - dateB;
    })
    .filter(task => !showImportantOnly || task.important);

  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  if (loading) {
    return (
      <div className={`p-6 ${workSans.variable} font-sans flex justify-center items-center h-screen`}>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className={`p-6 ${workSans.variable} font-sans`}>
      {/* Header section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">My Day</h1>
          <div className="flex gap-4">
            <button 
              onClick={toggleSort}
              className="text-gray-500 flex items-center gap-1"
            >
              <ArrowsUpDownIcon className="w-5 h-5" />
              <span>Sort: {sortByNewest ? "Newest" : "Oldest"}</span>
            </button>
            <button 
              onClick={toggleImportantFilter}
              className={`flex items-center gap-1 ${showImportantOnly ? 'text-yellow-400' : 'text-gray-500'}`}
            >
              {showImportantOnly ? (
                <StarIconSolid className="w-5 h-5 text-yellow-400" />
              ) : (
                <StarIconOutline className="w-5 h-5" />
              )}
              <span>Important</span>
            </button>
          </div>
        </div>
        <p className="text-gray-500">{formattedDate}</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Task input */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Enter a task"
          className="border border-gray-300 rounded px-4 py-2 w-80 mr-2"
        />
        <button
          onClick={handleAddTask}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
          disabled={!taskInput.trim()}
        >
          Add
        </button>
      </div>

      {/* Tasks grid */}
      {processedTasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {showImportantOnly 
            ? "No important tasks found" 
            : "No tasks found. Add a new task to get started!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedTasks.map((task) => {
            const currentStep = getStepFromStatus(task.status);
            return (
              <div
                key={task.task_id}
                className={`bg-white p-4 rounded shadow text-gray-800 flex flex-col gap-4 ${
                  task.important ? "border-l-4 border-yellow-400" : ""
                }`}
              >
                {/* Task header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleImportant(task.task_id)}
                      aria-label={task.important ? "Mark as not important" : "Mark as important"}
                    >
                      {task.important ? (
                        <StarIconSolid className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <StarIconOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <span className="font-semibold">{task.task_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.task_id, e.target.value as TaskStatus)
                      }
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="toStart">To Start</option>
                      <option value="inProgress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <button 
                      onClick={() => handleDeleteTask(task.task_id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete task"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-4 w-full">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-[60px] h-[60px] flex items-center justify-center rounded-full text-white text-xs font-bold ${
                        currentStep === 1 ? "bg-pink-600" : "bg-gray-400"
                      }`}
                    >
                      <img 
                        src="/cat4.png" 
                        alt="To Start" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-task.png';
                        }}
                      />
                    </div>
                    <span className="text-[10px] mt-1">To start</span>
                  </div>

                  <div
                    className={`h-1 flex-1 ${
                      currentStep >= 2 ? "bg-pink-600" : "bg-gray-300"
                    }`}
                  ></div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-[60px] h-[60px] flex items-center justify-center rounded-full text-white text-xs font-bold ${
                        currentStep === 2 ? "bg-pink-600" : "bg-gray-400"
                      }`}
                    >
                      <img 
                        src="/cat2.png" 
                        alt="In Progress" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-task.png';
                        }}
                      />
                    </div>
                    <span className="text-[10px] mt-1">In Progress</span>
                  </div>

                  <div
                    className={`h-1 flex-1 ${
                      currentStep === 3 ? "bg-pink-600" : "bg-gray-300"
                    }`}
                  ></div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-[60px] h-[60px] flex items-center justify-center rounded-full text-white text-xs font-bold ${
                        currentStep === 3 ? "bg-pink-600" : "bg-gray-400"
                      }`}
                    >
                      <img 
                        src="/cat5.png" 
                        alt="Done" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-task.png';
                        }}
                      />
                    </div>
                    <span className="text-[10px] mt-1">Done</span>
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