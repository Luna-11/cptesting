"use client";
import { useState } from "react";
import { FaUsers, FaClipboardList, FaCog, FaChartPie, FaBook, FaCalendarAlt, FaGraduationCap } from "react-icons/fa";

// Types
type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User" | "Tutor";
  studyHours: number;
  completedTasks: number;
  streak: number;
  courses: string[];
};

type Activity = {
  user: string;
  action: string;
  time: string;
};

type Course = {
  id: number;
  title: string;
  enrolledUsers: number;
  completionRate: number;
};

// Sample data
const users: User[] = [
  { id: 1, name: "John Doe", email: "johndoe@example.com", role: "Admin", studyHours: 45, completedTasks: 12, streak: 7, courses: ["Mathematics", "Physics"] },
  { id: 2, name: "Jane Smith", email: "janesmith@example.com", role: "User", studyHours: 32, completedTasks: 8, streak: 5, courses: ["Biology", "Chemistry"] },
  { id: 3, name: "Alice Johnson", email: "alicej@example.com", role: "Tutor", studyHours: 25, completedTasks: 5, streak: 3, courses: ["Literature", "History"] },
];

const courses: Course[] = [
  { id: 1, title: "Mathematics Fundamentals", enrolledUsers: 24, completionRate: 65 },
  { id: 2, title: "Advanced Physics", enrolledUsers: 18, completionRate: 52 },
];

