"use client";
import { useState } from "react";

export default function Timetable() {
  const [schedule, setSchedule] = useState<{ time: string; day: string; event: string }[]>([]);
  const [event, setEvent] = useState("");
  const [selectedTime, setSelectedTime] = useState("05:00");
  const [selectedDay, setSelectedDay] = useState("Monday");

  const addEvent = () => {
    if (event.trim()) {
      setSchedule([...schedule, { time: selectedTime, day: selectedDay, event }]);
      setEvent("");
    }
  };

  // ✅ Generate exactly 24-hour times from 05:00 to 04:00
  const times = Array.from({ length: 24 }, (_, i) => `${String((5 + i) % 24).padStart(2, '0')}:00`);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="flex flex-col items-center p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Weekly Timetable</h1>
      <div className="flex space-x-2 mb-4">
        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="border p-2 rounded">
          {days.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="border p-2 rounded">
          {times.map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
        <input
          type="text"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          className="border p-2 rounded"
          placeholder="Enter event"
        />
        <button onClick={addEvent} className=" button2 px-4 py-2 rounded ">
          Add
        </button>
      </div>
      <table className="border-collapse w-full text-sm">
        <thead>
          <tr>
            <th className="border p-2">Time</th>
            {days.map((day) => (
              <th key={day} className="border p-2">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={time}>
              <td className="border p-2 font-bold">{time}</td>
              {days.map((day) => (
                <td key={day} className="border p-2 h-10">
                  {schedule.find((s) => s.time === time && s.day === day)?.event || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
