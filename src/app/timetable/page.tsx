"use client";
import React, { useState, useMemo, useCallback, memo } from "react";

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

type TimeSlotProps = {
  time: string;
  day: string;
  event?: EventData;
  handleSlotClick: (time: string, day: string) => void;
  removeEvent: (time: string, day: string) => void;
};

type ModalProps = {
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  saveEvent: () => void;
  removeEvent: (time: string, day: string) => void;
};

const COLOR_OPTIONS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Pink", value: "#ec4899" },
] as const;

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const DayHeader = memo(({ day }: { day: string }) => (
  <div className="p-2 font-bold text-center border border-[black] bg-[#3d312e] text-[#f0eeee] text-sm">
    {day}
  </div>
));

const TimeSlot = memo(({
  time,
  day,
  event,
  handleSlotClick,
  removeEvent
}: TimeSlotProps) => {
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    removeEvent(time, day);
  }, [time, day, removeEvent]);

  return (
    <div
      className="border border-[black] min-h-[40px] hover:bg-[#f0eeee] cursor-pointer flex items-center justify-center p-1 bg-white"
      onClick={() => handleSlotClick(time, day)}
      aria-label={`Time slot for ${day} at ${time}`}
    >
      {event && (
        <div
          className="flex justify-between items-center w-full px-1 py-0.5 rounded text-white text-xs font-medium"
          style={{ backgroundColor: event.color }}
        >
          <span className="truncate text-[0.7rem]">{event.event}</span>
          <button
            onClick={handleRemove}
            className="ml-1 text-white text-sm font-bold leading-none"
            aria-label={`Remove event ${event.event}`}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
});

const Modal = memo(({
  modalState,
  setModalState,
  saveEvent,
  removeEvent
}: ModalProps) => {
  const handleColorChange = useCallback((color: string) => {
    setModalState(prev => ({ ...prev, color }));
  }, []);

  const handleEventChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setModalState(prev => ({ ...prev, event: e.target.value }));
  }, []);

  const handleClose = useCallback(() => {
    setModalState(prev => ({ ...prev, show: false }));
  }, []);

  const handleDelete = useCallback(() => {
    removeEvent(modalState.time, modalState.day);
    handleClose();
  }, [modalState.time, modalState.day, removeEvent, handleClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-[#3d312e]">
          {modalState.isEditing ? "Edit" : "Add"} Event at {modalState.time}
        </h2>
        <input
          type="text"
          value={modalState.event}
          onChange={handleEventChange}
          className="border border-[black] p-2 rounded w-full mb-4 text-[#3d312e]"
          placeholder="Event name"
          autoFocus
          aria-label="Event name input"
        />
        <div className="mb-4">
          <label className="block mb-2 text-[#3d312e]">Color:</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.value}
                className={`w-8 h-8 rounded-full ${
                  modalState.color === color.value
                    ? "ring-2 ring-offset-2 ring-[#bba2a2]"
                    : ""
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-[black] rounded text-[#3d312e]"
            aria-label="Cancel"
          >
            Cancel
          </button>
          {modalState.isEditing && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded"
              aria-label="Delete event"
            >
              Delete
            </button>
          )}
          <button
            onClick={saveEvent}
            className="px-4 py-2 bg-[#3d312e] text-[#f0eeee] rounded"
            aria-label={modalState.isEditing ? "Update event" : "Add event"}
          >
            {modalState.isEditing ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function Timetable() {
  const [schedule, setSchedule] = useState<EventData[]>([]);
  const [timeInterval, setTimeInterval] = useState<30 | 60 | 120>(60);
  const [dayRange, setDayRange] = useState<{
    startDay: typeof ALL_DAYS[number];
    endDay: typeof ALL_DAYS[number];
  }>({ startDay: "Monday", endDay: "Friday" });
  const [modalState, setModalState] = useState<ModalState>({
    show: false,
    time: "",
    day: "",
    event: "",
    color: "#3b82f6",
    isEditing: false,
  });

  const selectedDays = useMemo(() => {
    const startIndex = ALL_DAYS.indexOf(dayRange.startDay);
    const endIndex = ALL_DAYS.indexOf(dayRange.endDay);
    
    if (startIndex <= endIndex) {
      return ALL_DAYS.slice(startIndex, endIndex + 1);
    } else {
      return [...ALL_DAYS.slice(startIndex), ...ALL_DAYS.slice(0, endIndex + 1)];
    }
  }, [dayRange]);

  const times = useMemo(() => {
    const slots: string[] = [];
    let totalMinutes = 0;
    const endMinutes = 24 * 60 - timeInterval;

    while (totalMinutes <= endMinutes) {
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      const timeStr = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;
      slots.push(timeStr);
      totalMinutes += timeInterval;
    }

    return slots;
  }, [timeInterval]);

  const eventMap = useMemo(() => {
    const map = new Map<string, EventData>();
    schedule.forEach((event) => {
      map.set(`${event.day}-${event.time}`, event);
    });
    return map;
  }, [schedule]);

  const handleSlotClick = useCallback(
    (time: string, day: string) => {
      const event = eventMap.get(`${day}-${time}`);
      setModalState({
        show: true,
        time,
        day,
        event: event?.event || "",
        color: event?.color || "#3b82f6",
        isEditing: !!event,
      });
    },
    [eventMap]
  );

  const saveEvent = useCallback(() => {
    if (modalState.event.trim()) {
      setSchedule(prev => [
        ...prev.filter(
          e => !(e.time === modalState.time && e.day === modalState.day)
        ),
        {
          time: modalState.time,
          day: modalState.day,
          event: modalState.event,
          color: modalState.color,
        },
      ]);
      setModalState(prev => ({ ...prev, show: false }));
    }
  }, [modalState]);

  const removeEvent = useCallback((time: string, day: string) => {
    setSchedule(prev =>
      prev.filter(e => !(e.time === time && e.day === day))
    );
  }, []);

  return (
    <div className="flex flex-col items-center p-4 max-w-6xl mx-auto bg-white">
      <div className="flex flex-wrap gap-4 mb-4 p-4 rounded-lg w-full justify-center bg-white">
        <div className="flex items-center gap-2">
          <label htmlFor="timeInterval" className="text-[#3d312e]">Time Interval:</label>
          <select
            id="timeInterval"
            value={timeInterval}
            onChange={(e) => setTimeInterval(Number(e.target.value) as 30 | 60 | 120)}
            className="border border-[black] p-1 rounded text-[#3d312e]"
          >
            {[30, 60, 120].map((mins) => (
              <option key={mins} value={mins}>
                {mins} mins
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="startDay" className="text-[#3d312e]">From:</label>
          <select
            id="startDay"
            value={dayRange.startDay}
            onChange={(e) => setDayRange(prev => ({
              ...prev,
              startDay: e.target.value as typeof ALL_DAYS[number]
            }))}
            className="border border-[black] p-1 rounded text-[#3d312e]"
          >
            {ALL_DAYS.map(day => (
              <option key={`start-${day}`} value={day}>{day}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="endDay" className="text-[#3d312e]">To:</label>
          <select
            id="endDay"
            value={dayRange.endDay}
            onChange={(e) => setDayRange(prev => ({
              ...prev,
              endDay: e.target.value as typeof ALL_DAYS[number]
            }))}
            className="border border-[black] p-1 rounded text-[#3d312e]"
          >
            {ALL_DAYS.map(day => (
              <option key={`end-${day}`} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-auto w-full border border-[black] rounded-lg max-h-[80vh]">
        <div className="grid" style={{
          gridTemplateColumns: `80px repeat(${selectedDays.length}, minmax(120px, 1fr))`
        }}>
          <div className="p-2 font-bold border border-[black] text-center bg-[#3d312e] text-[#f0eeee] text-sm">
            TIME
          </div>
          
          {selectedDays.map((day) => (
            <DayHeader key={day} day={day} />
          ))}

          {times.map((time) => (
            <React.Fragment key={time}>
              <div className="p-1 font-bold text-center border border-[black] bg-white text-[#3d312e] text-sm">
                {time}
              </div>
              {selectedDays.map((day) => {
                const event = eventMap.get(`${day}-${time}`);
                return (
                  <TimeSlot
                    key={`${day}-${time}`}
                    time={time}
                    day={day}
                    event={event}
                    handleSlotClick={handleSlotClick}
                    removeEvent={removeEvent}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
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