"use client";

import { Search, Mail, Bell, ChevronDown, Calendar, Clock, MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasLogin: boolean;
}

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  useEffect(() => {
    generateCalendarDays()
  }, [currentDate])

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    // Days in month
    const daysInMonth = lastDay.getDate()
    // Day of week for first day
    const firstDayOfWeek = firstDay.getDay()
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    
    const daysArray: CalendarDay[] = []
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      daysArray.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        hasLogin: false
      })
    }
    
    // Current month days
    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({
        day: i,
        isCurrentMonth: true,
        isToday: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year,
        hasLogin: Math.random() > 0.7 // Randomly assign login days for demo
      })
    }
    
    // Next month days (to fill the grid)
    const totalCells = 42 // 6 rows x 7 columns
    const nextMonthDays = totalCells - daysArray.length
    for (let i = 1; i <= nextMonthDays; i++) {
      daysArray.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        hasLogin: false
      })
    }
    
    setCalendarDays(daysArray)
  }

  return (
    <div className="min-h-screen bg-[#f0eeee]">
      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Welcome Section */}
          <div className="col-span-8">
            <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-[#3d312e]">Hello Leslie</h1>
                    <p className="text-[#3d312e] max-w-md">
                      I have assigned you a new Task. I want you to finish it by tomorrow evening.
                    </p>
                    <button className="mt-4 bg-[#3d312e] hover:bg-[#2a211f] text-white px-4 py-2 rounded-md text-sm font-medium">
                      Review it
                    </button>
                  </div>
                  <div className="flex-shrink-0">
                    <img
                      src="/c3.png"
                      alt="Person working at desk"
                      className="h-32 w-40 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {/* My Progress */}
              <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#3d312e]">My Progress</h3>
                    <MoreHorizontal className="h-4 w-4 text-[#3d312e]" />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-20 w-20 bg-[#f0eeee] rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#3d312e]">85%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments */}
              <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#3d312e]">Assignments</h3>
                    <MoreHorizontal className="h-4 w-4 text-[#3d312e]" />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-20 w-20 bg-[#f0eeee] rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#3d312e]">12</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Invoices */}
              <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#3d312e]">Recent Invoices</h3>
                    <MoreHorizontal className="h-4 w-4 text-[#3d312e]" />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-20 w-20 bg-[#f0eeee] rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#3d312e]">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Performance and Attendance */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Performance */}
              <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
                <div className="p-6 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#3d312e]">Performance</h3>
                    <MoreHorizontal className="h-4 w-4 text-[#3d312e]" />
                  </div>
                </div>
                <div className="p-6 pt-2">
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#d1c7c7"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3d312e"
                          strokeWidth="2"
                          strokeDasharray="68, 100"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#3d312e]">68%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
                <div className="p-6 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#3d312e]">Attendance</h3>
                    <MoreHorizontal className="h-4 w-4 text-[#3d312e]" />
                  </div>
                </div>
                <div className="p-6 pt-2">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-[#3d312e]">
                      <div className="w-3 h-3 bg-[#3d312e] rounded-full"></div>
                      <span>Present</span>
                      <div className="w-3 h-3 bg-[#bba2a2] rounded-full ml-4"></div>
                      <span>Absent</span>
                      <div className="w-3 h-3 bg-[#d1c7c7] rounded-full ml-4"></div>
                      <span>Late</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between space-x-1 h-24">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                      <div key={day} className="flex flex-col items-center space-y-1">
                        <div className="flex flex-col space-y-1">
                          <div className="w-6 bg-[#3d312e] rounded-sm" style={{ height: `${20 + index * 8}px` }}></div>
                          <div className="w-6 bg-[#bba2a2] rounded-sm" style={{ height: `${15 + index * 6}px` }}></div>
                          <div className="w-6 bg-[#d1c7c7] rounded-sm" style={{ height: `${10 + index * 4}px` }}></div>
                        </div>
                        <span className="text-xs text-[#3d312e]">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Calendar Component */}
            <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
              <div className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#3d312e]">Study Calendar</h3>
                  <span className="text-xs bg-[#3d312e] text-[#f0eeee] px-2 py-1 rounded-full">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="p-6 pt-2">
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
                      className={`p-1 rounded flex items-center justify-center h-8 text-sm relative ${
                        day.isToday 
                          ? "bg-[#3d312e] text-[#f0eeee]" 
                          : day.isCurrentMonth 
                            ? "text-[#3d312e]" 
                            : "text-[#d1c7c7]"
                      }`}
                    >
                      <span>{day.day}</span>
                      {day.hasLogin && (
                        <span className="absolute -top-1 -right-1 text-xs text-yellow-500">●</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time & Events */}
            <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold text-[#3d312e]">Time & Events</h3>
              </div>
              <div className="p-6 pt-2 space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-[#d1c7c7] rounded-lg">
                  <Calendar className="h-5 w-5 text-[#3d312e]" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#3d312e]">09 July</div>
                    <div className="text-xs text-[#3d312e]">10:00pm - 1:30pm</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-[#d1c7c7] rounded-lg">
                  <Clock className="h-5 w-5 text-[#3d312e]" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#3d312e]">10 July</div>
                    <div className="text-xs text-[#3d312e]">10:00pm - 12:30pm</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-[#d1c7c7] rounded-lg">
                  <Calendar className="h-5 w-5 text-[#3d312e]" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#3d312e]">09 July</div>
                    <div className="text-xs text-[#3d312e]">2:00pm - 4:00pm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Tutor */}
            <div className="bg-white border border-[#d1c7c7] rounded-lg shadow-sm">
              <div className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#3d312e]">Your Tutor</h3>
                  <MoreHorizontal className="h-4 w-4 text-[#3d312e]" />
                </div>
              </div>
              <div className="p-6 pt-2 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-[#3d312e] rounded-full flex items-center justify-center text-white">
                    JW
                  </div>
                  <div>
                    <div className="font-medium text-sm text-[#3d312e]">Jenny Wilson</div>
                    <div className="text-xs text-[#3d312e]">Math Tutor</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-[#3d312e] rounded-full flex items-center justify-center text-white">
                    SR
                  </div>
                  <div>
                    <div className="font-medium text-sm text-[#3d312e]">Savannah Richards</div>
                    <div className="text-xs text-[#3d312e]">Science Tutor</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-[#3d312e] rounded-full flex items-center justify-center text-white">
                    BS
                  </div>
                  <div>
                    <div className="font-medium text-sm text-[#3d312e]">Brooklyn Simmons</div>
                    <div className="text-xs text-[#3d312e]">English Tutor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}