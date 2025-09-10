"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Types
type StudyDataItem = {
  day: string;
  hours: number;
  date: string;
  start?: string;
  end?: string;
};

type BreakDataItem = {
  name: string;
  value: number;
};

type OverallDataItem = {
  day: string;
  study: number;
  break: number;
};

type StudySession = {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  taskName: string;
  category: string;
};

type MiniCalendarProps = {
  studyData: StudyDataItem[];
  onDayClick: (day: number) => void;
};

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

const COLORS = ["#DEB69C", "#722f37", "#C08baf", "#61463B"];

const MiniCalendar = ({ studyData, onDayClick }: MiniCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const daysInMonth = (month: number, year: number): number =>
    new Date(year, month + 1, 0).getDate();

  const firstDayOfMonth = (month: number, year: number): number =>
    new Date(year, month, 1).getDay();

  const getStudyHoursForDate = (date: number): number => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(date).padStart(2, "0")}`;
    const dayData = studyData.find(
      (d: StudyDataItem) => d.date === formattedDate
    );
    return dayData ? dayData.hours : 0;
  };

  const getColorForStudyHours = (hours: number): string => {
    if (hours === 0) return "bg-white border border-gray-200";
    if (hours < 3) return "bg-[#f4e9e4]";
    if (hours < 5) return "bg-[#d8b4a0]";
    if (hours < 8) return "bg-[#a87453]";
    return "bg-[#5c4033] text-white";
  };

  const renderDays = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const firstDay = firstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const studyHours = getStudyHoursForDate(day);
      const colorClass = getColorForStudyHours(studyHours);

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => onDayClick(day)}
          className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer text-sm hover:opacity-80 transition-all ${colorClass}`}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (increment: number) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <div className="border p-4 rounded shadow-lg bg-white h-fit">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1 rounded hover:bg-gray-100"
        >
          &lt;
        </button>
        <h3 className="font-semibold">
          {months[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className="p-1 rounded hover:bg-gray-100"
        >
          &gt;
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>

      {/* Legend */}
      <div className="mt-4 flex flex-col items-center">
        <div className="text-xs text-gray-600 mb-1">Less</div>
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded bg-[#f4e9e4] flex items-center justify-center text-xs">
            0+
          </div>
          <div className="w-6 h-6 rounded bg-[#d8b4a0] flex items-center justify-center text-xs">
            3+
          </div>
          <div className="w-6 h-6 rounded bg-[#a87453] flex items-center justify-center text-xs">
            5+
          </div>
          <div className="w-6 h-6 rounded bg-[#5c4033] flex items-center justify-center text-xs text-white">
            8+
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-1">More</div>
      </div>
    </div>
  );
};

const TimelineChart = ({ data }: { data: StudySession[] }) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border p-4 rounded shadow-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">Study Session Timeline</h2>
      <div className="space-y-4">
        {data.map((session) => {
          const startTime =
            typeof session.startTime === "string"
              ? new Date(session.startTime)
              : session.startTime;
          const endTime =
            typeof session.endTime === "string"
              ? new Date(session.endTime)
              : session.endTime;

          return (
            <div key={session.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{session.taskName}</h3>
                  <p className="text-sm text-gray-500">{session.category}</p>
                </div>
                <span className="text-sm font-medium bg-amber-100 px-2 py-1 rounded">
                  {formatDuration(session.duration)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {formatTime(startTime)} ~ {formatTime(endTime)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Sidebar = ({ isSidebarOpen }: SidebarProps) => (
  <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
    {/* Sidebar content */}
  </div>
);

const Navbar = () => <nav className="navbar">{/* Navbar content */}</nav>;

export default function UserReportPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [reportData, setReportData] = useState<{
    studyData: any[];
    breakData: any[];
    overallData: any[];
    timelineData: any[];
    calendarData: any[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/reports");
        if (!response.ok) throw new Error("Failed to fetch report data");
        const data = await response.json();
        setReportData(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main */}
      <div className="flex-1 p-6">
        <Navbar />

        {/* Greeting */}
        <div className="border rounded-lg shadow bg-white p-6 mb-8">
          <h2 className="text-2xl font-bold">Hello John Doe 👋</h2>
          <p className="text-gray-600">Have a nice day at work!</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left (charts) */}
          <div className="lg:col-span-8 space-y-6">
            <TimelineChart data={reportData?.timelineData || []} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Study Hours */}
              <div className="border p-4 rounded shadow bg-white">
                <h2 className="text-lg font-semibold mb-2">
                  Study Hours (Weekly)
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reportData?.studyData || []}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#693f26" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Break Hours */}
              <div className="border p-4 rounded shadow bg-white">
                <h2 className="text-lg font-semibold mb-2">
                  Break Hours (Types)
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={reportData?.breakData || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {(reportData?.breakData || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Overall */}
              <div className="border p-4 rounded shadow bg-white md:col-span-2">
                <h2 className="text-lg font-semibold mb-2">
                  Overall Study and Break Hours
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={reportData?.overallData || []}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="study" stroke="#5c4033" />
                    <Line type="monotone" dataKey="break" stroke="#9989aA" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Start-End */}
              <div className="border p-4 rounded shadow bg-white md:col-span-2">
                <h2 className="text-lg font-semibold mb-2">
                  Start to End Per Day
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reportData?.studyData || []}>
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 24]} tickFormatter={(t) => `${t}:00`} />
                    <Tooltip formatter={(v) => `${v}:00`} />
                    <Legend />
                    <Bar dataKey="start" fill="#5c4033" />
                    <Bar dataKey="end" fill="#C79baf" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right (calendar) */}
          <div className="lg:col-span-4 space-y-6">
            <MiniCalendar
              studyData={reportData?.calendarData || []}
              onDayClick={setSelectedDay}
            />
            {selectedDay && (
              <div className="p-4 border rounded bg-white shadow">
                <h3 className="font-semibold">Details for selected day</h3>
                <p className="text-sm text-gray-600">
                  You studied for {selectedDay} hours on this day.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
