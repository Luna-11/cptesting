"use client";
import { useState } from "react";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { Work_Sans } from "next/font/google";



// Configure the Work Sans font
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
});

type Task = {
  text: string;
  status: "toStart" | "inProgress" | "done";
  important: boolean;
  createdAt: Date;
};

export default function TaskBoard() {
  const [task, setTask] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortByNewest, setSortByNewest] = useState(true);
  const [showImportantOnly, setShowImportantOnly] = useState(false);

  const handleAddTask = () => {
    if (!task) return;
    setTasks((prev) => [
      { text: task, status: "toStart", important: false, createdAt: new Date() },
      ...prev,
    ]);
    setTask("");
  };

  const handleStatusChange = (index: number, newStatus: Task["status"]) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].status = newStatus;
    setTasks(updatedTasks);
  };

  const toggleImportant = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].important = !updatedTasks[index].important;
    setTasks(updatedTasks);
  };

  const toggleSort = () => {
    setSortByNewest(!sortByNewest);
    setTasks([...tasks].sort((a, b) => {
      return sortByNewest 
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    }));
  };

  const toggleImportantFilter = () => {
    setShowImportantOnly(!showImportantOnly);
  };

  const getStepFromStatus = (status: Task["status"]) => {
    if (status === "toStart") return 1;
    if (status === "inProgress") return 2;
    if (status === "done") return 3;
    return 1;
  };

  // Filter tasks based on important filter
  const filteredTasks = showImportantOnly 
    ? tasks.filter(task => task.important)
    : tasks;

  // Format today's date
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = today.toLocaleDateString('en-US', options);

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

      {/* Input right aligned */}
      <div className="flex justify-end mb-4">
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

      {/* Tasks */}
      <div className="grid grid-cols-2 gap-6 ml-auto">
        {filteredTasks.map((item, index) => {
          const currentStep = getStepFromStatus(item.status);
          return (
            <div
              key={index}
              className={`bg-white p-4 rounded shadow text-gray-800 flex flex-col gap-4 ${
                item.important ? "border-l-4 border-yellow-400" : ""
              }`}
            >
              {/* Task Text */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleImportant(index)}>
                    {item.important ? (
                      <StarIconSolid className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <StarIconOutline className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <span className="font-semibold">{item.text}</span>
                </div>
                <select
                  value={item.status}
                  onChange={(e) =>
                    handleStatusChange(index, e.target.value as Task["status"])
                  }
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="toStart">To Start</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-4 w-full">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-[60px] h-[60px] flex items-center justify-center rounded-full text-white text-xs font-bold ${
                      currentStep === 1 ? "bg-pink-600" : "bg-gray-400"
                    }`}
                  >
                    <img src="/cat4.png" alt="step icon" className="w-500 h-700" />
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
                    <img src="/cat2.png" alt="step icon" className="w-500 h-700" />
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
                    <img src="/cat5.png" alt="step icon" className="w-500 h-700" />
                  </div>
                  <span className="text-[10px] mt-1">Done</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}