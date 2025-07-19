"use client"

import React, { useState, useMemo, useCallback, memo, useEffect } from "react"

// Align ALL_DAYS with Date.getDay() where Sunday is 0, Monday is 1, etc.
const ALL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const
type Day = (typeof ALL_DAYS)[number]

const COLOR_OPTIONS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Pink", value: "#ec4899" },
] as const

type EventData = {
  id: number
  day: Day
  time: string
  event: string
  color: string
}

type ModalState = {
  show: boolean
  time: string
  day: Day
  event: string
  color: string
  isEditing: boolean
  id?: number
}

type TimeSlotProps = {
  time: string
  day: Day
  event?: EventData
  handleSlotClick: (time: string, day: Day) => void
  removeEvent: (id: number) => void
}

const DayHeader = memo(({ day }: { day: Day }) => (
  <div className="p-2 font-bold text-center border border-[black] bg-[#3d312e] text-[#f0eeee] text-sm">{day}</div>
))

const TimeSlot = memo(({ time, day, event, handleSlotClick, removeEvent }: TimeSlotProps) => {
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (event?.id) {
        removeEvent(event.id)
      }
    },
    [event, removeEvent],
  )

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
  )
})

export default function Timetable() {
  const [schedule, setSchedule] = useState<EventData[]>([])
  const [timeInterval, setTimeInterval] = useState<30 | 60 | 120>(60)
  const [dayRange, setDayRange] = useState<{
    startDay: Day
    endDay: Day
  }>({ startDay: "Monday", endDay: "Friday" })
  const [modalState, setModalState] = useState<ModalState>({
    show: false,
    time: "",
    day: "Monday",
    event: "",
    color: "#3b82f6",
    isEditing: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch existing events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/timetable", {
          credentials: "include",
        })
        if (!response.ok) {
          const errorData = await response.json()
          console.error("Failed to fetch events:", errorData)
          throw new Error(errorData.error || "Failed to fetch events")
        }
        const data = await response.json()
        setSchedule(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const selectedDays = useMemo(() => {
    const startIndex = ALL_DAYS.indexOf(dayRange.startDay)
    const endIndex = ALL_DAYS.indexOf(dayRange.endDay)

    if (startIndex === -1 || endIndex === -1) {
      return []
    }

    if (startIndex <= endIndex) {
      return ALL_DAYS.slice(startIndex, endIndex + 1)
    } else {
      return [...ALL_DAYS.slice(startIndex), ...ALL_DAYS.slice(0, endIndex + 1)]
    }
  }, [dayRange])

  const times = useMemo(() => {
    const slots: string[] = []
    let totalMinutes = 0
    const endMinutes = 24 * 60 - timeInterval
    while (totalMinutes <= endMinutes) {
      const hour = Math.floor(totalMinutes / 60)
      const minute = totalMinutes % 60
      const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      slots.push(timeStr)
      totalMinutes += timeInterval
    }
    return slots
  }, [timeInterval])

  const eventMap = useMemo(() => {
    const map = new Map<string, EventData>()
    schedule.forEach((event) => {
      map.set(`${event.day}-${event.time}`, event)
    })
    return map
  }, [schedule])

  const handleSlotClick = useCallback(
    (time: string, day: Day) => {
      const event = eventMap.get(`${day}-${time}`)
      setModalState({
        show: true,
        time,
        day,
        event: event?.event || "",
        color: event?.color || "#3b82f6",
        isEditing: !!event,
        id: event?.id,
      })
    },
    [eventMap],
  )

  const saveEvent = useCallback(async () => {
    if (!modalState.event.trim()) return

    try {
      const response = await fetch("/api/timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day: modalState.day,
          time: modalState.time,
          task_name: modalState.event,
          color: modalState.color,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save event")
      }

      const responseData = await response.json()
      const savedEvent = responseData.data

      // Update local state
      setSchedule((prev) => {
        // Remove old event if editing, then add the new/updated event
        const filtered = prev.filter((e) => e.id !== modalState.id)
        return [...filtered, savedEvent]
      })
    } catch (err) {
      console.error("Error saving event:", err)
      alert(err instanceof Error ? err.message : "Failed to save event")
      return
    }
    setModalState((prev) => ({ ...prev, show: false }))
  }, [modalState])

  const removeEvent = useCallback(async (id: number) => {
    try {
      const response = await fetch("/api/timetable", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete event")
      }

      setSchedule((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error("Error removing event:", err)
      alert(err instanceof Error ? err.message : "Failed to remove event")
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d312e]"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4 max-w-6xl mx-auto bg-white">
      <div className="flex flex-wrap gap-4 mb-4 p-4 rounded-lg w-full justify-center bg-white">
        <div className="flex items-center gap-2">
          <label htmlFor="timeInterval" className="text-[#3d312e]">
            Time Interval:
          </label>
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
          <label htmlFor="startDay" className="text-[#3d312e]">
            From:
          </label>
          <select
            id="startDay"
            value={dayRange.startDay}
            onChange={(e) =>
              setDayRange((prev) => ({
                ...prev,
                startDay: e.target.value as Day,
              }))
            }
            className="border border-[black] p-1 rounded text-[#3d312e]"
          >
            {ALL_DAYS.map((day) => (
              <option key={`start-${day}`} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="endDay" className="text-[#3d312e]">
            To:
          </label>
          <select
            id="endDay"
            value={dayRange.endDay}
            onChange={(e) =>
              setDayRange((prev) => ({
                ...prev,
                endDay: e.target.value as Day,
              }))
            }
            className="border border-[black] p-1 rounded text-[#3d312e]"
          >
            {ALL_DAYS.map((day) => (
              <option key={`end-${day}`} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-auto w-full border border-[black] rounded-lg max-h-[80vh]">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `80px repeat(${selectedDays.length}, minmax(120px, 1fr))`,
          }}
        >
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
                const event = eventMap.get(`${day}-${time}`)
                return (
                  <TimeSlot
                    key={`${day}-${time}`}
                    time={time}
                    day={day}
                    event={event}
                    handleSlotClick={handleSlotClick}
                    removeEvent={removeEvent}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {modalState.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-[#3d312e]">
              {modalState.isEditing ? "Edit" : "Add"} Event at {modalState.time}
            </h2>
            <input
              type="text"
              value={modalState.event}
              onChange={(e) => setModalState((prev) => ({ ...prev, event: e.target.value }))}
              className="border border-[black] p-2 rounded w-full mb-4 text-[#3d312e]"
              placeholder="Event name"
              autoFocus
            />
            <div className="mb-4">
              <label className="block mb-2 text-[#3d312e]">Color:</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full ${modalState.color === color.value ? "ring-2 ring-offset-2 ring-[#bba2a2]" : ""}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setModalState((prev) => ({ ...prev, color: color.value }))}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalState((prev) => ({ ...prev, show: false }))}
                className="px-4 py-2 border border-[black] rounded text-[#3d312e]"
              >
                Cancel
              </button>
              {modalState.isEditing && (
                <button
                  onClick={() => modalState.id && removeEvent(modalState.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              )}
              <button onClick={saveEvent} className="px-4 py-2 bg-[#3d312e] text-[#f0eeee] rounded">
                {modalState.isEditing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}