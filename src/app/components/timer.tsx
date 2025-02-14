// components/Timer.tsx
import { useState, useEffect } from "react";

type TimerProps = {
  subject: string;
  onStop: () => void;
};

export default function Timer({ subject, onStop }: TimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg text-center">
      <h2 className="text-xl font-bold">Studying: {subject}</h2>
      <p className="text-3xl font-semibold my-2">{time}s</p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600"
        >
          {isRunning ? "Pause" : "Resume"}
        </button>
        <button
          onClick={onStop}
          className="px-4 py-2 rounded bg-red-500 hover:bg-red-600"
        >
          Stop & Back
        </button>
      </div>
    </div>
  );
}
