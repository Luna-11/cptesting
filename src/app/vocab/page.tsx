"use client";

import { useState, useEffect } from "react";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";

type VocabStatus = "toStudy" | "studying" | "done";

type Vocabulary = {
  id: number;
  word: string;
  definition: string;
  status: VocabStatus;
  important: boolean;
};

export default function VocabularyBoard() {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [wordInput, setWordInput] = useState("");
  const [defInput, setDefInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch vocabulary on component mount
  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch('/api/vocabulary');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login again');
        }
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      setVocabList(data);
    } catch (error: any) {
      console.error('Failed to fetch vocabulary:', error);
      setError(error.message || 'Failed to load vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const addVocab = async () => {
    if (!wordInput.trim() || !defInput.trim()) return;

    try {
      setError("");
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: wordInput.trim(),
          definition: defInput.trim(),
          status: 'toStudy',
          important: false
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login again');
        }
        throw new Error(`Failed to add: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the list to get the latest data from server
        fetchVocabulary();
        setWordInput("");
        setDefInput("");
      }
    } catch (error: any) {
      console.error('Failed to add vocabulary:', error);
      setError(error.message || 'Failed to add word');
    }
  };

  const deleteVocab = async (id: number) => {
    try {
      setError("");
      const response = await fetch(`/api/vocabulary?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login again');
        }
        throw new Error(`Failed to delete: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.deleted) {
        // Refresh the list to get the latest data from server
        fetchVocabulary();
      }
    } catch (error: any) {
      console.error('Failed to delete vocabulary:', error);
      setError(error.message || 'Failed to delete word');
    }
  };

  const editVocab = async (id: number) => {
    const vocab = vocabList.find((v) => v.id === id);
    if (!vocab) return;

    const newWord = prompt("Edit word:", vocab.word);
    const newDef = prompt("Edit definition:", vocab.definition);

    if (newWord && newDef) {
      try {
        setError("");
        const response = await fetch('/api/vocabulary', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            word: newWord,
            definition: newDef
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please login again');
          }
          throw new Error(`Failed to update: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          // Refresh the list to get the latest data from server
          fetchVocabulary();
        }
      } catch (error: any) {
        console.error('Failed to update vocabulary:', error);
        setError(error.message || 'Failed to update word');
      }
    }
  };

  const toggleImportant = async (id: number) => {
    const vocab = vocabList.find((v) => v.id === id);
    if (!vocab) return;

    try {
      setError("");
      const response = await fetch('/api/vocabulary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          important: !vocab.important
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login again');
        }
        throw new Error(`Failed to update: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the list to get the latest data from server
        fetchVocabulary();
      }
    } catch (error: any) {
      console.error('Failed to toggle importance:', error);
      setError(error.message || 'Failed to update importance');
    }
  };

  const handleStatusChange = async (id: number, newStatus: VocabStatus) => {
    try {
      setError("");
      const response = await fetch('/api/vocabulary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login again');
        }
        throw new Error(`Failed to update: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the list to get the latest data from server
        fetchVocabulary();
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      setError(error.message || 'Failed to update status');
    }
  };

  const getStepFromStatus = (status: VocabStatus): number => {
    switch (status) {
      case "toStudy":
        return 1;
      case "studying":
        return 2;
      case "done":
        return 3;
      default:
        return 1;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mt-20"></div>
          <p className="mt-4 text-gray-600">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  return (  
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#3d312e;] mb-3">Vocabulary Study</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError("")}
                className="absolute top-0 right-0 p-2"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Input form */}
        <div className="bg-[#f0eeee] rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Vocabulary</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Word</label>
              <input
                type="text"
                placeholder="Enter word"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addVocab()}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Definition</label>
              <input
                type="text"
                placeholder="Enter definition"
                value={defInput}
                onChange={(e) => setDefInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addVocab()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addVocab}
                disabled={!wordInput.trim() || !defInput.trim()}
                className="bg-[#3d312e] text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors w-full md:w-auto disabled:bg-[#3d312e] disabled:cursor-not-allowed"
              >
                Add Word
              </button>
            </div>
          </div>
        </div>

        {/* Vocabulary cards */}
        {vocabList.length === 0 ? (
          <div className="bg-[#f0eeee] rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No vocabulary added yet</h3>
            <p className="text-gray-500">Start by adding your first word above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocabList.map((vocab) => {
              const step = getStepFromStatus(vocab.status);

        return (
        <div
            key={vocab.id}
          className={`relative bg-[#f0eeee] rounded-xl shadow-md overflow-visible transition-all hover:shadow-lg ${
            vocab.important ? "ring-2 ring-yellow-400" : ""
          }`}
          >
            {/* Hanging cat image - sits above the header */}
            <div className="absolute -top-3 left-1 z-5">
              <Image
                src="/c2.png"
                alt="Hanging cat"
                width={74}
                height={74}
                className="object-contain"
              />
            </div>  

                {/* Card header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {/* Star button (left-most) */}
                    <button
                      onClick={() => toggleImportant(vocab.id)}
                      className="p-1 rounded-full hover:bg-yellow-50 transition-colors"
                    >
                      {vocab.important ? (
                        <StarIconSolid className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <StarIconOutline className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    {/* Status pill */}
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#bba2a2] text-[#f0eeee]">
                      {vocab.status === "toStudy"
                        ? "To Study"
                        : vocab.status === "studying"
                        ? "Studying"
                        : "Done"}
                    </span>
                  </div>

                  {/* Edit + Delete */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => editVocab(vocab.id)}
                      className="text-indigo-600 hover:text-indigo-800 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteVocab(vocab.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                  
                  {/* Card content */}
                  <div className="p-5">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{vocab.word}</h3>
                      <p className="text-gray-600">{vocab.definition}</p>
                    </div>
                    
                    {/* Progress bar with icons */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Learning Progress</span>
                        <span className="text-xs font-medium text-indigo-600">{step}/3</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#3d312e] h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#3d312e] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <span className="text-xs font-bold">1</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#3d312e] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <span className="text-xs font-bold">2</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#3d312e] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <span className="text-xs font-bold">3</span>
                        </div>
                      </div>
                      
                      <select
                        value={vocab.status}
                        onChange={(e) =>
                          handleStatusChange(vocab.id, e.target.value as VocabStatus)
                        }
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#bba2a2] focus:border-transparent"
                      >
                        <option value="toStudy">To Study</option>
                        <option value="studying">Studying</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}