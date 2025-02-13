// src/components/Sidebar.tsx
import Link from "next/link"; 
import { X } from "lucide-react";

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  return (
    <div
      className={`bg-gray-800 text-white w-64 p-4 fixed h-full top-0 left-0 transform transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        onClick={() => setIsSidebarOpen(false)} // Close sidebar when X is clicked
        className="text-white absolute top-4 right-4"
      >
        <X size={24} /> {/* Display the X icon */}
      </button>
      <ul className="mt-12">
        <li className="mb-4">
          <Link href="/" className="text-white hover:text-gray-400">
            Dashboard
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/calendar" className="text-white hover:text-gray-400">
            Calendar
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/todo" className="text-white hover:text-gray-400">
            to-do-list
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/timetable" className="text-white hover:text-gray-400">
            timetable
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/settings" className="text-white hover:text-gray-400">
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}
