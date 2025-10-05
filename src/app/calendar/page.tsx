"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

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

  // Custom styles for FullCalendar
  const calendarStyles = `
    .calendar-container {
      background: #f0eeee;
      box-shadow: 0px 4px 10px rgba(61, 49, 46, 0.1);
      border-radius: 20px;
      padding: 20px;
      overflow: hidden;
    }

    /* Remove all default FullCalendar borders */
    .fc-theme-standard .fc-scrollgrid {
      border: none !important;
    }

    .fc-theme-standard td, 
    .fc-theme-standard th {
      border: none !important;
    }

    .fc-scrollgrid-sync-inner,
    .fc-scrollgrid-section-header {
      border: none !important;
    }

    .fc-scrollgrid-section-header td {
      border: none !important;
    }

    /* Calendar Header */
    .fc .fc-toolbar.fc-header-toolbar {
      margin-bottom: 1rem;
    }

    .fc-toolbar-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #3d312e;
      text-align: center;
      margin: 0 10px;
    }

    /* Header days (Mon, Tue, etc.) */
    .fc-col-header-cell {
      padding: 12px 0;
      background-color: #f0eeee;
    }

    .fc-col-header-cell-cushion {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.9rem;
      color: #3d312e;
      text-align: center;
      display: block;
      width: 100%;
      padding: 8px 0;
    }

    /* Calendar day cells */
    .fc-daygrid-day {
      padding: 6px;
    }

    .fc-daygrid-day-frame {
      background-color: #ffffff;
      border-radius: 16px;
      padding: 8px;
      min-height: 80px;
      transition: background-color 0.2s ease;
      margin: 5px;
      display: flex;
      flex-direction: column;
    }

    .fc-daygrid-day-frame:hover {
      background-color: #bba2a2;
    }

    /* Date numbers */
    .fc-daygrid-day-number {
      text-align: center;
      padding: 4px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #3d312e;
      width: 100%;
      margin-bottom: 2px;
    }

    /* Events */
    .fc-daygrid-event {
      margin: 2px 0;
      padding: 4px 6px;
      border-radius: 6px;
      background-color: #3d312e;
      color: #f0eeee;
      font-size: 0.75rem;
      font-weight: 600;
      border: none;
      text-align: center;
    }

    .fc-daygrid-event:hover {
      background-color: #bba2a2;
      color: #3d312e;
    }

    .fc-daygrid-day-events {
      margin: 0;
      padding: 0;
    }

    /* Navigation buttons */
    .fc-button {
      background-color: #3d312e !important;
      color: #f0eeee !important;
      border: none !important;
      border-radius: 6px !important;
      padding: 6px 12px !important;
      font-size: 0.85rem !important;
      font-weight: 600 !important;
      transition: background-color 0.3s ease !important;
      box-shadow: none !important;
    }

    .fc-button:hover {
      background-color: #bba2a2 !important;
      color: #3d312e !important;
    }

    .fc-button-primary:not(:disabled).fc-button-active,
    .fc-button-primary:not(:disabled):active {
      background-color: #bba2a2 !important;
      color: #3d312e !important;
      box-shadow: none !important;
    }

    /* Today's date styling */
    .fc .fc-daygrid-day.fc-day-today {
      border: none !important;
      background-color: transparent !important;
    }

    .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-frame:hover {
      background-color: #bba2a2;
    }

    .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
      position: relative;
      padding-right: 20px;
    }

    .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number::after {
      content: "";
      position: absolute;
      top: 150%;
      right: 38px;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      background-image: url('/p6.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }

    /* Grid alignment fixes */
    .fc-daygrid-body {
      width: 100% !important;
    }

    .fc-daygrid-day-top {
      justify-content: center !important;
      display: flex !important;
      width: 100% !important;
    }

    /* Responsive styles */
    @media (max-width: 767px) {
      .calendar-container {
        padding: 8px !important;
        margin: 0 4px;
        border-radius: 16px;
      }

      .fc-toolbar-title {
        font-size: 1.1rem !important;
      }

      .fc-col-header-cell-cushion {
        font-size: 0.75rem;
        padding: 6px 0;
      }

      .fc-daygrid-day-frame {
        min-height: 60px;
        padding: 4px !important;
        margin: 2px;
        border-radius: 12px;
      }

      .fc-daygrid-day-number {
        font-size: 0.75rem;
        padding: 2px !important;
      }

      .fc-daygrid-event {
        margin: 1px 0 !important;
        padding: 2px 4px !important;
        font-size: 0.65rem;
      }

      .fc-button {
        padding: 4px 8px !important;
        font-size: 0.75rem !important;
      }

      .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number::after {
        width: 24px !important;
        height: 24px !important;
        right: 25px !important;
      }
    }

    @media (max-width: 480px) {
      .calendar-container {
        padding: 4px !important;
        border-radius: 12px;
      }

      .fc-daygrid-day-frame {
        min-height: 50px;
        margin: 1px;
        border-radius: 8px;
      }

      .fc-daygrid-day-number {
        font-size: 0.7rem;
      }

      .fc-daygrid-event {
        font-size: 0.6rem;
        padding: 1px 3px !important;
      }

      .fc-toolbar-title {
        font-size: 1rem !important;
      }

      .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number::after {
        width: 20px !important;
        height: 20px !important;
        right: 20px !important;
      }
    }

    @media (max-width: 320px) {
      .calendar-container {
        transform: scale(0.95);
        transform-origin: top center;
        margin: 0 -8px;
      }
      
      .fc-daygrid-day-frame {
        min-height: 45px;
      }
      
      .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number::after {
        width: 18px !important;
        height: 18px !important;
        right: 15px !important;
      }
    }
  `;

  return (
    <>
      <style jsx global>{calendarStyles}</style>
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
    </>
  );
}