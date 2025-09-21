"use client";

import { Calendar, Clock, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasLogin: boolean;
}

interface UserData {
  id: number;
  username: string;
  name: string;
  email: string;
}

interface CalendarEvent {
  event_id: number;
  event_name: string;
  event_date: string;
  event_time: string | null;
  user_id: number;
}

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [streakInfo, setStreakInfo] = useState({ current: 0, longest: 0 });
  const [loginHistory, setLoginHistory] = useState<{ [date: string]: boolean }>({});
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todoCount, setTodoCount] = useState(0);
  const [vocabularyCount, setVocabularyCount] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    // Fetch user data from the API
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUserData(userData.user || userData);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    async function fetchLogins() {
      try {
        setIsLoading(true);

        await fetchUserData();

        const res = await fetch("/api/streak");
        const data = await res.json();

        if (data.success) {
          setLoginHistory(data.loginHistory);
          setStreakInfo({
            current: data.currentStreak || 0,
            longest: data.longestStreak || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogins();
  }, []);

  useEffect(() => {
    async function fetchTodoCount() {
      try {
        const res = await fetch("/api/todo", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const count =
            Array.isArray(data) && data.length > 0
              ? data[0].totalCount
              : data.totalCount || 0;

          setTodoCount(count);
        }
      } catch (err) {
        console.error("Error fetching todo count:", err);
      }
    }

    async function fetchVocabularyCount() {
      try {
        const res = await fetch("/api/vocabulary", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();

          let count = 0;

          if (Array.isArray(data)) {
            count = data.length;
          } else if (typeof data === "object" && data !== null) {
            if ("count" in data) {
              count = data.count;
            } else {
              count = Object.keys(data).length;
            }
          }

          setVocabularyCount(count);
        }
      } catch (err) {
        console.error("Error fetching vocabulary count:", err);
      }
    }

    async function fetchEvents() {
      try {
        setIsLoadingEvents(true);
        const res = await fetch("/api/events", { 
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          
          // Handle both array response and potential error response
          if (Array.isArray(data)) {
            setEvents(data);
          } else if (data.error) {
            console.error("API Error:", data.error);
            setEvents([]);
          } else {
            console.error("Unexpected response format:", data);
            setEvents([]);
          }
        } else {
          console.error("Failed to fetch events:", res.status, res.statusText);
          setEvents([]);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    fetchTodoCount();
    fetchVocabularyCount();
    fetchEvents();
  }, []);

  function generateCalendarDays() {
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray: CalendarDay[] = [];

    // Previous month filler
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDay =
        new Date(year, month, 0).getDate() - firstDay + i + 1;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(
        2,
        "0"
      )}-${String(prevMonthDay).padStart(2, "0")}`;

      daysArray.push({
        day: prevMonthDay,
        isCurrentMonth: false,
        isToday: false,
        hasLogin: !!loginHistory[dateKey],
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        i
      ).padStart(2, "0")}`;

      daysArray.push({
        day: i,
        isCurrentMonth: true,
        isToday:
          today.getDate() === i &&
          today.getMonth() === month &&
          today.getFullYear() === year,
        hasLogin: !!loginHistory[dateKey],
      });
    }

    // Next month filler
    const totalCells = 42;
    const nextMonthDays = totalCells - daysArray.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(
        2,
        "0"
      )}-${String(i).padStart(2, "0")}`;

      daysArray.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        hasLogin: !!loginHistory[dateKey],
      });
    }

    setCalendarDays(daysArray);
  }

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, loginHistory]);

  // Format event date for display
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid date";
    }
  };

  // Format event time for display
  const formatEventTime = (timeString: string | null) => {
    if (!timeString) return 'All day';
    
    try {
      // If timeString is already in HH:MM format
      if (timeString.match(/^\d{2}:\d{2}:\d{2}$/) || timeString.match(/^\d{2}:\d{2}$/)) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
      
      // If it's a full datetime string
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error("Error formatting time:", error, timeString);
      return 'Invalid time';
    }
  };

  // Sort events by date for display
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  // Filter events to only show upcoming ones (today and future)
  const upcomingEvents = sortedEvents.filter(event => {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  return (
    <div className="min-h-screen bg-[#f0eeee]">
      <main className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-4">
          {/* Left Section - Full width on mobile, 8 cols on desktop */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            {/* Welcome Section */}
            <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
              <div className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between">
                <div className="space-y-2 mb-4 md:mb-0 md:mr-4">
                  <h1 className="text-xl md:text-2xl font-bold text-[#3d312e]">
                    Hello {userData?.name || userData?.username || "there"}!
                  </h1>
                  <p className="text-[#3d312e] max-w-md text-sm md:text-base">
                    I have assigned you a new Task. I want you to finish it by
                    tomorrow evening.
                  </p>
                  <button className="mt-2 md:mt-4 bg-[#3d312e] hover:bg-[#2a211f] text-white px-3 py-1 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium">
                    Review it
                  </button>
                </div>
                <img
                  src="/c3.png"
                  alt="Person working at desk"
                  className="h-24 w-32 md:h-32 md:w-40 object-contain"
                />
              </div>
            </div>

            {/* Stats Row - Stack on mobile, grid on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-3">
              <StatCard
                title="My To Do List"
                value={todoCount}
                buttonLabel="View Details"
                buttonHref="/todo"
              />
              <StatCard
                title="My Vocabulary"
                value={vocabularyCount}
                buttonLabel="View Details"
                buttonHref="/vocab"
              />
              <StatCard
                title="Let's do our best!"
                imageSrc="/bc.jpg"
                isFullImage={true}
              />
            </div>

            <div className="bg-[#fcf6f6] border border-[#d1c7c7] rounded-lg shadow-sm">
              <div className="p-2 flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-6">
                <img
                  src="/std.jpg"
                  alt="Person working at desk"
                  className="h-52 w-60 md:h-42 md:w-52 object-contain"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-[#3d312e]">
                    Ready to study ?
                  </h1>
                  <p className="text-[#3d312e] max-w-md text-sm md:text-base">
                    Let's move to study session!
                  </p>
                  <button className="mt-2 md:mt-4 bg-[#3d312e] hover:bg-[#2a211f] text-white px-3 py-1 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium" onClick={() => window.location.href = '/studysession'}>
                    Study Session
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Full width on mobile, 4 cols on desktop */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            {/* Calendar */}
            <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
              <div className="p-4 md:p-6 pb-2 flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-[#3d312e]">
                  Study Calendar
                </h3>
                <span className="text-xs bg-[#3d312e] text-[#f0eeee] px-2 py-1 rounded-full">
                  {currentDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="p-4 md:p-6 pt-2">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#3d312e] mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`p-1 rounded flex items-center justify-center h-6 md:h-8 text-xs md:text-sm relative ${
                        day.isToday
                          ? "bg-[#3d312e] text-[#f0eeee]"
                          : day.isCurrentMonth
                          ? "text-[#3d312e]"
                          : "text-[#d1c7c7]"
                      }`}
                    >
                      {day.day}
                      {day.hasLogin && (
                        <span className="absolute -top-1 -right-1 text-xs">
                          🔥
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row justify-between mt-4 text-xs md:text-sm text-[#3d312e] space-y-1 md:space-y-0">
                  <span>🔥 Current Streak: {streakInfo.current} days</span>
                  <span>🏆 Longest Streak: {streakInfo.longest} days</span>
                </div>
              </div>
            </div>

            {/* Time & Events */}
            <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
              <div className="p-4 md:p-6 pb-2 flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-[#3d312e]">
                  Upcoming Events
                </h3>
                <Link 
                  href="/calendar" 
                  className="text-[#3d312e] hover:text-[#2a211f]"
                >
                  <Plus className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </div>
              <div className="p-4 md:p-6 pt-2 space-y-3">
                {isLoadingEvents ? (
                  <div className="text-center py-4 text-[#3d312e] text-sm md:text-base">
                    Loading events...
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 3).map((event) => (
                    <EventItem
                      key={event.event_id}
                      icon={<Calendar className="h-4 w-4 md:h-5 md:w-5 text-[#3d312e]" />}
                      date={formatEventDate(event.event_date)}
                      time={formatEventTime(event.event_time)}
                      title={event.event_name}
                    />
                  ))
                ) : (
                  <div className="text-center py-4">
                    <img 
                      src="/eve.png" 
                      alt="No events" 
                      className="h-24 w-32 md:h-36 md:w-44 mx-auto mb-2 opacity-70"
                    />
                    <p className="text-[#3d312e] text-sm md:text-base">No Upcoming Events!</p>
                  </div>
                )}
                
                {upcomingEvents.length > 3 && (
                  <div className="text-center pt-2">
                    <Link 
                      href="/calendar" 
                      className="text-xs md:text-sm text-[#3d312e] hover:underline"
                    >
                      View all events ({upcomingEvents.length})
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value?: string | number;
  imageSrc?: string;
  isFullImage?: boolean;
  buttonLabel?: string;
  buttonHref?: string;
}

function StatCard({
  title,
  value,
  imageSrc,
  isFullImage = false,
  buttonLabel,
  buttonHref,
}: StatCardProps) {
  return (
    <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm flex flex-col">
      <div className="p-4 md:p-6 flex flex-col items-center space-y-3 flex-1">
        {imageSrc && isFullImage ? (
          <div className="w-full h-32 md:h-40 overflow-hidden rounded-md">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : imageSrc ? (
          <img src={imageSrc} alt={title} className="h-10 w-10 md:h-12 md:w-12 object-contain" />
        ) : null}

        <h3 className="font-semibold text-[#3d312e] text-sm md:text-base text-center">{title}</h3>

        {!isFullImage && (
          <div className="h-16 w-16 md:h-20 md:w-20 bg-[#f0eeee] rounded-full flex items-center justify-center">
            <span className="text-xl md:text-2xl font-bold text-[#3d312e]">{value}</span>
          </div>
        )}
      </div>

      {buttonLabel && buttonHref && (
        <div className="p-3 md:p-4">
          <Link
            href={buttonHref}
            className="block text-center bg-[#3d312e] hover:bg-[#2a211f] text-white px-3 py-2 rounded-md text-xs md:text-sm font-medium"
          >
            {buttonLabel}
          </Link>
        </div>
      )}
    </div>
  );
}

function EventItem({
  icon,
  date,
  time,
  title,
}: {
  icon: React.ReactNode;
  date: string;
  time: string;
  title?: string;
}) {
  return (
    <div className="flex items-center space-x-3 p-2 md:p-3 bg-[#f0eeee] rounded-lg">
      {icon}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-xs md:text-sm font-medium text-[#3d312e] truncate">
            {title}
          </div>
        )}
        <div className="text-xs text-[#3d312e]">
          {date} • {time}
        </div>
      </div>
    </div>
  );
}