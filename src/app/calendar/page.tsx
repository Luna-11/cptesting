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
    user_id?: number;
  };
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [isLoading, setIsLoading] = useState({
    events: false,
    add: false,
    delete: null as string | null,
  });
  const [error, setError] = useState("");

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setShowModal(true);
    setError("");
  };

  const fetchEvents = async () => {
    setIsLoading(prev => ({ ...prev, events: true }));
    setError("");
    try {
      const res = await fetch("/api/events", {
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch events (status: ${res.status})`
        );
      }

      const data = await res.json();
      const safeData = Array.isArray(data) ? data : [];
      
      setEvents(safeData.map((event: any) => ({
        id: event.event_id.toString(),
        title: event.event_name,
        start: event.event_date,
        extendedProps: {
          user_id: event.user_id
        }
      })));
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setError(err.message || "Failed to load events");
      
      if (err.message.includes('Unauthorized')) {
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(prev => ({ ...prev, events: false }));
    }
  };

const handleEventClick = async (info: any) => {
  if (!confirm(`Delete "${info.event.title}" event?`)) return;
  
  setIsLoading(prev => ({ ...prev, delete: info.event.id }));
  setError("");
  try {
    const res = await fetch(`/api/events?id=${info.event.id}`, {
      method: "DELETE",
      credentials: 'include'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete event (status: ${res.status})`);
    }

    const data = await res.json();
    
    // More flexible success condition checking
    if (data.message?.includes('deleted') || data.deletedId || data.success) {
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id !== info.event.id)
      );
    } else {
      console.warn('Unexpected response format:', data);
      // Still proceed with deletion if we got a 200 response
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id !== info.event.id)
      );
    }
  } catch (err: any) {
    console.error("Failed to delete event:", err);
    setError(err.message || "Failed to delete event");
    // Refresh events to sync with server
    await fetchEvents();
  } finally {
    setIsLoading(prev => ({ ...prev, delete: null }));
  }
};

  const handleAddEvent = async () => {
    if (!eventTitle.trim()) {
      setError("Event title cannot be empty");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, add: true }));
    setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          event_name: eventTitle.trim(),
          event_date: selectedDate,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add event (status: ${res.status})`);
      }

      const data = await res.json();
      
      setEvents(prevEvents => [
        ...prevEvents,
        {
          id: data.event?.event_id?.toString() || Date.now().toString(),
          title: data.event?.event_name || eventTitle.trim(),
          start: data.event?.event_date || selectedDate,
          extendedProps: {
            user_id: data.event?.user_id
          }
        }
      ]);
      
      setEventTitle("");
      setShowModal(false);
    } catch (err: any) {
      console.error("Failed to add event:", err);
      setError(err.message || "Failed to add event");
    } finally {
      setIsLoading(prev => ({ ...prev, add: false }));
    }
  };

  const renderEventContent = (eventInfo: any) => (
    <div className="text-xs font-semibold text-center">
      {eventInfo.event.title}
      {isLoading.delete === eventInfo.event.id && (
        <span className="block text-xs">(Deleting...)</span>
      )}
    </div>
  );

  return (
    <div className="p-2 min-h-screen" style={{ backgroundColor: "#f0eeee" }}>
      {/* Error message display */}
      {error && (
        <div className="mx-auto max-w-5xl mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mx-auto max-w-5xl bg-white p-1 rounded-2xl shadow-lg calendar-container">
        {isLoading.events ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d312e]"></div>
          </div>
        ) : (
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
        )}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-[#f0eeee] p-6 rounded-xl shadow-xl w-80">
            <h2 className="text-lg font-bold text-[#3d312e] mb-4">Add Event</h2>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => {
                setEventTitle(e.target.value);
                setError("");
              }}
              placeholder="Event title..."
              className="w-full p-2 mb-4 border border-[#bba2a2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bba2a2]"
              onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
              disabled={isLoading.add}
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="px-4 py-2 rounded-lg bg-[#bba2a2] text-white hover:bg-[#3d312e] transition disabled:opacity-50"
                disabled={isLoading.add}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 rounded-lg bg-[#3d312e] text-[#f0eeee] hover:bg-[#bba2a2] transition disabled:opacity-50"
                disabled={isLoading.add || !eventTitle.trim()}
              >
                {isLoading.add ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}