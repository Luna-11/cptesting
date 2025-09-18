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
  CartesianGrid,
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
  startTime: string;
  endTime: string;
  duration: number;
  taskName: string;
  category: string;
  notes?: string;
};

type CalendarDataItem = {
  date: string;
  hours: number;
};

type MiniCalendarProps = {
  studyData: CalendarDataItem[];
  onDayClick: (date: string, hours: number) => void;
};

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

const COLORS = ["#DEB69C", "#722f37", "#C08baf", "#61463B"];

// Helper function to safely parse numeric values
const safeParseFloat = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to validate chart data
const validateChartData = (data: any[]) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => ({
    ...item,
    hours: safeParseFloat(item.hours, 0),
    value: safeParseFloat(item.value, 0),
    study: safeParseFloat(item.study, 0),
    break: safeParseFloat(item.break, 0),
    duration: safeParseFloat(item.duration, 0),
  }));
};

// Format hours to readable time (hours and minutes)
const formatHoursToTime = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  if (hrs === 0 && mins === 0) return "0m";
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

// Custom tooltip formatter
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {formatHoursToTime(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom tick formatter for YAxis
const formatYAxisTick = (value: number): string => {
  return formatHoursToTime(value);
};

// Custom label formatter for pie chart
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
}: any) => {
  if (percent === 0) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {formatHoursToTime(value)}
    </text>
  );
};

// MiniCalendar Component
const MiniCalendar = ({ studyData, onDayClick }: MiniCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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
      (d: CalendarDataItem) => d.date === formattedDate
    );
    return dayData ? safeParseFloat(dayData.hours, 0) : 0;
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
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => onDayClick(dateString, studyHours)}
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

      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>

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

// TimelineChart Component
const TimelineChart = ({ data }: { data: StudySession[] }) => {
  const formatDuration = (minutes: number) => {
    const safeMinutes = safeParseFloat(minutes, 0);
    if (safeMinutes < 1) return `${Math.round(safeMinutes * 60)}s`;
    const hours = Math.floor(safeMinutes / 60);
    const mins = Math.round(safeMinutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "00:00";
    }
  };

  const validatedData = validateChartData(data);

  return (
    <div className="border p-4 rounded shadow-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">Today's Study Sessions</h2>
      <div className="space-y-4">
        {validatedData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No study sessions today</p>
        ) : (
          validatedData.map((session) => (
            <div key={session.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{session.taskName || "Unknown Task"}</h3>
                  <p className="text-sm text-gray-500">{session.category || "Unknown"}</p>
                </div>
                <span className="text-sm font-medium bg-amber-100 px-2 py-1 rounded">
                  {formatDuration(session.duration)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {formatTime(session.startTime)} ~ {formatTime(session.endTime)}
              </div>
              {session.notes && (
                <div className="mt-1 text-sm text-gray-500">
                  Notes: {session.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => (
  <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
    {/* Sidebar content */}
  </div>
);

// Navbar Component
const Navbar = () => <nav className="navbar">{/* Navbar content */}</nav>;

// Main Component
export default function UserReportPage() {
  const [selectedDate, setSelectedDate] = useState<{date: string; hours: number} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [reportData, setReportData] = useState<{
    studyData: StudyDataItem[];
    breakData: BreakDataItem[];
    overallData: OverallDataItem[];
    timelineData: StudySession[];
    calendarData: CalendarDataItem[];
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

  const handleDayClick = (date: string, hours: number) => {
    setSelectedDate({ date, hours });
  };

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

  const validatedStudyData = validateChartData(reportData?.studyData || []);
  const validatedBreakData = validateChartData(reportData?.breakData || []);
  const validatedOverallData = validateChartData(reportData?.overallData || []);

  return (
    <div className="flex">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="flex-1 p-6">
        <Navbar />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <TimelineChart data={reportData?.timelineData || []} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Study Hours Chart */}
              <div className="border p-4 rounded shadow bg-white">
                <h2 className="text-lg font-semibold mb-4">Study Hours (Weekly)</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={validatedStudyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={formatYAxisTick} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="hours" 
                      fill="#693f26" 
                      name="Study Time"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Break Hours Chart */}
              <div className="border p-4 rounded shadow bg-white">
                <h2 className="text-lg font-semibold mb-4">Break Time (Types)</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={validatedBreakData.filter(item => item.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {validatedBreakData.filter(item => item.value > 0).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatHoursToTime(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                {validatedBreakData.filter(item => item.value > 0).length === 0 && (
                  <p className="text-center text-gray-500 mt-4">No break data available</p>
                )}
              </div>

              {/* Overall Study and Break Hours */}
              <div className="border p-4 rounded shadow bg-white md:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Study vs Break Time</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={validatedOverallData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={formatYAxisTick} />
                    <Tooltip formatter={(value) => formatHoursToTime(Number(value))} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="study" 
                      stroke="#5c4033" 
                      name="Study Time" 
                      strokeWidth={2}
                      dot={{ fill: '#5c4033', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="break" 
                      stroke="#9989aA" 
                      name="Break Time" 
                      strokeWidth={2}
                      dot={{ fill: '#9989aA', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Daily Study Hours */}
              <div className="border p-4 rounded shadow bg-white md:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Daily Study Time</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={validatedStudyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={formatYAxisTick} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="hours" 
                      fill="#5c4033" 
                      name="Study Time"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right sidebar with calendar */}
          <div className="lg:col-span-4 space-y-6">
            <MiniCalendar
              studyData={reportData?.calendarData || []}
              onDayClick={handleDayClick}
            />
            {selectedDate && (
              <div className="p-4 border rounded bg-white shadow">
                <h3 className="font-semibold mb-2">Details for {selectedDate.date}</h3>
                <p className="text-sm text-gray-600">
                  You studied for {formatHoursToTime(selectedDate.hours)} on this day.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}