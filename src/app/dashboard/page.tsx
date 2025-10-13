"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

interface UserData {
  id: number;
  username: string;
  name: string;
  email: string;
}

interface ChartData {
  month: string;
  study: number;
  break: number;
}

interface SessionData {
  type: string;
  duration: number;
  start_time: string;
  subject_id: number;
  id: number;
  end_time: string;
  break_type?: string;
  notes?: string;
}

// Mock data as fallback
const mockChartData = [
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
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>(mockChartData);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [hasSessionData, setHasSessionData] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isClient]);

  // ✅ FIXED FUNCTION — ensures both study & break always exist and show in tooltip
  const processSessionDataForChart = (sessions: any[]): ChartData[] => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData: { [key: number]: { study: number; break: number } } = {};
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = { study: 0, break: 0 };
    }

    sessions.forEach((session) => {
      const startTime = session.start_time || session.startTime;
      if (!startTime) return;

      const date = new Date(startTime);
      const month = date.getMonth();

      const durationMinutes = Math.floor((session.duration || 0) / 60);
      let sessionType = "";

      if (session.type) sessionType = session.type.toLowerCase();
      else if (session.sessionType) sessionType = session.sessionType.toLowerCase();
      else if (session.session_type) sessionType = session.session_type.toLowerCase();

      if (sessionType.includes("study") || sessionType === "study") {
        monthlyData[month].study += durationMinutes;
      } else if (sessionType.includes("break") || sessionType === "break") {
        monthlyData[month].break += durationMinutes;
      } else {
        monthlyData[month].study += durationMinutes;
      }
    });

    // ✅ Ensure both fields always numeric (prevents tooltip skipping)
    const result = monthNames.map((monthName, index) => ({
      month: monthName,
      study: Number(monthlyData[index].study) || 0,
      break: Number(monthlyData[index].break) || 0,
    }));

    const hasData = result.some((m) => m.study > 0 || m.break > 0);
    setHasSessionData(hasData);
    return result;
  };

  useEffect(() => {
    if (!isClient) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/profile", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user || data);
        }
      } catch (e) {
        console.error("Error fetching user:", e);
      }
    };

    const fetchSessionData = async () => {
      try {
        const response = await fetch("/api/studysessions?group_by_day=false", {
          credentials: "include",
        });
        const result = await response.json();

        let sessions: any[] = [];
        if (result.data) sessions = result.data;
        else if (Array.isArray(result)) sessions = result;
        else if (result.sessions) sessions = result.sessions;
        else if (result.studySessions) sessions = result.studySessions;
        else sessions = Object.values(result).find((v: any) => Array.isArray(v)) || [];

        if (sessions.length > 0) {
          const processed = processSessionDataForChart(sessions);
          setChartData(processed);
        } else {
          setHasSessionData(false);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setHasSessionData(false);
      } finally {
        setIsChartLoading(false);
      }
    };

    const recordLoginAndGetStreak = async () => {
      try {
        setIsLoading(true);
        await fetchUserData();
        await fetchSessionData();

        const loginResponse = await fetch("/api/streak", {
          method: "POST",
          credentials: "include",
        });
        const loginData = await loginResponse.json();

        if (loginData.success) {
          setCurrentStreak(loginData.currentStreak);
          const historyRes = await fetch("/api/streak", { credentials: "include" });
          const historyData = await historyRes.json();
          if (historyData.success) setLoginStreaks(historyData.loginHistory);
        }
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    recordLoginAndGetStreak();
  }, [isClient]);

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i < startDay; i++) {
      const prevDay = new Date(year, month, -startDay + i + 1);
      const dateStr = prevDay.toISOString().split("T")[0];
      days.push({ day: prevDay.getDate(), date: dateStr, hasLogin: !!loginStreaks[dateStr], isToday: false, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        day: i,
        date: dateStr,
        hasLogin: loginStreaks[dateStr] || false,
        isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
        isCurrentMonth: true,
      });
    }

    const totalCells = 42;
    while (days.length < totalCells) {
      const nextDate = new Date(year, month + 1, days.length - daysInMonth - startDay + 1);
      const dateStr = nextDate.toISOString().split("T")[0];
      days.push({ day: nextDate.getDate(), date: dateStr, hasLogin: !!loginStreaks[dateStr], isToday: false, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const getResponsiveValue = (mobileValue: any, desktopValue: any) =>
    isClient && isMobile ? mobileValue : desktopValue;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-[#3d312e]">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value} min
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#f0eeee] p-2 md:p-4">
      {/* Info Banner */}
      <div className="bg-[#3d312e] text-[#f0eeee] rounded-2xl p-4 md:p-6 mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-center">
        <div className="max-w-full md:max-w-[40%] mb-4 md:mb-0">
          <h2 className="text-xl font-semibold">Hello {userData?.name || userData?.username || "there"}!</h2>
          <h2 className="text-xl font-semibold">Let's start your study session together</h2>
          {currentStreak > 0 && (
            <div className="flex items-center mt-2">
              <span className="text-yellow-400 mr-1">🔥</span>
              <span>Current streak: {currentStreak} days</span>
            </div>
          )}
        </div>
        <div className="w-24 h-24 md:w-36 md:h-36 shrink-0 order-2 md:order-1 mx-auto md:mx-0">
          <Image src="/cat1.png" alt="Cat" width={144} height={144} className="rounded-xl object-contain" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 flex-1">
        <div className="bg-white rounded-2xl p-3 md:p-4 pb-2 shadow-md lg:col-span-2 flex flex-col h-[320px] md:h-[373px]">
          <h3 className="text-lg font-semibold mb-2">Study & Break Sessions</h3>
          {isChartLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading chart data...</div>
          ) : !hasSessionData ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-gray-600 font-medium mb-2">Let's study together to record progress!</p>
              <button className="mt-4 bg-[#3d312e] text-white px-4 py-2 rounded-md" onClick={() => (window.location.href = "/studysession")}>
                Start Studying
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="month" stroke="#3d312e" fontSize={getResponsiveValue(10, 12)} />
                <YAxis stroke="#3d312e" fontSize={getResponsiveValue(10, 12)} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="study" stroke="#3d312e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Study Time" connectNulls />
                <Line type="monotone" dataKey="break" stroke="#bba2a2" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Break Time" connectNulls />
                <Legend verticalAlign="top" height={36} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Calendar + Tips */}
        <div className="flex flex-col gap-2 md:gap-2 h-auto md:h-[360px]">
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-md flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm md:text-md font-semibold">Calendar</h3>
              <span className="text-xs bg-[#3d312e] text-[#f0eeee] px-2 py-1 rounded-full">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                <div key={i} className="font-semibold text-[#3d312e] py-1">
                  {isMobile ? d.charAt(0) : d.slice(0, 2)}
                </div>
              ))}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`p-1 rounded relative flex items-center justify-center ${
                    getResponsiveValue("h-5 text-xs", "h-6")
                  } ${
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

          <div className="bg-white rounded-2xl p-3 md:p-3 shadow-md h-auto md:h-[140px] flex items-center">
            <div className="w-12 h-12 md:w-14 md:h-14 mr-3">
              <Image src="/cat6.png" alt="Study" width={56} height={56} className="rounded-lg object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm md:text-md font-semibold mb-1">Study Tips</h3>
              <p className="text-xs text-gray-600 mb-2">Let's study and make notes!</p>
              <button
                className="bg-[#3d312e] text-white text-xs px-2 py-1 rounded-md hover:bg-[#2a211e]"
                onClick={() => (window.location.href = "/studysession")}
              >
                Start Studying
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
