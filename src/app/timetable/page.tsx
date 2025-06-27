"use client";
import { useState, useMemo, useCallback, memo } from 'react';
import { FixedSizeList as List } from 'react-window';

type EventData = {
  time: string;
  day: string;
  event: string;
  color: string;
};

type ModalState = {
  show: boolean;
  time: string;
  day: string;
  event: string;
  color: string;
  isEditing: boolean;
};

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Pink", value: "#ec4899" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Memoized DayHeader component
const DayHeader = memo(({ day }: { day: string }) => (
  <div className="flex-1 min-w-[120px] p-2 font-bold text-center">
    {day}
  </div>
));

// Memoized TimeSlot component
const TimeSlot = memo(({ 
  time, 
  day, 
  event, 
  handleSlotClick, 
  removeEvent 
}: { 
  time: string; 
  day: string; 
  event?: EventData; 
  handleSlotClick: (time: string, day: string) => void; 
  removeEvent: (time: string, day: string) => void; 
}) => (
  <div
    className="flex-1 min-w-[120px] p-2 border-l hover:bg-gray-50 cursor-pointer"
    onClick={() => handleSlotClick(time, day)}
  >
    {event && (
      <div 
        className="flex justify-between items-center p-1 rounded"
        style={{ 
          backgroundColor: `${event.color}20`,
          borderLeft: `4px solid ${event.color}`
        }}
      >
        <span className="truncate text-sm">{event.event}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeEvent(time, day);
          }}
          className="text-red-500 hover:text-red-700 text-lg font-bold px-1"
        >
          ×
        </button>
      </div>
    )}
  </div>
));

export default function Timetable() {
  const [schedule, setSchedule] = useState<EventData[]>([]);
  const [timeInterval, setTimeInterval] = useState(60);
  const [modalState, setModalState] = useState<ModalState>({
    show: false,
    time: "",
    day: "",
    event: "",
    color: "#3b82f6",
    isEditing: false
  });

  // Generate time slots from 5:00 AM to 4:45 AM (next day)
  const times = useMemo(() => {
    const slots = [];
    let totalMinutes = 5 * 60; // 5:00 AM start
    const endMinutes = (24 + 5) * 60; // 5:00 AM next day (1740 minutes)

    while (totalMinutes < endMinutes) {
      const hour = Math.floor(totalMinutes / 60) % 24;
      const minute = totalMinutes % 60;
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      totalMinutes += timeInterval;
    }
    return slots;
  }, [timeInterval]);

  // Event lookup map
  const eventMap = useMemo(() => {
    const map = new Map<string, EventData>();
    schedule.forEach(event => map.set(`${event.day}-${event.time}`, event));
    return map;
  }, [schedule]);

  // Event handlers
  const handleSlotClick = useCallback((time: string, day: string) => {
    const event = eventMap.get(`${day}-${time}`);
    setModalState({
      show: true,
      time,
      day,
      event: event?.event || "",
      color: event?.color || "#3b82f6",
      isEditing: !!event
    });
  }, [eventMap]);

  const saveEvent = useCallback(() => {
    if (modalState.event.trim()) {
      setSchedule(prevSchedule => [
        ...prevSchedule.filter(e => !(e.time === modalState.time && e.day === modalState.day)),
        {
          time: modalState.time,
          day: modalState.day,
          event: modalState.event,
          color: modalState.color
        }
      ]);
      setModalState(prevModal => ({ ...prevModal, show: false }));
    }
  }, [modalState]);

  const removeEvent = useCallback((time: string, day: string) => {
    setSchedule(prevSchedule => prevSchedule.filter(e => !(e.time === time && e.day === day)));
  }, []);

  // Row component
  const Row = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const time = times[index];
    return (
      <div style={style} className="flex border-b">
        <div className="w-24 p-2 font-bold bg-gray-50 flex-shrink-0">{time}</div>
        {days.map(day => {
          const event = eventMap.get(`${day}-${time}`);
          return (
            <TimeSlot
              key={day}
              time={time}
              day={day}
              event={event}
              handleSlotClick={handleSlotClick}
              removeEvent={removeEvent}
            />
          );
        })}
      </div>
    );
  });

  return (
    <div className="flex flex-col items-center p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Weekly Timetable</h1>

      <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg w-full justify-center">
        <div className="flex items-center gap-2">
          <label>Time Interval:</label>
          <select
            value={timeInterval}
            onChange={(e) => setTimeInterval(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {[15, 30, 60, 120].map(mins => (
              <option key={mins} value={mins}>{mins} mins</option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full overflow-hidden border rounded-lg">
        <div className="flex bg-gray-100">
          <div className="w-24 p-2 font-bold flex-shrink-0">Time</div>
          {days.map(day => (
            <DayHeader key={day} day={day} />
          ))}
        </div>

        <List
          height={600}
          itemCount={times.length}
          itemSize={60}
          width="100%"
          key={timeInterval} // Re-render when interval changes
        >
          {Row}
        </List>
      </div>

      {modalState.show && (
        <Modal
          modalState={modalState}
          setModalState={setModalState}
          saveEvent={saveEvent}
          removeEvent={removeEvent}
        />
      )}
    </div>
  );
}

// Modal component
const Modal = memo(({
  modalState,
  setModalState,
  saveEvent,
  removeEvent
}: {
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  saveEvent: () => void;
  removeEvent: (time: string, day: string) => void;
}) => {
  const handleColorChange = useCallback((color: string) => {
    setModalState(prev => ({ ...prev, color }));
  }, []);

  const handleEventChange = useCallback((event: string) => {
    setModalState(prev => ({ ...prev, event }));
  }, []);

  const handleClose = useCallback(() => {
    setModalState(prev => ({ ...prev, show: false }));
  }, []);

  const handleDelete = useCallback(() => {
    removeEvent(modalState.time, modalState.day);
    setModalState(prev => ({ ...prev, show: false }));
  }, [modalState.time, modalState.day, removeEvent]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          {modalState.isEditing ? "Edit" : "Add"} Event at {modalState.time}
        </h2>
        <input
          type="text"
          value={modalState.event}
          onChange={(e) => handleEventChange(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          placeholder="Event name"
          autoFocus
        />
        <div className="mb-4">
          <label className="block mb-2">Color:</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(color => (
              <button
                key={color.value}
                className={`w-8 h-8 rounded-full ${modalState.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          {modalState.isEditing && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          )}
          <button
            onClick={saveEvent}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {modalState.isEditing ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
});
