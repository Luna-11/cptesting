// pages/subjects.tsx
"use client"
import { useState } from "react";
import Timer from "../components/timer";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const addSubject = () => {
    if (newSubject.trim() !== "") {
      setSubjects([...subjects, newSubject]);
      setNewSubject("");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Study Subjects</h1>

      {!selectedSubject ? (
        <>
          {/* Input Field & Add Button */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter subject name"
              className="p-2 text-black rounded"
            />
            <button onClick={addSubject} className="button2 px-4 py-2 rounded">
              Add
            </button>
          </div>

          {/* Subject List */}
          <ul>
            {subjects.map((subject, index) => (
              <li key={index} className="mb-2">
                <button
                  onClick={() => setSelectedSubject(subject)}
                  className="text-white bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                >
                  {subject}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        /* Timer Component when a subject is selected */
        <Timer subject={selectedSubject} onStop={() => setSelectedSubject(null)} />
      )}
    </div>
  );
}
