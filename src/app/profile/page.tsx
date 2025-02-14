"use client";
import { useState, useEffect } from "react";

export default function Profile() {
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("userNotes") || "[]");
    setNotes(storedNotes);
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <h2 className="text-xl font-semibold mb-2">Saved Notes</h2>
      <ul>
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <li key={index} className="border p-2 rounded mb-2 bg-gray-100">
              {note}
            </li>
          ))
        ) : (
          <p>No notes saved yet.</p>
        )}
      </ul>
    </div>
  );
}