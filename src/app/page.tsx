"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);

  const handleDateClick = (info) => {
    const title = prompt("Enter event title:");
    if (title) {
      // Use the functional update form to ensure the latest state
      setEvents((prevEvents) => [...prevEvents, { title, start: info.dateStr }]);
    }
  };

  const handleEventClick = (info) => {
    if (confirm("Do you want to delete this event?")) {
      // Use the functional update form to filter out the event
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.title !== info.event.title)
      );
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white w-64 p-4 fixed h-full transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mb-4"
        >
          <X size={24} />
        </button>
        <ul>
          <li className="mb-2">Dashboard</li>
          <li className="mb-2">Calendar</li>
          <li className="mb-2">Settings</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-center">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white py-4 text-center text-xl font-bold relative w-full">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
          >
            <Menu size={24} />
          </button>
          Calendar
        </nav>

        {/* Calendar Section */}
        <div className="p-4 flex-1 w-2/3">
        <div> this is me changing</div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
