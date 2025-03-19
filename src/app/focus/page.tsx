"use client";
import { useState, useEffect } from "react";


export default function BackgroundVideoTimer() {
  const [time, setTime] = useState(1500); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null; // Declare timer variable at the top

    if (isRunning && time > 0) {
      timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    }

    return () => {
      if (timer) clearInterval(timer); // Ensure timer exists before clearing
    };
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="/202004-916894674.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Timer UI */}
      <div className="absolute top-10 left-20 bg-white/70 p-4 rounded-lg shadow-lg backdrop-blur-md">
        <h1 className="text-xl font-bold">Pomodoro Timer</h1>
        <div className="text-3xl font-mono my-2">{formatTime(time)}</div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
      </div>
    </div>
  );
}
