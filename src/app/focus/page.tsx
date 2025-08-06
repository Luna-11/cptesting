"use client";
import { useState, useEffect, useRef } from "react";

export default function BackgroundImageTimer() {
  const [time, setTime] = useState(1500); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const imageSources = [
    "/bg.jpg", 
    "/bg1.jpg", 
    "/bg2.jpg",
    "/bg3.jpg",
    "/bg4.jpg",
    "/bg5.jpg"
  ];

  // Timer Effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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
            onClick={() => setIsRunning((prev) => !prev)}
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
