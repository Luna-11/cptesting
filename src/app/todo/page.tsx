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

    const getStepFromStatus = (status: Task["status"]) => {
      if (status === "toStart") return 1;
      if (status === "inProgress") return 2;
      if (status === "done") return 3;
      return 1;
    };

    return (
      <div className="p-6">
   

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
          {tasks.map((item, index) => {
            const currentStep = getStepFromStatus(item.status);
            return (
              <div
                key={index}
                className="bg-white p-4 rounded shadow text-gray-800 flex flex-col gap-4"
              >
                {/* Task Text */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{item.text}</span>
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
