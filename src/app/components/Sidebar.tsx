"use client";

import Link from "next/link";
import { X, Menu } from "lucide-react";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListIcon from "@mui/icons-material/List";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import LockClockIcon from '@mui/icons-material/LockClock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import Tooltip from '@mui/material/Tooltip';

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userRole?: number; // 2 for normal user, 3 for pro user
};

export default function Sidebar({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  userRole = 2 
}: SidebarProps) {
  return (
    <>
      {/* Mobile toggle button */}
      {!isSidebarOpen ? (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="button fixed top-2.5 left-4 z-50 transition-opacity duration-200"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      ) : (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="button fixed top-2.5 left-4 z-50 transition-opacity duration-200"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar p-4 fixed h-full top-0 left-0 z-10 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: '13rem' }}
      >
        <ul className="mt-20">
          <li className="mb-10 flex items-center">
            <HomeIcon className="mr-4 text-white" /> 
            <Link href="/" className="text-white hover:text-gray-400">Dashboard</Link>
          </li>
          <li className="mb-10 flex items-center">
            <CalendarTodayIcon className="mr-4 text-white" /> 
            <Link href="/calendar" className="text-white hover:text-gray-400">Calendar</Link>
          </li>
          <li className="mb-10 flex items-center">
            <ListIcon className="mr-4 text-white" /> 
            <Link href="/todo" className="text-white hover:text-gray-400">To-do List</Link>
          </li>
          <li className="mb-10 flex items-center">
            <EditCalendarIcon className="mr-4 text-white" /> 
            <Link href="/timetable" className="text-white hover:text-gray-400">Timetable</Link>
          </li>
          <li className="mb-10 flex items-center">
            <AutoStoriesIcon className="mr-4 text-white"/>
            <Link href="/studysession" className="text-white hover:text-gray-400">Study Session</Link>
          </li>
          
          {/* Focus Session - Conditionally rendered based on user role */}
          <li className="mb-10 flex items-center">
            {userRole === 3 ? (
              <>
                <LockClockIcon className="mr-4 text-white"/>
                <Link href="/focus" className="text-white hover:text-gray-400">Focus Session</Link>
              </>
            ) : (
              <Tooltip title="Upgrade to Pro to unlock" arrow>
                <div className="flex items-center text-gray-400 cursor-not-allowed">
                  <LockIcon className="mr-4"/>
                  <span>Focus Session (Pro)</span>
                </div>
              </Tooltip>
            )}
          </li>
          
          <li className="mb-10 flex items-center">
            <AccountCircleIcon className="mr-4 text-white"/>
            <Link href="/userReport" className="text-white hover:text-gray-400">User Report</Link>
          </li>
          <li className="mb-10 flex items-center">
            <AccountCircleIcon className="mr-4 text-white"/>
            <Link href="/profile" className="text-white hover:text-gray-400">Profile</Link>
          </li>
        </ul>
      </div>
    </>
  );
}