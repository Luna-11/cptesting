"use client";
import { useState, useEffect } from "react";

export default function BackgroundImageTimer() {
  const [time, setTime] = useState(1500); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const imageSources = [
    "/bg.jpg", 
    "/bg1.jpg", 
    "/bg2.jpg",
    "/bg3.jpg",
    "/bg4.jpg",
    "/bg5.jpg"
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning && time > 0) {
      timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    } else if (time === 0) {
      setIsRunning(false); // Auto-pause when timer reaches 0
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "00")}`;
  };

  const changeBackground = () => {
    setImageIndex((prevIndex) => (prevIndex + 1) % imageSources.length);
  };

  const restartTimer = () => {
    setIsRunning(false);
    setTime(1500); // Reset to 25 minutes
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${imageSources[imageIndex]})` }}
      />

      {/* Timer UI */}
      <div className="absolute top-10 left-20 bg-white/70 p-4 rounded-lg shadow-lg backdrop-blur-md">
        <h1 className="text-xl font-bold">Pomodoro Timer</h1>
        <div className="text-3xl font-mono my-2">{formatTime(time)}</div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 button2 text-white rounded-lg"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            className="px-4 py-2 button2 text-white rounded-lg"
            onClick={restartTimer}
          >
            Restart
          </button>
          <button
            className="px-4 py-2 button2 text-white rounded-lg"
            onClick={changeBackground}
          >
            Change BG
          </button>
        </div>
      </div>
    </div>
  );
}