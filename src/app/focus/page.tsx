"use client";
import { useState, useEffect, useRef } from "react";

export default function BackgroundImageTimer() {
  const [focusDuration, setFocusDuration] = useState(1500);
  const [time, setTime] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isProUser, setIsProUser] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [tempDuration, setTempDuration] = useState(25); // Minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const imageSources = [
    "/bg.jpg", 
    "/bg1.jpg", 
    "/bg2.jpg",
    "/bg3.jpg",
    "/bg4.jpg",
    "/bg5.jpg"
  ];

  // Load settings from backend on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/focus-settings');
        if (response.ok) {
          const data = await response.json();
          setFocusDuration(data.focus_duration);
          setTime(data.focus_duration);
          setIsProUser(data.is_pro_user);
          setTempDuration(Math.floor(data.focus_duration / 60));
        }
      } catch (error) {
        console.error("Failed to load focus settings:", error);
      }
    };
    
    loadSettings();
  }, []);

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
    setTime(focusDuration);
  };

  const handleDurationChange = async () => {
    const newDuration = tempDuration * 60;
    
    try {
      const response = await fetch('/api/focus-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          focusDuration: newDuration,
          isProUser: isProUser
        }),
      });
      
      if (response.ok) {
        setFocusDuration(newDuration);
        setTime(newDuration);
        setShowDurationModal(false);
      }
    } catch (error) {
      console.error("Failed to save focus duration:", error);
    }
  };

  const toggleProUser = async () => {
    const newStatus = !isProUser;
    
    try {
      const response = await fetch('/api/focus-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          focusDuration: focusDuration,
          isProUser: newStatus
        }),
      });
      
      if (response.ok) {
        setIsProUser(newStatus);
      }
    } catch (error) {
      console.error("Failed to update pro status:", error);
    }
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
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">Pomodoro Timer</h1>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded ${isProUser ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              {isProUser ? 'PRO USER' : 'Free User'}
            </span>
            <button 
              onClick={toggleProUser}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
            >
              {isProUser ? 'Downgrade' : 'Upgrade'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-3xl font-mono">{formatTime(time)}</div>
          {isProUser && (
            <button
              onClick={() => setShowDurationModal(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              Change Duration
            </button>
          )}
        </div>
        
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

      {/* Duration Change Modal */}
      {showDurationModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <h2 className="text-xl font-bold mb-4">Set Focus Duration</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Duration: {tempDuration} minutes
              </label>
              <input
                type="range"
                min="5"
                max="90"
                value={tempDuration}
                onChange={(e) => setTempDuration(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 min</span>
                <span>90 min</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowDurationModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleDurationChange}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}