"use client";
import { useState } from "react";

type EventData = {
  time: string;
  day: string;
  event: string;
  color: string;
};

export default function Timetable() {
  const [schedule, setSchedule] = useState<EventData[]>([]);
  const [eventInput, setEventInput] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{time: string, day: string} | null>(null);
  const [startTime, setStartTime] = useState("05:00");
  const [endTime, setEndTime] = useState("20:00");
  const [timeInterval, setTimeInterval] = useState(60);
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#3b82f6"); // Default blue
  const [isEditing, setIsEditing] = useState(false);

  const colorOptions = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#10b981" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Yellow", value: "#f59e0b" },
    { name: "Pink", value: "#ec4899" },
  ];

  const generateTimeSlots = () => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      slots.push(timeString);
      
      currentMinute += timeInterval;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }
    
    return slots;
  };

  const times = generateTimeSlots();
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const handleSlotClick = (time: string, day: string) => {
    const existingEvent = schedule.find(item => item.time === time && item.day === day);
    setSelectedSlot({ time, day });
    
    if (existingEvent) {
      setEventInput(existingEvent.event);
      setSelectedColor(existingEvent.color);
      setIsEditing(true);
    } else {
      setEventInput("");
      setSelectedColor("#3b82f6");
      setIsEditing(false);
    }
    
    setShowModal(true);
  };

  const saveEvent = () => {
    if (eventInput.trim() && selectedSlot) {
      // Remove any existing event in this slot
      const newSchedule = schedule.filter(
        item => !(item.time === selectedSlot.time && item.day === selectedSlot.day)
      );
      
      // Add new/updated event
      setSchedule([...newSchedule, { 
        time: selectedSlot.time, 
        day: selectedSlot.day, 
        event: eventInput,
        color: selectedColor
      }]);
      
      resetModal();
    }
  };

  const removeEvent = (time: string, day: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSchedule(schedule.filter(item => !(item.time === time && item.day === day)));
  };

  const resetModal = () => {
    setEventInput("");
    setSelectedColor("#3b82f6");
    setShowModal(false);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Weekly Timetable</h1>
      
      {/* Settings controls */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <label>Start Time:</label>
          <input 
            type="time" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>End Time:</label>
          <input 
            type="time" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Interval (minutes):</label>
          <select 
            value={timeInterval}
            onChange={(e) => setTimeInterval(Number(e.target.value))}
            className="border p-2 rounded"
          >
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="120">120</option>
          </select>
        </div>
      </div>
      
      {/* Timetable */}
      <div className="w-full overflow-x-auto">
        <table className="border-collapse w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">Time</th>
              {days.map((day) => (
                <th key={day} className="border p-2 bg-gray-100">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time}>
                <td className="border p-2 font-bold bg-gray-50">{time}</td>
                {days.map((day) => {
                  const eventItem = schedule.find((s) => s.time === time && s.day === day);
                  return (
                    <td 
                      key={day} 
                      className="border p-2 h-12 min-w-[120px] relative hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSlotClick(time, day)}
                    >
                      {eventItem ? (
                        <div 
                          className="flex justify-between items-center p-2 rounded"
                          style={{ backgroundColor: `${eventItem.color}20`, borderLeft: `4px solid ${eventItem.color}` }}
                        >
                          <span className="truncate">{eventItem.event}</span>
                          <button 
                            onClick={(e) => removeEvent(time, day, e)}
                            className="text-red-500 hover:text-red-700 text-lg font-bold px-2"
                            title="Delete event"
                          >
                            ×
                          </button>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Event" : "Add Event"} at {selectedSlot?.time} on {selectedSlot?.day}
            </h2>
            <input
              type="text"
              value={eventInput}
              onChange={(e) => setEventInput(e.target.value)}
              className="border p-2 rounded w-full mb-4"
              placeholder="Enter event name"
              autoFocus
            />
            
            <div className="mb-4">
              <label className="block mb-2">Select Color:</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={resetModal}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              {isEditing && (
                <button 
                  onClick={() => {
                    removeEvent(selectedSlot!.time, selectedSlot!.day, {} as React.MouseEvent);
                    resetModal();
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              )}
              <button 
                onClick={saveEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {isEditing ? "Update" : "Add"} Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}