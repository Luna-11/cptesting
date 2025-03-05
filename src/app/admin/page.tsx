"use client";
import { useState } from "react";
import { FaUsers, FaClipboardList, FaCog, FaChartPie } from "react-icons/fa";

// Sample users with study hours and tasks
const users = [
  { id: 1, name: "John Doe", email: "johndoe@example.com", role: "Admin", studyHours: 45, completedTasks: 12 },
  { id: 2, name: "Jane Smith", email: "janesmith@example.com", role: "User", studyHours: 32, completedTasks: 8 },
  { id: 3, name: "Alice Johnson", email: "alicej@example.com", role: "User", studyHours: 25, completedTasks: 5 },
  { id: 4, name: "Bob Brown", email: "bobbrown@example.com", role: "Admin", studyHours: 40, completedTasks: 10 },
  { id: 5, name: "Charlie Davis", email: "charliedavis@example.com", role: "User", studyHours: 50, completedTasks: 15 },
  { id: 6, name: "Diana Harris", email: "dianaharris@example.com", role: "User", studyHours: 30, completedTasks: 6 },
  { id: 7, name: "Eve Clark", email: "eveclark@example.com", role: "Admin", studyHours: 38, completedTasks: 9 },
  { id: 8, name: "Frank Miller", email: "frankmiller@example.com", role: "User", studyHours: 29, completedTasks: 7 },
  { id: 9, name: "Grace Lee", email: "gracelee@example.com", role: "User", studyHours: 42, completedTasks: 11 },
  { id: 10, name: "Henry Walker", email: "henrywalker@example.com", role: "Admin", studyHours: 48, completedTasks: 13 },
];

// Sample Dashboard Data (Study App)
const dashboardData = {
  totalUsers: users.length,
  averageStudyHours: users.reduce((total, user) => total + user.studyHours, 0) / users.length,
  totalCompletedTasks: users.reduce((total, user) => total + user.completedTasks, 0),
  topPerformingUsers: users.sort((a, b) => b.studyHours - a.studyHours).slice(0, 3), // Top 3 users by study hours
  recentActivity: [
    { user: "Jane Smith", action: "completed 3 tasks", time: "1 hour ago" },
    { user: "John Doe", action: "studied for 2.5 hours", time: "3 hours ago" },
    { user: "Alice Johnson", action: "started a new course", time: "5 hours ago" },
  ],
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === "dashboard" ? "bg-gray-700" : ""
            }`}
          >
            <FaChartPie /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === "users" ? "bg-gray-700" : ""
            }`}
          >
            <FaUsers /> Manage Users
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === "tasks" ? "bg-gray-700" : ""
            }`}
          >
            <FaClipboardList /> Task Management
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              activeTab === "settings" ? "bg-gray-700" : ""
            }`}
          >
            <FaCog /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        {/* Top Navbar */}
        <header className="flex justify-between items-center bg-white p-4 shadow-md rounded-md">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </header>

        {/* Dynamic Content */}
        <section className="mt-6">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-lg font-semibold">Dashboard Overview</h2>
              <p className="mt-4">Analytics, stats, and reports related to study activity.</p>

              {/* Dashboard Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-md shadow-md p-4">
                  <h3 className="text-md font-medium">Total Users</h3>
                  <p>{dashboardData.totalUsers}</p>
                </div>
                <div className="bg-white rounded-md shadow-md p-4">
                  <h3 className="text-md font-medium">Avg. Study Hours</h3>
                  <p>{dashboardData.averageStudyHours.toFixed(1)} hours</p>
                </div>
                <div className="bg-white rounded-md shadow-md p-4">
                  <h3 className="text-md font-medium">Completed Tasks</h3>
                  <p>{dashboardData.totalCompletedTasks}</p>
                </div>
              </div>

              {/* Top Performing Users */}
              <div className="mt-6">
                <h3 className="text-md font-medium">Top Performing Users</h3>
                <div className="mt-2">
                  {dashboardData.topPerformingUsers.map((user, index) => (
                    <div key={index} className="bg-white rounded-md shadow-md p-4 mb-2">
                      <p>{user.name} - {user.studyHours} hours</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6">
                <h3 className="text-md font-medium">Recent Activity</h3>
                <div className="mt-2">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="bg-white rounded-md shadow-md p-4 mb-2">
                      <p>{activity.user} {activity.action} ({activity.time})</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
          {activeTab === "users" && (
            <div>
              <h2 className="text-lg font-semibold">User Management</h2>
              <table className="min-w-full table-auto mt-4 bg-white rounded-md shadow-md">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Study Hours</th>
                    <th className="px-4 py-2">Completed Tasks</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">{user.id}</td>
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2">{user.studyHours} hours</td>
                      <td className="px-4 py-2">{user.completedTasks} tasks</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button className="text-blue-500">Edit</button>
                        <button className="text-red-500">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "tasks" && (
            <div>
              <h2 className="text-lg font-semibold">Task Management</h2>
              <p>Track and manage tasks for users, including progress and deadlines.</p>

              {/* Task Overview */}
              <div className="mt-6">
                <h3 className="text-md font-medium">Total Tasks Assigned: </h3>
                <p>{users.reduce((total, user) => total + user.completedTasks, 0)} tasks</p>
              </div>
            </div>
          )}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-lg font-semibold">Settings</h2>
              <p>Change system preferences and configurations related to user activity tracking and reports.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}