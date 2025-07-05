"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

// Define types for your data
type StudyDataItem = {
  day: string;
  hours: number;
  date: string;
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

type MiniCalendarProps = {
  studyData: StudyDataItem[];
  onDayClick: (day: number) => void;
};

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

// Sample data for study and break hours
const studyData: StudyDataItem[] = [
  { day: "Monday", hours: 4, date: "2023-05-01" },
  { day: "Tuesday", hours: 3, date: "2023-05-02" },
  { day: "Wednesday", hours: 5, date: "2023-05-03" },
  { day: "Thursday", hours: 2, date: "2023-05-04" },
  { day: "Friday", hours: 6, date: "2023-05-05" },
  { day: "Saturday", hours: 1, date: "2023-05-06" },
  { day: "Sunday", hours: 3, date: "2023-05-07" },
];

const breakData: BreakDataItem[] = [
  { name: "Dinner Break", value: 2 },
  { name: "Short Break", value: 1 },
  { name: "Exercise Break", value: 1 },
  { name: "Coffee Break", value: 0.5 },
];

const overallData: OverallDataItem[] = [
  { day: "Monday", study: 4, break: 2.5 },
  { day: "Tuesday", study: 3, break: 1.5 },
  { day: "Wednesday", study: 5, break: 1 },
  { day: "Thursday", study: 2, break: 1 },
  { day: "Friday", study: 6, break: 2 },
  { day: "Saturday", study: 1, break: 0.5 },
  { day: "Sunday", study: 3, break: 1 },
];

const dailyReportData: DailyReportDataItem[] = [
  { day: "Monday", start: 8, end: 12 },
  { day: "Tuesday", start: 9, end: 12 },
  { day: "Wednesday", start: 10, end: 15 },
  { day: "Thursday", start: 8, end: 10 },
  { day: "Friday", start: 11, end: 17 },
  { day: "Saturday", start: 7, end: 8 },
  { day: "Sunday", start: 9, end: 12 },
];

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

  const renderDays = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const firstDay = firstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const studyHours = getStudyHoursForDate(day);
      const hasStudyHours = studyHours > 0;
      
      days.push(
        <div 
          key={`day-${day}`}
          onClick={() => onDayClick(day)}
          className={`w-8 h-8 flex flex-col items-center justify-center rounded-full cursor-pointer text-sm
            ${hasStudyHours ? 'bg-amber-100' : ''}
            hover:bg-amber-50 transition-colors`}
        >
          <span>{day}</span>
          {hasStudyHours && (
            <span className="text-xs font-medium text-amber-800">{studyHours}h</span>
          )}
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
    <div className="border p-4 rounded shadow-lg bg-white">
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
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
      
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-100 mr-1"></div>
          <span className="text-xs">Study day</span>
        </div>
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
  
  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const getStudyHoursForDate = (day: number): number => {
    const formattedDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = studyData.find((d: StudyDataItem) => d.date === formattedDate);
    return dayData ? dayData.hours : 0;
  };

  return (
    <div className="flex">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex-1 p-4">
        <Navbar />
        <h1 className="text-3xl font-bold text-center mb-4">User Report</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Mini Calendar */}
          <div className="md:col-span-1 lg:col-span-1">
            <MiniCalendar studyData={studyData} onDayClick={handleDayClick} />
            {selectedDay && (
              <div className="mt-4 p-4 border rounded bg-white shadow">
                <h3 className="font-semibold">Details for selected day</h3>
                <p className="text-sm text-gray-600">
                  {selectedDay ? `You studied for ${getStudyHoursForDate(selectedDay)} hours on this day.` : "No day selected."}
                </p>
              </div>
            )}
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
                <Pie data={breakData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
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
    </div>
  );
}