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
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const imageSources = [
    "/bg.jpg",
    "/bg1.jpg",
    "/bg2.jpg",
    "/bg3.jpg",
    "/bg4.jpg",
    "/bg5.jpg",
  ];

  const musicOptions = [
    { id: "lofi", name: "Lofi Sounds", url: "/lofi.mp3" },
    { id: "rain", name: "Rain & Thunder", url: "/thunder.mp3" },
    { id: "cafe", name: "Cafe Sounds", url: "/jazz.mp3" },
    { id: "waves", name: "Ocean Waves", url: "/wave.mp3" },
  ];

  // Save current focus time to backend
  const saveFocusTime = async (isPause: boolean = false) => {
    try {
      const timeSpent = focusDuration - time;
      if (timeSpent <= 0) return; // Don't save if no time was spent

      const response = await fetch('/api/focus-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          focus_duration_seconds: timeSpent,
          is_pause: isPause
        }),
      });
      
      if (response.ok) {
        console.log('Focus time saved successfully!');
        // Reset the timer after saving
        setTime(focusDuration);
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Failed to save focus time:', error);
    }
  };

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle music playback
  useEffect(() => {
    if (!audioRef.current) return;

    if (selectedMusic && isMusicPlaying) {
      const music = musicOptions.find((m) => m.id === selectedMusic);
      if (music) {
        audioRef.current.src = music.url;
        audioRef.current
          .play()
          .catch((error) => {
            console.error("Failed to play audio:", error);
            setIsMusicPlaying(false);
          });
      }
    } else {
      audioRef.current.pause();
    }
  }, [selectedMusic, isMusicPlaying]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setIsRunning(false);
            // Auto-save when timer completes
            saveFocusTime(false);
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
      const response = await fetch("/api/focus-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          focusDuration: newDuration,
          isProUser: isProUser,
          selectedMusic: selectedMusic,
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
      const response = await fetch("/api/focus-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          focusDuration: focusDuration,
          isProUser: newStatus,
          selectedMusic: selectedMusic,
        }),
      });

      if (response.ok) {
        setIsProUser(newStatus);
      }
    } catch (error) {
      console.error("Failed to update pro status:", error);
    }
  };

  const handleMusicSelect = async (musicId: string) => {
    const newSelection = selectedMusic === musicId ? null : musicId;
    setSelectedMusic(newSelection);

    // auto-play if already playing
    if (newSelection) {
      setIsMusicPlaying(true);
    }

    try {
      await fetch("/api/focus-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          focusDuration: focusDuration,
          isProUser: isProUser,
          selectedMusic: newSelection,
        }),
      });
    } catch (error) {
      console.error("Failed to save music selection:", error);
    }
  };

  const toggleMusicPlayback = () => {
    if (selectedMusic) {
      setIsMusicPlaying(!isMusicPlaying);
    } else {
      setShowMusicModal(true);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
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

        <div className="flex gap-2 mb-2">
          <button
            className="px-4 py-2 button2 text-white rounded-lg"
            onClick={() => setIsRunning((prev) => !prev)}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => saveFocusTime(false)}
          >
            Save
          </button>
          <button
            className="px-4 py-2 button2 text-white rounded-lg"
            onClick={restartTimer}
          >
            Restart
          </button>
        </div>

        {/* Music Control */}
        <div className="mt-2 space-y-3">
          <button
            className='w-full bg-white px-4 py-2 rounded-lg flex items-center justify-center gap-2'
            onClick={changeBackground}
          >
            Change BG
          </button>
          {/* Play / Pause */}
          <button
            className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
              selectedMusic
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={toggleMusicPlayback}
          >
            {selectedMusic
              ? `${isMusicPlaying ? "Pause" : "Play"} ${
                  musicOptions.find((m) => m.id === selectedMusic)?.name
                }`
              : "Select Background Music"}
          </button>

          {/* Change Music */}
          {selectedMusic && (
            <button
              className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={() => setShowMusicModal(true)}
            >
              Change Music
            </button>
          )}

          {/* Volume Control */}
          {selectedMusic && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                  <img
                    src={isMuted ? "/musoff.png" : "/muson.png"}
                    alt="volume control"
                    className="w-5 h-5"
                  />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm w-10">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Music Modal */}
      {showMusicModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <h2 className="text-xl font-bold mb-4">Select Background Music</h2>
            <div className="space-y-2 mb-4">
              {musicOptions.map((music) => (
                <div
                  key={music.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMusic === music.id
                      ? "bg-purple-100 border border-purple-500"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleMusicSelect(music.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                        selectedMusic === music.id
                          ? "bg-purple-500 border-purple-500"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedMusic === music.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span>{music.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => setShowMusicModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}