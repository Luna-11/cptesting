"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

// Define the type for events
type Event = {
  title: string;
  start: string;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);

  const handleDateClick = (info: any) => {
    const title = prompt("Enter event title:");
    if (title && title.trim() !== "") {
      setEvents((prevEvents) => [
        ...prevEvents,
        { title: title.trim(), start: info.dateStr },
      ]);
    }
  };

  const handleEventClick = (info: any) => {
    if (info && info.event && info.event.title) {
      if (confirm("Do you want to delete this event?")) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.title !== info.event.title)
        );
      }
    }
  };

  return (
    <div className="p-4 flex justify-center">
      <div style={{ width: "85%", height: "80vh", margin: "0 auto" }}>
        <h1 className="text-3xl font-bold text-center mb-4">Calendar Page</h1>
        <div className="border p-4 rounded shadow-lg bg-white z-10">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="70vh" // Increased height
          />
        </div>
      </div>
    </div>
  );
}
