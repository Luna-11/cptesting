"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import { useState, useEffect } from "react";

const data = [
  { month: "Jan", study: 400, break: 200 },
  { month: "Feb", study: 300, break: 250 },
  { month: "Mar", study: 500, break: 300 },
  { month: "Apr", study: 700, break: 400 },
  { month: "May", study: 600, break: 450 },
  { month: "Jun", study: 800, break: 500 },
  { month: "Jul", study: 650, break: 700 },
  { month: "Aug", study: 900, break: 600 },
  { month: "Sep", study: 850, break: 550 },
  { month: "Oct", study: 750, break: 400 },
  { month: "Nov", study: 500, break: 300 },
  { month: "Dec", study: 600, break: 350 },
];

// Define types for our data structures
interface LoginData {
  [key: string]: boolean;
}

interface CalendarDay {
  day: number;
  date: string;
  hasLogin: boolean;
  isToday: boolean;
}

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loginStreaks, setLoginStreaks] = useState<LoginData>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get userId from cookies
    const getUserIdFromCookies = () => {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('userId='))
        ?.split('=')[1];
      
      return cookieValue ? parseInt(cookieValue) : null;
    };

    const userIdFromCookie = getUserIdFromCookies();
    if (userIdFromCookie) {
      setUserId(userIdFromCookie);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Record login and get streak data
    const recordLoginAndGetStreak = async () => {
      try {
        // Record login using POST method
        const loginResponse = await fetch('/api/streak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        const loginData = await loginResponse.json();
        
        if (loginData.success) {
          setCurrentStreak(loginData.currentStreak);
          
          // After recording login, get the updated login history
          const historyResponse = await fetch(`/api/streak?userId=${userId}`);
          const historyData = await historyResponse.json();
          
          if (historyData.success) {
            setLoginStreaks(historyData.loginHistory);
          }
        } else {
          console.error('Failed to record login:', loginData.message);
        }
      } catch (error) {
        console.error('Error with streak API:', error);
        
        // Fallback: if API fails, at least show today as logged in
        const today = new Date().toISOString().split('T')[0];
        setLoginStreaks(prev => ({ ...prev, [today]: true }));
      }
    };

    recordLoginAndGetStreak();
  }, [userId]);

  // Generate calendar days for the current month - FIXED VERSION
  const generateCalendarDays = (): (CalendarDay | null)[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = lastDay.getDate();
    
    const days: (CalendarDay | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    // Sunday is 0, so we need to add the correct number of empty cells
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        date: dateStr,
        hasLogin: loginStreaks[dateStr] || false,
        isToday: i === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // For debugging - check what dates are being generated
  console.log('Calendar days:', calendarDays);
  console.log('Login streaks:', loginStreaks);

  return (
    <div className="flex flex-col min-h-screen bg-[#f0eeee] p-4">
      {/* Info Banner*/}
      <div className="bg-[#3d312e] text-[#f0eeee] rounded-2xl p-6 mb-6 flex justify-between items-center">
        <div className="max-w-[70%]">
          <h2 className="text-xl font-semibold">Hello Mr Smith!</h2>
          <p className="text-lg mt-1">
            Today you have 9 new applications. Also you need to hire ROR
            Developer, React.JS Developer.
          </p>
          {currentStreak > 0 && (
            <div className="flex items-center mt-2">
              <span className="text-yellow-400 mr-1">🔥</span>
              <span>Current streak: {currentStreak} days</span>
            </div>
          )}
        </div>
        <div className="w-36 h-36 -mb-2 shrink-0">
          <Image
            src="/cat1.png"
            alt="Cat"
            width={144}
            height={144}
            className="rounded-xl object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Line Chart - Fixed height and reduced padding */}
        <div className="bg-white rounded-2xl p-4 pb-2 shadow-md lg:col-span-2 flex flex-col h-[373px]">
          <h3 className="text-lg font-semibold mb-2">
            Study & Break Sessions
          </h3>
          <div className="w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={data}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="month" stroke="#3d312e" fontSize={12} />
                <YAxis stroke="#3d312e" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="study"
                  stroke="#3d312e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="break"
                  stroke="#bba2a2"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar - Fixed height to match chart */}
        <div className="flex flex-col gap-4 h-[360px]">
          {/* Calendar */}
          <div className="bg-white rounded-2xl p-4 shadow-md flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold">Calendar</h3>
              <span className="text-xs bg-[#3d312e] text-[#f0eeee] px-2 py-1 rounded-full">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="font-semibold text-[#3d312e] py-1">
                  {d}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                day ? (
                  <div
                    key={index}
                    className={`p-1 rounded relative flex items-center justify-center h-6 ${day.isToday ? "bg-[#3d312e] text-[#f0eeee]" : "text-[#3d312e]"}`}
                  >
                    <span>{day.day}</span>
                    {day.hasLogin && (
                      <span className="absolute -top-1 -right-1 text-xs text-yellow-400">🔥</span>
                    )}
                  </div>
                ) : (
                  <div key={index} className="p-1 h-6"></div>
                )
              ))}
            </div>
          </div>

          {/* Weather Widget - Fixed height */}
          <div className="bg-white rounded-2xl p-4 shadow-md h-[140px]">
            <h3 className="text-md font-semibold mb-1">Weather</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold">28°C</p>
                <p className="text-xs text-[#3d312e]">Sunny</p>
              </div>
              <div className="text-3xl">☀️</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Yangon, MM — updated 10:30 AM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}