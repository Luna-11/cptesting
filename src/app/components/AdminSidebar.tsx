import Link from "next/link";
import { X, Menu } from "lucide-react";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListIcon from "@mui/icons-material/List";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import LockClockIcon from '@mui/icons-material/LockClock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-2.5 left-4 z-50 transition-opacity duration-200"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Panel */}
      <div
        className={`p-4 fixed h-full top-0 left-0 z-10 transform transition-transform duration-300 bg-gray-900 text-white
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:relative lg:w-64`}
      >
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          <li>
            <Link href="/" className="flex items-center gap-2 hover:text-gray-400">
              <HomeIcon /> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/calendar" className="flex items-center gap-2 hover:text-gray-400">
              <CalendarTodayIcon /> Calendar
            </Link>
          </li>
          <li>
            <Link href="/todo" className="flex items-center gap-2 hover:text-gray-400">
              <ListIcon /> To-do List
            </Link>
          </li>
          <li>
            <Link href="/timetable" className="flex items-center gap-2 hover:text-gray-400">
              <EditCalendarIcon /> Timetable
            </Link>
          </li>
          <li>
            <Link href="/studysession" className="flex items-center gap-2 hover:text-gray-400">
              <AutoStoriesIcon /> Study Session
            </Link>
          </li>
          <li>
            <Link href="/focus" className="flex items-center gap-2 hover:text-gray-400">
              <LockClockIcon /> Focus Session
            </Link>
          </li>
          <li>
            <Link href="/profile" className="flex items-center gap-2 hover:text-gray-400">
              <AccountCircleIcon /> Profile
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
