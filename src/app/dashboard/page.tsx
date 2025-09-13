"use client";
import { useSession } from 'next-auth/react';

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

// Define types for our data structures
interface LoginData {
  [key: string]: boolean;
}

interface CalendarDay {
  day: number;
  date: string;
  hasLogin: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  icon: string;
}

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

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loginStreaks, setLoginStreaks] = useState<LoginData>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } else {
      // If no userId in cookies, set a default for testing
      setUserId(1); // Change this to your actual user ID
    }

    // Fetch weather data
    const fetchWeather = async () => {
      try {
        // Using a free weather API - you might need to sign up for an API key
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=16.8661&longitude=96.1951&current=temperature_2m,weather_code&timezone=Asia%2FRangoon`
        );
        
        if (response.ok) {
          const data = await response.json();
          const weatherCodes = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
          };
          
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            condition: weatherCodes[data.current.weather_code as keyof typeof weatherCodes] || "Unknown",
            location: "Yangon",
            icon: data.current.weather_code === 0 ? "☀️" : "⛅",
          });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        // Fallback weather data
        setWeather({
          temp: 28,
          condition: "Sunny",
          location: "Yangon",
          icon: "☀️",
        });
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Record login and get streak data
    const recordLoginAndGetStreak = async () => {
      try {
        setIsLoading(true);
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
        setCurrentStreak(1);
      } finally {
        setIsLoading(false);
      }
    };

    recordLoginAndGetStreak();
  }, [userId]);

  // Generate calendar days for the current month - FIXED VERSION
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = lastDay.getDate();
    
    const days: CalendarDay[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const day = prevMonthLastDay - (startDay - i - 1);
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      days.push({
        day,
        date: dateStr,
        hasLogin: loginStreaks[dateStr] || false,
        isToday: false,
        isCurrentMonth: false,
      });
    }
    
    // Add cells for each day of the month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        date: dateStr,
        hasLogin: loginStreaks[dateStr] || false,
        isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
        isCurrentMonth: true,
      });
    }
    
    // Add empty cells for days after the last day of the month
    const totalCells = 42; // 6 rows x 7 columns
    const remainingCells = totalCells - days.length;
    
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      days.push({
        day: i,
        date: dateStr,
        hasLogin: loginStreaks[dateStr] || false,
        isToday: false,
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex flex-col min-h-screen bg-[#f0eeee] p-4">
      {/* Info Banner with Subscription Alert */}
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
        <div className="bg-[#f5e8c7] text-[#3d312e] rounded-2xl p-4 shadow-lg flex items-center justify-center w-48 h-48 ml-4">
          <div className="text-center">
            <p className="text-sm">You have 5 days left on your subscription</p>
            <button className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded">Upgrade to Pro</button>
          </div>
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
                <div
                  key={index}
                  className={`p-1 rounded relative flex items-center justify-center h-6 ${
                    day.isToday 
                      ? "bg-[#3d312e] text-[#f0eeee]" 
                      : day.isCurrentMonth 
                        ? "text-[#3d312e]" 
                        : "text-gray-400"
                  }`}
                >
                  <span>{day.day}</span>
                  {day.hasLogin && (
                    <span className="absolute -top-1 -right-1 text-xs text-yellow-400">🔥</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weather Widget - Fixed height */}
          <div className="bg-white rounded-2xl p-4 shadow-md h-[140px]">
            <h3 className="text-md font-semibold mb-1">Weather</h3>
            {weather ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold">{weather.temp}°C</p>
                  <p className="text-xs text-[#3d312e]">{weather.condition}</p>
                </div>
                <div className="text-3xl">{weather.icon}</div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold">--°C</p>
                  <p className="text-xs text-[#3d312e]">Loading...</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {weather ? `${weather.location}, MM — updated ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Loading weather data...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}