"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import "@/app/globals.css";

type Event = {
  id: string;
  title: string;
  start: string;
  extendedProps: {
    description?: string;
    user_id?: number;
  };
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data.map((event: any) => ({
          id: event.event_id.toString(),
          title: event.event_name,
          start: event.event_date,
          extendedProps: {
            user_id: event.user_id
          }
        })));
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setShowModal(true);
  };

  const handleEventClick = async (info: any) => {
    if (confirm("Do you want to delete this event?")) {
      try {
        await fetch(`/api/events?id=${info.event.id}`, {
          method: "DELETE",
        });
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== info.event.id)
        );
      } catch (err) {
        console.error("Failed to delete event:", err);
      }
    }
  };

  const handleAddEvent = async () => {
    if (eventTitle.trim() === "") return;

    const newEvent = {
      title: eventTitle.trim(),
      start: selectedDate,
      extendedProps: {
        description: eventTitle.trim(),
      },
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 8,
          event_name: eventTitle.trim(),
          event_date: selectedDate,
        }),
      });

      const data = await res.json();

      if (!data.eventId) {
        console.error("No eventId in response:", data);
        alert("Failed to save event (no eventId returned)");
        return;
      }

      setEvents([...events, {
        ...newEvent,
        id: data.eventId.toString()
      }]);
    } catch (err) {
      console.error("Failed to add event:", err);
      alert("Failed to save event");
    }

    setEventTitle("");
    setShowModal(false);
  };

  const renderEventContent = (eventInfo: any) => (
    <div className="text-xs font-semibold text-center">
      {eventInfo.event.title}
    </div>
  );

  return (
    <div className="p-2 min-h-screen" style={{ backgroundColor: "#f0eeee" }}>
      <div className="mx-auto max-w-5xl bg-white p-1 rounded-2xl shadow-lg calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "",
          }}
          dayHeaderFormat={{ weekday: "short" }}
          dayHeaders
          dayHeaderContent={(arg) => (
            <div className="text-sm font-semibold text-[#3d312e]">
              {arg.text}
            </div>
          )}
          eventContent={renderEventContent}
          eventDisplay="block"
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-[#f0eeee] p-6 rounded-xl shadow-xl w-80">
            <h2 className="text-lg font-bold text-[#3d312e] mb-4">Add Event</h2>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event title..."
              className="w-full p-2 mb-4 border border-[#bba2a2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bba2a2]"
              onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-[#bba2a2] text-white hover:bg-[#3d312e] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 rounded-lg bg-[#3d312e] text-[#f0eeee] hover:bg-[#bba2a2] transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
