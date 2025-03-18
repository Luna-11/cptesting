"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";

// Sample data for study and break hours
const studyData = [
  { day: "Monday", hours: 4 },
  { day: "Tuesday", hours: 3 },
  { day: "Wednesday", hours: 5 },
  { day: "Thursday", hours: 2 },
  { day: "Friday", hours: 6 },
  { day: "Saturday", hours: 1 },
  { day: "Sunday", hours: 3 },
];

const breakData = [
  { name: "Dinner Break", value: 2 },
  { name: "Short Break", value: 1 },
  { name: "Exercise Break", value: 1 },
  { name: "Coffee Break", value: 0.5 },
];

const overallData = [
  { day: "Monday", study: 4, break: 2.5 },
  { day: "Tuesday", study: 3, break: 1.5 },
  { day: "Wednesday", study: 5, break: 1 },
  { day: "Thursday", study: 2, break: 1 },
  { day: "Friday", study: 6, break: 2 },
  { day: "Saturday", study: 1, break: 0.5 },
  { day: "Sunday", study: 3, break: 1 },
];

const dailyReportData = [
  { day: "Monday", start: 8, end: 12 },
  { day: "Tuesday", start: 9, end: 12 },
  { day: "Wednesday", start: 10, end: 15 },
  { day: "Thursday", start: 8, end: 10 },
  { day: "Friday", start: 11, end: 17 },
  { day: "Saturday", start: 7, end: 8 },
  { day: "Sunday", start: 9, end: 12 },
];

const COLORS = ["#DEB69C", "#722f37", "#C08baf", "#61463B"];

export default function UserReportPage() {
  return (
    <div className="flex">

      <div className="flex-1 p-4">

        <h1 className="text-3xl font-bold text-center mb-4">User Report</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