const recentActivity: Activity[] = [
  { user: "Jane Smith", action: "completed 3 tasks in Biology", time: "1 hour ago" },
  { user: "John Doe", action: "achieved a 7-day study streak", time: "3 hours ago" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "courses" | "tasks" | "settings">("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  // Calculate dashboard metrics
  const totalUsers = users.length;
  const averageStudyHours = users.reduce((total, user) => total + user.studyHours, 0) / users.length;
  const totalCompletedTasks = users.reduce((total, user) => total + user.completedTasks, 0);
  const activeStreaks = users.filter(user => user.streak >= 3).length;
  const topPerformers = [...users].sort((a, b) => b.studyHours - a.studyHours).slice(0, 3);

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#f0eeee' }}>
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col" style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <img 
            src="/study-with-me-logo.png" 
            alt="Study With Me Logo"
            className="h-8 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span className="sr-only">Study With Me</span>
        </h2>
        
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            onMouseEnter={() => setHoveredItem(1)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "dashboard" 
                ? "bg-[#948585] text-white shadow-md" 
                : hoveredItem === 1 
                  ? "bg-[#3d312e] text-white shadow-lg" 
                  : "text-[#bba2a2] hover:bg-[#3d312e] hover:text-white hover:shadow-lg"
            }`}
          >
            <FaChartPie /> Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab("users")}
            onMouseEnter={() => setHoveredItem(2)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "users" 
                ? "bg-[#948585] text-white shadow-md" 
                : hoveredItem === 2 
                  ? "bg-[#3d312e] text-white shadow-lg" 
                  : "text-[#bba2a2] hover:bg-[#3d312e] hover:text-white hover:shadow-lg"
            }`}
          >
            <FaUsers /> Users
          </button>
          
          <button
            onClick={() => setActiveTab("courses")}
            onMouseEnter={() => setHoveredItem(3)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "courses" 
                ? "bg-[#948585] text-white shadow-md" 
                : hoveredItem === 3 
                  ? "bg-[#3d312e] text-white shadow-lg" 
                  : "text-[#bba2a2] hover:bg-[#3d312e] hover:text-white hover:shadow-lg"
            }`}
          >
            <FaGraduationCap /> Courses
          </button>
          
          <button
            onClick={() => setActiveTab("tasks")}
            onMouseEnter={() => setHoveredItem(4)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "tasks" 
                ? "bg-[#948585] text-white shadow-md" 
                : hoveredItem === 4 
                  ? "bg-[#3d312e] text-white shadow-lg" 
                  : "text-[#bba2a2] hover:bg-[#3d312e] hover:text-white hover:shadow-lg"
            }`}
          >
            <FaClipboardList /> Tasks
          </button>
          
          <button
            onClick={() => setActiveTab("settings")}
            onMouseEnter={() => setHoveredItem(5)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "settings" 
                ? "bg-[#948585] text-white shadow-md" 
                : hoveredItem === 5 
                  ? "bg-[#3d312e] text-white shadow-lg" 
                  : "text-[#bba2a2] hover:bg-[#3d312e] hover:text-white hover:shadow-lg"
            }`}
          >
            <FaCog /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Navigation */}
        <header className="p-4 flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: '#f0eeee', boxShadow: '0 2px 4px rgba(61,49,46,0.1)' }}>
          <h1 className="text-xl font-semibold" style={{ color: '#3d312e' }}>
            {activeTab === "dashboard" ? "Overview" : activeTab}
          </h1>
          <div className="flex items-center gap-4">
            <button 
              className="text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:opacity-90" 
              style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Users" 
                  value={totalUsers} 
                  icon={<FaUsers style={{ color: '#3d312e' }} />} 
                  trend="↑ 12% from last month" 
                />
                <StatCard 
                  title="Avg. Study Hours" 
                  value={averageStudyHours.toFixed(1)} 
                  unit="hours" 
                  icon={<FaCalendarAlt style={{ color: '#3d312e' }} />} 
                  trend="↑ 1.2h from last week" 
                />
                <StatCard 
                  title="Completed Tasks" 
                  value={totalCompletedTasks} 
                  icon={<FaClipboardList style={{ color: '#3d312e' }} />} 
                  trend="↑ 23 tasks this week" 
                />
                <StatCard 
                  title="Active Streaks" 
                  value={activeStreaks} 
                  icon={<FaFire style={{ color: '#3d312e' }} />} 
                  trend="3 new streaks today" 
                />
              </div>

              {/* Top Performers */}
              <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>Top Performers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topPerformers.map((user, index) => (
                    <UserCard key={user.id} user={user} rank={index + 1} />
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>Recent Activity</h2>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
              <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: '#bba2a2' }}>
                <h2 className="text-lg font-semibold" style={{ color: '#3d312e' }}>User Management</h2>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-4 py-2 rounded-lg w-64 transition-all duration-200 focus:shadow-md focus:outline-none"
                  style={{ border: '1px solid #bba2a2', backgroundColor: '#f0eeee' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: '#bba2a2' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0eeee' }}>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Study Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Streak</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#bba2a2' }}>
                    {filteredUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        className="transition-all duration-200 hover:bg-[#e0d8d8] hover:shadow-md"
                        style={{ backgroundColor: '#f0eeee' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#3d312e' }}>{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-medium transition-all duration-200 hover:shadow-md" style={{ backgroundColor: '#bba2a2', color: '#3d312e' }}>
                              {user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium" style={{ color: '#3d312e' }}>{user.name}</div>
                              <div className="text-sm" style={{ color: '#948585' }}>{user.courses.join(", ")}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#3d312e' }}>{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-200 ${
                            user.role === "Admin" ? "bg-[#bba2a2] text-[#3d312e] hover:shadow-md" :
                            user.role === "Tutor" ? "bg-[#948585] text-[#f0eeee] hover:shadow-md" :
                            "bg-[#f0eeee] text-[#3d312e] border border-[#948585] hover:shadow-md"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#3d312e' }}>{user.studyHours} hours</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#3d312e' }}>
                          <div className="flex items-center">
                            <span className="mr-2">{user.streak} days</span>
                            {user.streak >= 7 && (
                              <span className="h-2 w-2 rounded-full transition-all duration-200 hover:scale-125" style={{ backgroundColor: '#948585' }}></span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="mr-3 transition-all duration-200 hover:text-[#948585] hover:underline" 
                            style={{ color: '#3d312e' }}
                          >
                            Edit
                          </button>
                          <button 
                            className="transition-all duration-200 hover:text-[#3d312e] hover:underline" 
                            style={{ color: '#948585' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: '#3d312e' }}>Course Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: '#3d312e' }}>System Settings</h2>
              <div className="space-y-4">
                <SettingItem 
                  title="Notification Preferences" 
                  description="Configure how and when you receive notifications" 
                />
                <SettingItem 
                  title="Study Reminders" 
                  description="Set up automatic reminders for users" 
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Component for Stat Cards
function StatCard({ title, value, unit = "", icon, trend }: { title: string; value: string | number; unit?: string; icon: React.ReactNode; trend: string }) {
  return (
    <div 
      className="rounded-xl p-6 flex items-start justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: '#948585' }}>{title}</p>
        <p className="mt-1 text-2xl font-semibold" style={{ color: '#3d312e' }}>
          {value} {unit && <span className="text-sm font-normal" style={{ color: '#948585' }}>{unit}</span>}
        </p>
        <p className="mt-1 text-xs" style={{ color: '#948585' }}>{trend}</p>
      </div>
      <div className="p-3 rounded-lg transition-all duration-200 hover:shadow-md" style={{ backgroundColor: '#bba2a2', color: '#3d312e' }}>
        {icon}
      </div>
    </div>
  );
}

// Component for User Cards
function UserCard({ user, rank }: { user: User; rank: number }) {
  const rankColors = [
    '#3d312e', // First place
    '#948585', // Second place
    '#bba2a2'  // Third place
  ];
  
  return (
    <div 
      className="rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium transition-all duration-200 hover:shadow-md"
            style={{ backgroundColor: rankColors[rank - 1] }}
          >
            {rank}
          </div>
          <div>
            <h3 className="font-medium" style={{ color: '#3d312e' }}>{user.name}</h3>
            <p className="text-sm" style={{ color: '#948585' }}>{user.email}</p>
          </div>
        </div>
        <span 
          className="text-xs px-2 py-1 rounded-full transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: '#bba2a2', color: '#3d312e' }}
        >
          {user.studyHours} hours
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p style={{ color: '#948585' }}>Tasks</p>
          <p style={{ color: '#3d312e' }}>{user.completedTasks}</p>
        </div>
        <div>
          <p style={{ color: '#948585' }}>Streak</p>
          <p style={{ color: '#3d312e' }}>{user.streak} days</p>
        </div>
      </div>
    </div>
  );
}

// Component for Activity Items
function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div 
      className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
      style={{ backgroundColor: '#f0eeee' }}
    >
      <div 
        className="mt-1 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md"
        style={{ backgroundColor: '#bba2a2', color: '#3d312e' }}
      >
        <FaBook className="text-sm" />
      </div>
      <div>
        <p className="text-sm" style={{ color: '#3d312e' }}>
          <span className="font-medium">{activity.user}</span> {activity.action}
        </p>
        <p className="text-xs mt-1" style={{ color: '#948585' }}>{activity.time}</p>
      </div>
    </div>
  );
}

// Component for Course Cards
function CourseCard({ course }: { course: Course }) {
  return (
    <div 
      className="rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}
    >
      <div style={{ backgroundColor: '#3d312e', height: '2px' }}></div>
      <div className="p-5">
        <h3 className="font-medium text-lg mb-2" style={{ color: '#3d312e' }}>{course.title}</h3>
        <div className="flex justify-between text-sm mb-3" style={{ color: '#948585' }}>
          <span>{course.enrolledUsers} enrolled</span>
          <span>{course.completionRate}% completion</span>
        </div>
        <div className="w-full rounded-full h-2" style={{ backgroundColor: '#bba2a2' }}>
          <div 
            className="h-2 rounded-full transition-all duration-500" 
            style={{ width: `${course.completionRate}%`, backgroundColor: '#3d312e' }}
          ></div>
        </div>
        <div className="mt-4 flex gap-2">
          <button 
            className="text-sm px-3 py-1 rounded transition-all duration-200 hover:shadow-md hover:opacity-90"
            style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
          >
            Manage
          </button>
          <button 
            className="text-sm px-3 py-1 rounded transition-all duration-200 hover:shadow-md hover:opacity-90"
            style={{ border: '1px solid #948585', color: '#3d312e' }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

// Component for Setting Items
function SettingItem({ title, description }: { title: string; description: string }) {
  return (
    <div 
      className="pb-4 transition-all duration-200 hover:shadow-md hover:bg-[#f8f4f4] rounded-lg p-4"
      style={{ borderBottom: '1px solid #bba2a2' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium" style={{ color: '#3d312e' }}>{title}</h3>
          <p className="text-sm mt-1" style={{ color: '#948585' }}>{description}</p>
        </div>
        <button 
          className="text-sm px-3 py-1 rounded transition-all duration-200 hover:shadow-md hover:opacity-90"
          style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
        >
          Configure
        </button>
      </div>
    </div>
  );
}

// FaFire icon component
function FaFire(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" {...props}>
      <path d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z"></path>
    </svg>
  );
}