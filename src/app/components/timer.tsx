// components/timer.tsx
"use client";
import { useState, useEffect } from "react";

interface TimerProps {
  subject: string;
  onStart: () => void;
  onStop: (duration: number) => void;
  onBreak: (duration: number) => void; 
  initialStartTime: Date | null;
  disabled: boolean;
}

export default function Timer({
  subject,
  onStart,
  onStop,
onBreak,
  initialStartTime,
  disabled,
}: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (initialStartTime) {
      setStartTime(new Date(initialStartTime));
      setIsRunning(true);
    }
  }, [initialStartTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - (startTime?.getTime() || now.getTime());
        setElapsed(Math.floor(diff / 1000));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    onStart();
  };

  const handleStop = () => {
    setIsRunning(false);
    onStop(elapsed);
  };

  const handleBreak = () => {
    setIsRunning(false);
    onBreak(elapsed)
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">{subject}</h2>
        <div className="text-4xl font-mono my-4">{formatTime(elapsed)}</div>
      </div>
      
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={disabled}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Start
          </button>
        ) : (
          <>
            <button
              onClick={handleStop}
              disabled={disabled}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Stop
            </button>
            <button
              onClick={handleBreak}
              disabled={disabled}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Take Break
            </button>
          </>
        )}
      </div>
    </div>
  );
}