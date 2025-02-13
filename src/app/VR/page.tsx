"use client";
import { useState } from "react";

export default function ValentineRequest() {
  const [yesSize, setYesSize] = useState(16);
  const [noSize, setNoSize] = useState(16);
  const [accepted, setAccepted] = useState(false);

  const handleNoClick = () => {
    setYesSize((prev) => prev + 10);
    setNoSize((prev) => Math.max(prev - 5, 5));
  };

  const handleYesClick = () => {
    setAccepted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      {accepted ? (
        <h1 className="text-2xl font-bold">Yay! Happy Valentine's Day! ❤️</h1>
      ) : (
        <>
          <h1 className="text-xl font-semibold">Will you be my Valentine? 💖</h1>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleYesClick}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg transition-all"
              style={{ fontSize: `${yesSize}px` }}
            >
              Yes
            </button>
            <button
              onClick={handleNoClick}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg transition-all"
              style={{ fontSize: `${noSize}px` }}
            >
              No
            </button>
          </div>
        </>
      )}
    </div>
  );
}
