"use client"
import { useState } from "react";
import Timer from "../components/timer";

type NoteColor = 'white' | 'blue' | 'yellow' | 'green' | 'pink';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<{name: string, notes: string, color: NoteColor}[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [noteColor, setNoteColor] = useState<NoteColor>('white');
  const [title, setTitle] = useState("");

  const addSubject = () => {
    if (newSubject.trim() !== "") {
      setSubjects([...subjects, {name: newSubject, notes: "", color: 'white'}]);
      setNewSubject("");
    }
  };

  const saveNotes = () => {
    setSubjects(subjects.map(subject => 
      subject.name === selectedSubject 
        ? {...subject, notes, color: noteColor} 
        : subject
    ));
  };

  const currentSubject = subjects.find(subject => subject.name === selectedSubject);

  const colorClasses = {
    white: 'bg-white text-gray-900',
    blue: 'bg-blue-100 text-gray-900',
    yellow: 'bg-yellow-100 text-gray-900',
    green: 'bg-green-100 text-gray-900',
    pink: 'bg-pink-100 text-gray-900'
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
                  onClick={() => {
                    setSelectedSubject(subject.name);
                    setNotes(subject.notes);
                    setNoteColor(subject.color);
                    setTitle(subject.name.toUpperCase());
                    setDate(new Date().toLocaleDateString());
                  }}
                  className="text-white bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                >
                  {subject.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="w-full max-w-2xl">
          {/* Timer Component (always visible) */}
          <Timer 
            subject={selectedSubject} 
            onStop={() => setSelectedSubject(null)} 
          />

          {/* Notes Section (appears below timer) */}
          <div className={`mt-8 p-6 rounded-lg shadow-lg ${colorClasses[noteColor]}`}>
            {/* Color Options */}
            <div className="flex gap-2 mb-4 justify-center">
              {(['white', 'blue', 'yellow', 'green', 'pink'] as NoteColor[]).map(color => (
                <button
                  key={color}
                  onClick={() => setNoteColor(color)}
                  className={`w-6 h-6 rounded-full ${color === noteColor ? 'ring-2 ring-black' : ''} ${
                    color === 'white' ? 'bg-white border border-gray-300' :
                    color === 'blue' ? 'bg-blue-100' :
                    color === 'yellow' ? 'bg-yellow-100' :
                    color === 'green' ? 'bg-green-100' : 'bg-pink-100'
                  }`}
                  aria-label={`${color} note color`}
                />
              ))}
            </div>

            {/* Note Header */}
            <div className="text-center mb-6">
              <div className="text-xs mb-2">~ How I use my Note-Taking Templates for school!</div>
              <div className="text-2xl font-bold tracking-widest mb-4">{title}</div>
              
              <div className="flex justify-between items-center text-sm mb-4">
                <span>DATE: {date}</span>
                <span className="flex gap-1">
                  {['M', 'T', 'W', 'Th', 'F', 'S', 'Su'].map(day => (
                    <span key={day}>{day}</span>
                  ))}
                </span>
              </div>
            </div>
            
            {/* Note Content */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 text-gray-900 rounded h-96 font-mono text-sm leading-relaxed"
              placeholder="Write your notes here..."
              style={{ backgroundColor: 'inherit' }}
            />
            
            {/* Action Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  saveNotes();
                  setSelectedSubject(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Back to Subjects
              </button>
              <button
                onClick={saveNotes}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Notes
              </button>
            </div>

            <div className="text-center text-xs mt-4">
              created by yourstudyapp.com | @yourstudyapp
            </div>
          </div>
        </div>
      )}
    </div>
  );
}