
import Link from "next/link";
import { X, Menu } from "lucide-react"; // Import both icons
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListIcon from "@mui/icons-material/List";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SettingsIcon from "@mui/icons-material/Settings";

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Conditionally render either the hamburger or close button */}
      {!isSidebarOpen ? (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="button fixed top-2.5 left-4 z-50 transition-opacity duration-200"
        >
          <Menu size={24} />
        </button>
      ) : (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="button fixed top-2.5 left-4 z-50 transition-opacity duration-200"
        >
          <X size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar w-64 p-4 fixed h-full top-0 left-0 z-10 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <ul className="mt-20">

          <li className="mb-10">
            <Link href="/" className="text-white hover:text-gray-400">Dashboard</Link>
          </li>
          <li className="mb-10">
            <Link href="/calendar" className="text-white hover:text-gray-400">Calendar</Link>
          </li>
          <li className="mb-10">
            <Link href="/todo" className="text-white hover:text-gray-400">To-do List</Link>
          </li>
          <li className="mb-10">
            <Link href="/timetable" className="text-white hover:text-gray-400">Timetable</Link>
          </li>
          <li className="mb-10">
            <Link href="/studysession" className="text-white hover:text-gray-400">Study Session</Link>
          </li>
          <li className="mb-10">
            <Link href="/profile" className="text-white hover:text-gray-400">Profile</Link>
          </li>

    </ul>
    <ul className="mt-60">
      <li className="mb-10">
        Log Out
      </li>
    </ul>

      </div>
    </>
  );
}
