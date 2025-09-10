"use client";

import { Bell, Settings, LogOut, BarChart3, Home, User, Calendar, PieChart, MessageSquare, Folder } from "lucide-react";

export default function ProDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Hey, Luke!</h1>
            <p className="text-sm text-gray-500">Welcome back, nice to see you again</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Bell size={20} />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Views by Categories */}
          <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Views by categories</h2>
            <div className="h-40 flex items-center justify-center text-gray-400">
              <BarChart3 size={40} />
              <span className="ml-2">[Chart Placeholder]</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Notifications</h2>
            <ul className="flex flex-col gap-3">
              <li className="p-3 rounded-xl bg-violet-50 text-sm flex justify-between">
                Track Activity Live <button className="text-xs text-violet-600">Settings</button>
              </li>
              <li className="p-3 rounded-xl bg-green-50 text-sm flex justify-between">
                2FA Security Layer <button className="text-xs text-green-600">Enable</button>
              </li>
              <li className="p-3 rounded-xl bg-pink-50 text-sm flex justify-between">
                Mentions Approval <button className="text-xs text-pink-600">Review</button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Growth</h2>
            <div className="h-28 flex items-center justify-center text-gray-400">
              <BarChart3 size={30} />
              <span className="ml-2">[Graph Placeholder]</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Analytics</h2>
            <div className="h-28 flex items-center justify-center text-gray-400">
              <BarChart3 size={30} />
              <span className="ml-2">[Analytics Chart]</span>
            </div>
          </div>

          {/* Savings */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Savings</h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="p-3 bg-violet-100 rounded-xl">$1,228.30 – House</li>
              <li className="p-3 bg-purple-200 rounded-xl">$7,311.20 – Office</li>
              <li className="p-3 bg-purple-300 rounded-xl">$18,004.78 – Health</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
