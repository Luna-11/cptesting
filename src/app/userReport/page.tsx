"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

// Define types for your data
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

type DailyReportDataItem = {
  day: string;
  start: number;
  end: number;
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
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const getStudyHoursForDate = (date: number): number => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const dayData = studyData.find((d: StudyDataItem) => d.date === formattedDate);
    return dayData ? dayData.hours : 0;
  };

  const getColorForStudyHours = (hours: number): string => {
    if (hours === 0) return 'bg-white border border-gray-200';
    if (hours < 3) return 'bg-[#f4e9e4]';      // Very light brown (0+)
    if (hours < 5) return 'bg-[#d8b4a0]';      // Light brown (3+)
    if (hours < 8) return 'bg-[#a87453]';      // Medium brown (5+)
    return 'bg-[#5c4033] text-white';          // Dark brown (8+)
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
        <h3 className="font-semibold">{months[currentMonth]} {currentYear}</h3>
        <button 
          onClick={() => changeMonth(1)}
          className="p-1 rounded hover:bg-gray-100"
        >
          &gt;
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>

      {/* Simplified Legend with Blocks */}
      <div className="mt-4 flex flex-col items-center">
        <div className="text-xs text-gray-600 mb-1">Less</div>
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded bg-[#f4e9e4] flex items-center justify-center text-xs">0+</div>
          <div className="w-6 h-6 rounded bg-[#d8b4a0] flex items-center justify-center text-xs">3+</div>
          <div className="w-6 h-6 rounded bg-[#a87453] flex items-center justify-center text-xs">5+</div>
          <div className="w-6 h-6 rounded bg-[#5c4033] flex items-center justify-center text-xs text-white">8+</div>
        </div>
        <div className="text-xs text-gray-600 mt-1">More</div>
      </div>
    </div>
  );
};

const TimelineChart = ({ data }: { data: StudySession[] }) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)}s`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border p-4 rounded shadow-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">Study Session Timeline</h2>
      <div className="space-y-4">
        {data.map((session) => {
          const startTime = typeof session.startTime === 'string' 
            ? new Date(session.startTime) 
            : session.startTime;
          const endTime = typeof session.endTime === 'string' 
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

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      {/* Sidebar content */}
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Navbar content */}
    </nav>
  );
};

export default function UserReportPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [reportData, setReportData] = useState<{
    studyData: StudyDataItem[];
    breakData: BreakDataItem[];
    overallData: OverallDataItem[];
    timelineData: StudySession[];
    calendarData: StudyDataItem[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        const data = await response.json();
        setReportData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const getStudyHoursForDate = (day: number): number => {
    if (!reportData?.calendarData) return 0;
    const formattedDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = reportData.calendarData.find((d: StudyDataItem) => d.date === formattedDate);
    return dayData ? dayData.hours : 0;
  };

  // Fallback data if API fails or is loading
  const studyData = reportData?.studyData || [
    { day: "Monday", hours: 4, date: "2023-05-01" },
    { day: "Tuesday", hours: 3, date: "2023-05-02" },
    { day: "Wednesday", hours: 5, date: "2023-05-03" },
    { day: "Thursday", hours: 2, date: "2023-05-04" },
    { day: "Friday", hours: 6, date: "2023-05-05" },
    { day: "Saturday", hours: 1, date: "2023-05-06" },
    { day: "Sunday", hours: 3, date: "2023-05-07" },
  ];

  const breakData = reportData?.breakData || [
    { name: "Dinner Break", value: 2 },
    { name: "Short Break", value: 1 },
    { name: "Exercise Break", value: 1 },
    { name: "Coffee Break", value: 0.5 },
  ];

  const overallData = reportData?.overallData || [
    { day: "Monday", study: 4, break: 2.5 },
    { day: "Tuesday", study: 3, break: 1.5 },
    { day: "Wednesday", study: 5, break: 1 },
    { day: "Thursday", study: 2, break: 1 },
    { day: "Friday", study: 6, break: 2 },
    { day: "Saturday", study: 1, break: 0.5 },
    { day: "Sunday", study: 3, break: 1 },
  ];

  const timelineData = reportData?.timelineData || [
    {
      id: "1",
      startTime: new Date(2025, 6, 10, 5, 0),
      endTime: new Date(2025, 6, 10, 9, 2),
      duration: 242,
      taskName: "Mathematics",
      category: "Study"
    },
    {
      id: "2",
      startTime: new Date(2025, 6, 10, 9, 2),
      endTime: new Date(2025, 6, 10, 9, 2),
      duration: 0.13,
      taskName: "Break",
      category: "Work"
    },
    {
      id: "3",
      startTime: new Date(2025, 6, 10, 9, 2),
      endTime: new Date(2025, 6, 10, 9, 2),
      duration: 0.4,
      taskName: "Quick Review",
      category: "Study"
    }
  ];

  const dailyReportData = reportData?.studyData.map(item => ({
    day: item.day,
    start: item.start ? parseInt(item.start.split(':')[0]) : 0,
    end: item.end ? parseInt(item.end.split(':')[0]) : 0
  })) || [
    { day: "Monday", start: 8, end: 12 },
    { day: "Tuesday", start: 9, end: 12 },
    { day: "Wednesday", start: 10, end: 15 },
    { day: "Thursday", start: 8, end: 10 },
    { day: "Friday", start: 11, end: 17 },
    { day: "Saturday", start: 7, end: 8 },
    { day: "Sunday", start: 9, end: 12 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex-1 p-4">
        <Navbar />
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area with charts */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-center mb-4">User Report</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Timeline Chart - spans full width */}
              <div className="md:col-span-2">
                <TimelineChart data={timelineData} />
              </div>

              {/* Study Hours Chart */}
              <div className="border p-4 rounded shadow-lg bg-white">
                <h2 className="text-xl font-semibold mb-2">Study Hours (Weekly)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studyData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#693f26" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Break Hours Chart */}
              <div className="border p-4 rounded shadow-lg bg-white">
                <h2 className="text-xl font-semibold mb-2">Break Hours (Types)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={breakData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      label
                    >
                      {breakData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>   
                </ResponsiveContainer>
              </div>

              {/* Overall Study and Break Hours Chart */}
              <div className="border p-4 rounded shadow-lg bg-white">
                <h2 className="text-xl font-semibold mb-2">Overall Study and Break Hours</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={overallData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="study" stroke="#5c4033" />
                    <Line type="monotone" dataKey="break" stroke="#9989aA" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Start to End Per Day Bar Chart */}
              <div className="border p-4 rounded shadow-lg bg-white">
                <h2 className="text-xl font-semibold mb-2">Start to End Per Day</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyReportData}>
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 24]} tickFormatter={(tick) => `${tick}:00`} />
                    <Tooltip formatter={(value) => `${value}:00`} />
                    <Legend />
                    <Bar dataKey="start" fill="#5c4033" />
                    <Bar dataKey="end" fill="#C79baf" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sticky Calendar on the right */}
          <div className="lg:w-80 lg:sticky lg:top-4 lg:self-start">
            <MiniCalendar 
              studyData={reportData?.calendarData || []} 
              onDayClick={handleDayClick} 
            />
            {selectedDay && (
              <div className="mt-4 p-4 border rounded bg-white shadow">
                <h3 className="font-semibold">Details for selected day</h3>
                <p className="text-sm text-gray-600">
                  {selectedDay ? `You studied for ${getStudyHoursForDate(selectedDay)} hours on this day.` : "No day selected."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}