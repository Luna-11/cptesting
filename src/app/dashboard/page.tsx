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
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [hasSessionData, setHasSessionData] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Function to process session data for the chart
  const processSessionDataForChart = (sessions: any[]): ChartData[] => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize data structure for all months
    const monthlyData: { [key: string]: { study: number; break: number } } = {};
    
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = { study: 0, break: 0 };
    }

    // Process each session
    sessions.forEach(session => {
      if (session.start_time || session.startTime) {
        const startTime = session.start_time || session.startTime;
        const date = new Date(startTime);
        const month = date.getMonth(); // 0-11
        
        // Convert duration from seconds to minutes
        const durationMinutes = Math.floor((session.duration || 0) / 60);
        
        const sessionType = session.type || (session.sessionType || 'study');
        
        if (sessionType === 'study' || sessionType === 'Study') {
          monthlyData[month].study += durationMinutes;
        } else if (sessionType === 'break' || sessionType === 'Break') {
          monthlyData[month].break += durationMinutes;
        }
      }
    });

    // Check if there's any actual data (not just zeros)
    const hasData = Object.values(monthlyData).some(month => month.study > 0 || month.break > 0);
    setHasSessionData(hasData);

    // Convert to the format needed for the chart
    return monthNames.map((monthName, index) => ({
      month: monthName,
      study: monthlyData[index].study,
      break: monthlyData[index].break
    }));
  };

  useEffect(() => {
    // Fetch user data from the API
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUserData(userData.user || userData);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Helper to get userId from cookies
    const getUserIdFromCookies = () => {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('userId='))
        ?.split('=')[1];

      return cookieValue ? parseInt(cookieValue) : null;
    };

    const userIdFromCookie = getUserIdFromCookies();
    if (userIdFromCookie) setUserId(userIdFromCookie);

    // Fetch session data and process it for the chart
    const fetchSessionData = async () => {
      try {
        console.log("Fetching study sessions...");
        const response = await fetch('/api/studysessions?group_by_day=false', {
          credentials: 'include',
        });
        
        const result = await response.json();
        
        let sessions = [];
        
        // Handle different possible response structures
        if (result.success && result.data) {
          sessions = result.data;
        } else if (Array.isArray(result)) {
          sessions = result;
        } else if (result.sessions) {
          sessions = result.sessions;
        } else if (result.studySessions) {
          sessions = result.studySessions;
        } else {
          // Try to extract sessions from any other structure
          sessions = Object.values(result).find((value: any) => Array.isArray(value)) || [];
        }
        
        
        if (sessions.length > 0) {
          // Process the session data for the chart
          const processedData = processSessionDataForChart(sessions);
          console.log('Processed chart data:', processedData);
          setChartData(processedData);
        } else {
          // Fallback to mock data if no sessions
          console.log('No session data found, using mock data');
          setChartData(mockChartData);
          setHasSessionData(false);
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        setChartData(mockChartData);
        setHasSessionData(false);
        setIsChartLoading(false);
      } finally {
        setIsChartLoading(false);
      }
    };

    const recordLoginAndGetStreak = async () => {
      try {
        setIsLoading(true);

        // Fetch user data first
        await fetchUserData();

        // Fetch session data for chart
        await fetchSessionData();

        // POST to record login
        const loginResponse = await fetch('/api/streak', {
          method: 'POST',
          credentials: 'include',
        });

        if (loginResponse.status === 401) {
          alert('Please log in to view your streak!');
          window.location.href = '/login';
          return;
        }

        const loginData = await loginResponse.json();
        console.log('POST streak response:', loginData);

        if (loginData.success) {
          setCurrentStreak(loginData.currentStreak);

          const historyResponse = await fetch('/api/streak', {
            credentials: 'include',
          });

          if (historyResponse.status === 401) {
            alert('Please log in to view your streak!');
            window.location.href = '/login';
            return;
          }

          const historyData = await historyResponse.json();
          console.log('GET streak response:', historyData);

          if (historyData.success) {
            setLoginStreaks(historyData.loginHistory);
          } else {
            console.error('Failed to fetch login history:', historyData.message);
          }
        } else {
          const historyResponse = await fetch('/api/streak', {
            credentials: 'include',
          });
          
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            if (historyData.success) {
              setLoginStreaks(historyData.loginHistory);
              setCurrentStreak(historyData.currentStreak);
            }
          }
        }
      } catch (error) {
        console.error('Error with streak API:', error);
      } finally {
        setIsLoading(false);
      }
    };

    recordLoginAndGetStreak();
  }, []);

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = firstDay.getDay(); 
    const daysInMonth = lastDay.getDate();
    
    const days: CalendarDay[] = [];

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
    <div className="flex flex-col min-h-screen bg-[#f0eeee] p-2 md:p-4">
      {/* Info Banner with Subscription Alert */}
      <div className="bg-[#3d312e] text-[#f0eeee] rounded-2xl p-4 md:p-6 mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-center">
        <div className="max-w-full md:max-w-[40%] mb-4 md:mb-0">
          <h2 className="text-xl font-semibold">
            Hello {userData?.name || userData?.username || 'there'}!
          </h2>
          <p className="text-sm md:text-lg mt-1">
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
        
        {/* Centered Cat Image */}
        <div className="w-24 h-24 md:w-36 md:h-36 shrink-0 order-2 md:order-1 mx-auto md:mx-0">
          <Image
            src="/cat1.png"
            alt="Cat"
            width={isMobile ? 96 : 144}
            height={isMobile ? 96 : 144}
            className="rounded-xl object-contain"
          />
        </div>
        
        <div className="bg-[#f5e8c7] text-[#3d312e] rounded-2xl p-3 md:p-4 shadow-lg flex items-center justify-center w-full md:w-48 h-32 md:h-48 order-1 md:order-2">
          <div className="text-center">
            <p className="text-xs md:text-sm">For better features, buy our pro plan now</p>
            <button className="mt-2 bg-yellow-500 text-white px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base" onClick={() => window.location.href = '/purchases'}>Upgrade to Pro</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 flex-1">
        {/* Line Chart - Fixed height and reduced padding */}
        <div className="bg-white rounded-2xl p-3 md:p-4 pb-2 shadow-md lg:col-span-2 flex flex-col h-[320px] md:h-[373px]">
          <h3 className="text-lg font-semibold mb-2">
            Study & Break Sessions
          </h3>
          {isChartLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          ) : !hasSessionData ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-gray-600 font-medium mb-2 text-sm md:text-base">
                Let's study together to record the progress!
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                Start a study session to see your progress visualized here
              </p>
              <button 
                className="mt-4 bg-[#3d312e] text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-[#2a211e] transition-colors text-sm md:text-base"
                onClick={() => window.location.href = '/studysession'}
              >
                Start Studying
              </button>
            </div>
          ) : (
            <div className="w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="month" stroke="#3d312e" fontSize={isMobile ? 10 : 12} />
                  <YAxis stroke="#3d312e" fontSize={isMobile ? 10 : 12} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} min`, 'Duration']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="study"
                    stroke="#3d312e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    name="Study Time"
                  />
                  <Line
                    type="monotone"
                    dataKey="break"
                    stroke="#bba2a2"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    name="Break Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Sidebar - Fixed height to match chart */}
        <div className="flex flex-col gap-2 md:gap-2 h-auto md:h-[360px]">
          {/* Calendar */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-md flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm md:text-md font-semibold">Calendar</h3>
              <span className="text-xs bg-[#3d312e] text-[#f0eeee] px-2 py-1 rounded-full">
                {isMobile 
                  ? currentDate.toLocaleString('default', { month: 'short', year: '2-digit' })
                  : currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                }
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="font-semibold text-[#3d312e] py-1">
                  {isMobile ? d.charAt(0) : d.slice(0, 2)}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`p-1 rounded relative flex items-center justify-center ${isMobile ? 'h-5 text-xs' : 'h-6' } ${
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

          {/* Image/Text/Button Block - Replaces Weather Widget */}
          <div className="bg-white rounded-2xl p-3 md:p-3 shadow-md h-auto md:h-[140px] flex items-center mt-1 md:mt-0">
            <div className="w-12 h-12 md:w-14 md:h-14 mr-3 md:mr-3 flex-shrink-0">
              <Image
                src="/cat6.png"
                alt="Are you ready to study?"
                width={isMobile ? 48 : 56}
                height={isMobile ? 48 : 56}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm md:text-md font-semibold mb-1">Study Tips</h3>
              <p className="text-xs text-gray-600 mb-2">
                Let's study at study session and make notes!
              </p>
              <button className="bg-[#3d312e] text-white text-xs px-2 py-1 md:px-3 md:py-1 rounded-md hover:bg-[#2a211e] transition-colors" onClick={() => window.location.href = '/studysession'}>
                Start Studying
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}