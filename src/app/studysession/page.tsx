"use client";
import { useState, useEffect, useCallback } from "react";
import Timer from "../components/timer";
import debounce from "lodash.debounce";

type NoteColor = 'white' | 'blue' | 'yellow' | 'green' | 'pink';
const DEFAULT_COLOR: NoteColor = 'white';

interface Subject {
  id: number;
  name: string;
  notes: string;
  color?: NoteColor;
  user_id?: number;
}

const colorMap: Record<NoteColor, string> = {
  white: 'bg-white',
  blue: 'bg-blue-100',
  yellow: 'bg-yellow-100',
  green: 'bg-green-100',
  pink: 'bg-pink-100'
};

const textColorMap: Record<NoteColor, string> = {
  white: 'text-gray-900',
  blue: 'text-gray-900',
  yellow: 'text-gray-900',
  green: 'text-gray-900',
  pink: 'text-gray-900'
};

const getColorClass = (color?: string): NoteColor => {
  if (color && Object.keys(colorMap).includes(color)) {
    return color as NoteColor;
  }
  return DEFAULT_COLOR;
};

const debouncedSaveSession = debounce(async (
  duration: number,
  selectedSubject: Subject | null,
  timerStartTime: Date | null,
  notes: string,
  setLoading: React.Dispatch<React.SetStateAction<{ subjects: boolean; saving: boolean }>>,
  setError: React.Dispatch<React.SetStateAction<{ subjects: string; general: string }>>,
  setSuccess: React.Dispatch<React.SetStateAction<string>>,
  setTimerStartTime: React.Dispatch<React.SetStateAction<Date | null>>,
  setCurrentSubjectId: React.Dispatch<React.SetStateAction<number | null>>
) => {
  if (!selectedSubject || !timerStartTime) return;
  
  setLoading(prev => ({ ...prev, saving: true }));
  setError(prev => ({ ...prev, general: '' }));
  
  try {
    const response = await fetch('/api/studysessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject_id: selectedSubject.id,
        duration,
        start_time: timerStartTime.toISOString(),
        end_time: new Date().toISOString(),
        is_break: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save session');
    }

    setTimerStartTime(null);
    setCurrentSubjectId(null);
    localStorage.removeItem('studyTimer');
    setSuccess('Study session saved!');
  } catch (error) {
    console.error('Save session error:', error);
    setError(prev => ({ 
      ...prev, 
      general: error instanceof Error ? error.message : 'Failed to save session' 
    }));
  } finally {
    setLoading(prev => ({ ...prev, saving: false }));
  }
}, 1000);

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [noteColor, setNoteColor] = useState<NoteColor>(DEFAULT_COLOR);
  const [title, setTitle] = useState("SELECT A SUBJECT");
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);
  const [showBreakPopup, setShowBreakPopup] = useState(false);
  const [breakType, setBreakType] = useState<'coffee' | 'meal' | null>(null);
  const [loading, setLoading] = useState({
    subjects: false,
    saving: false
  });
  const [error, setError] = useState({
    subjects: '',
    general: ''
  });
  const [success, setSuccess] = useState('');

  // Load saved timer from localStorage
  useEffect(() => {
    const savedTimer = localStorage.getItem('studyTimer');
    if (savedTimer) {
      try {
        const { subjectId, startTime } = JSON.parse(savedTimer);
        const savedDate = new Date(startTime).toDateString();
        const currentDate = new Date().toDateString();
        
        if (savedDate === currentDate && subjectId === selectedSubject?.id) {
          setTimerStartTime(new Date(startTime));
          setCurrentSubjectId(subjectId);
        } else {
          localStorage.removeItem('studyTimer');
        }
      } catch (e) {
        console.error('Error parsing saved timer:', e);
        localStorage.removeItem('studyTimer');
      }
    }
  }, [selectedSubject?.id]);

  // Save timer to localStorage
  useEffect(() => {
    if (timerStartTime && selectedSubject) {
      localStorage.setItem('studyTimer', JSON.stringify({
        subjectId: selectedSubject.id,
        startTime: timerStartTime.toISOString()
      }));
    }
  }, [timerStartTime, selectedSubject]);

  // Fetch subjects with color validation
  const fetchSubjects = useCallback(async () => {
    setLoading(prev => ({ ...prev, subjects: true }));
    setError(prev => ({ ...prev, subjects: '', general: '' }));
    
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      
      const data = await response.json();
      setSubjects(data.map((subject: Subject) => ({
        ...subject,
        notes: subject.notes || '',
        color: getColorClass(subject.color)
      })));
    } catch (error) {
      console.error('Fetch subjects error:', error);
      setError(prev => ({ ...prev, subjects: 'Failed to load subjects' }));
    } finally {
      setLoading(prev => ({ ...prev, subjects: false }));
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Reset timer if subject changes
  useEffect(() => {
    if (selectedSubject?.id && selectedSubject.id !== currentSubjectId) {
      setTimerStartTime(null);
      setCurrentSubjectId(selectedSubject.id);
      localStorage.removeItem('studyTimer');
    }
  }, [selectedSubject, currentSubjectId]);

  const addSubject = async () => {
    if (!newSubject.trim()) {
      setError(prev => ({ ...prev, general: 'Subject name cannot be empty' }));
      return;
    }
    
    setLoading(prev => ({ ...prev, saving: true }));
    setError(prev => ({ ...prev, general: '' }));
    
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSubject.trim(),
          color: DEFAULT_COLOR,
          notes: ''
        })
      });
      
      if (!response.ok) throw new Error('Failed to create subject');
      
      const data = await response.json();
      setSubjects(prev => [...prev, {
        ...data,
        color: getColorClass(data.color)
      }]);
      setNewSubject("");
      setSuccess('Subject added successfully!');
    } catch (error) {
      console.error('Add subject error:', error);
      setError(prev => ({ ...prev, general: 'Failed to add subject' }));
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const saveNotes = async () => {
    if (!selectedSubject) {
      setError(prev => ({ ...prev, general: 'No subject selected' }));
      return;
    }

    setLoading(prev => ({ ...prev, saving: true }));
    setError(prev => ({ ...prev, general: '' }));
    
    try {
      const response = await fetch(`/api/subjects/${selectedSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedSubject.name,
          notes: notes || '',
          color: noteColor
        })
      });
      
      if (!response.ok) throw new Error('Failed to save notes');

      const updatedSubject = await response.json();
      setSubjects(prev => 
        prev.map(subject => 
          subject.id === updatedSubject.id ? {
            ...updatedSubject,
            color: getColorClass(updatedSubject.color)
          } : subject
        )
      );
      setSuccess('Notes saved successfully!');
    } catch (error) {
      console.error('Save notes error:', error);
      setError(prev => ({ ...prev, general: 'Failed to save notes' }));
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleTimerStart = useCallback(() => {
    const now = new Date();
    setTimerStartTime(now);
    setCurrentSubjectId(selectedSubject?.id || null);
    setBreakType(null);
    setSuccess('');
  }, [selectedSubject?.id]);

  const handleCompleteSession = useCallback((duration: number) => {
    debouncedSaveSession(
      duration,
      selectedSubject,
      timerStartTime,
      notes,
      setLoading,
      setError,
      setSuccess,
      setTimerStartTime,
      setCurrentSubjectId
    );
  }, [selectedSubject, timerStartTime, notes]);

  const handleTimerStop = useCallback((duration: number) => {
    if (!selectedSubject || !timerStartTime) return;
    handleCompleteSession(duration);
  }, [selectedSubject, timerStartTime, handleCompleteSession]);

  const handleStartBreak = useCallback((duration: number) => {
    if (!selectedSubject || !timerStartTime) return;
    setShowBreakPopup(true);
  }, [selectedSubject, timerStartTime]);

  const saveBreakSession = useCallback(async (type: 'coffee' | 'meal') => {
    if (!selectedSubject || !timerStartTime) return;
    
    const duration = Math.floor((new Date().getTime() - timerStartTime.getTime()) / 1000);
    
    setLoading(prev => ({ ...prev, saving: true }));
    setError(prev => ({ ...prev, general: '' }));
    
    try {
      const response = await fetch('/api/studysessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: selectedSubject.id,
          duration,
          start_time: timerStartTime.toISOString(),
          end_time: new Date().toISOString(),
          is_break: true,
          break_type: type
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save break session');
      }

      setTimerStartTime(null);
      setBreakType(type);
      localStorage.removeItem('studyTimer');
      setSuccess(`${type === 'coffee' ? 'Coffee' : 'Meal'} break saved! Ready to study again?`);
      setShowBreakPopup(false);
    } catch (error) {
      console.error('Save break error:', error);
      setError(prev => ({ 
        ...prev, 
        general: error instanceof Error ? error.message : 'Failed to save break' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [selectedSubject, timerStartTime]);

  const handleStartStudyAfterBreak = useCallback(() => {
    setSuccess('');
    const now = new Date();
    setTimerStartTime(now);
    setBreakType(null);
  }, []);

  const handleSubjectSelect = useCallback((subject: Subject) => {
    const validColor = getColorClass(subject.color);
    setSelectedSubject({
      ...subject,
      color: validColor
    });
    setNotes(subject.notes || '');
    setNoteColor(validColor);
    setTitle(subject.name.toUpperCase());
    setDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-50">
      {showBreakPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4 shadow-2xl animate-pop-in">
            <h2 className="text-2xl font-bold text-center mb-6 text-pink-600">Break Type</h2>
            <p className="text-center mb-6">Select the type of break you're taking:</p>
            
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => saveBreakSession('coffee')}
                className="px-6 py-3 bg-amber-100 hover:bg-amber-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <span className="mr-2">☕</span> Coffee Break (5 min)
              </button>
              
              <button
                onClick={() => saveBreakSession('meal')}
                className="px-6 py-3 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <span className="mr-2">🍽️</span> Meal Break (30 min)
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Study Tracker</h1>

      {error.general && (
        <div className="w-full max-w-2xl mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error.general}
        </div>
      )}
      {success && (
        <div className="w-full max-w-2xl mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center">
          <span>{success}</span>
          {breakType && (
            <button 
              onClick={handleStartStudyAfterBreak}
              className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Start Studying
            </button>
          )}
        </div>
      )}

      {!selectedSubject ? (
        <>
          <div className="w-full max-w-md mb-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter subject name"
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading.saving}
              />
              <button 
                onClick={addSubject}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={loading.saving || !newSubject.trim()}
              >
                {loading.saving ? 'Adding...' : 'Add'}
              </button>
            </div>

            {loading.subjects ? (
              <div className="p-4 text-center text-gray-500">Loading subjects...</div>
            ) : error.subjects ? (
              <div className="p-4 text-center text-red-500">{error.subjects}</div>
            ) : (
              <ul className="space-y-2">
                {subjects.map((subject) => (
                  <li key={`subject-${subject.id}`}>
                    <button
                      onClick={() => handleSubjectSelect(subject)}
                      className="w-full p-3 text-left bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <span 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ 
                          backgroundColor: colorMap[subject.color || DEFAULT_COLOR].replace('bg-', '').replace('-100', '')
                        }}
                      />
                      <span className="font-medium">{subject.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <Timer 
              subject={selectedSubject.name} 
              onStart={handleTimerStart}
              onStop={handleTimerStop}
              onBreak={handleStartBreak}
              initialStartTime={timerStartTime}
              disabled={loading.saving}
            />
          </div>

          <div className={`p-6 rounded-lg shadow-lg ${colorMap[noteColor]} ${textColorMap[noteColor]}`}>
            <div className="flex justify-center gap-2 mb-4">
              {(Object.keys(colorMap) as NoteColor[]).map(color => (
                <button
                  key={`color-${color}`}
                  onClick={() => setNoteColor(color)}
                  className={`w-6 h-6 rounded-full transition-all ${
                    color === noteColor ? 'ring-2 ring-gray-800 scale-110' : 'opacity-70 hover:opacity-100'
                  } ${colorMap[color]}`}
                  disabled={loading.saving}
                  aria-label={`${color} note color`}
                />
              ))}
            </div>

            <div className="text-center mb-6">
              <div className="text-xs text-gray-600 mb-1">Study Notes</div>
              <div className="text-2xl font-bold tracking-wide mb-2">{title}</div>
              <div className="flex justify-between items-center text-sm">
                <span>Date: {date}</span>
                <div className="flex gap-1">
                  {['M', 'T', 'W', 'Th', 'F', 'S', 'Su'].map(day => (
                    <span key={`day-${day}`} className="w-5 text-center">{day}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 border rounded-lg h-64 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your notes here..."
              style={{ backgroundColor: 'inherit' }}
              disabled={loading.saving}
            />
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  saveNotes();
                  setSelectedSubject(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
                disabled={loading.saving}
              >
                {loading.saving ? 'Saving...' : 'Back to Subjects'}
              </button>
              <button
                onClick={saveNotes}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                disabled={loading.saving}
              >
                {loading.saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}