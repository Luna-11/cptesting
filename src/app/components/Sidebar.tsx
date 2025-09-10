"use client";

import Link from "next/link";
import { X, Menu } from "lucide-react";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListIcon from "@mui/icons-material/List";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import LockClockIcon from "@mui/icons-material/LockClock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import Tooltip from "@mui/material/Tooltip";

export enum UserRole {
  BASIC = "user",
  PRO = "pro",
  ADMIN = "admin",
}

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userRole: UserRole;
};

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  userRole,
}: SidebarProps) {
  const isProUser = userRole === UserRole.PRO || userRole === UserRole.ADMIN;

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="button fixed top-2.5 left-4 z-50 transition-opacity duration-200"
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar p-4 fixed h-full top-0 left-0 z-10 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "13rem" }}
      >
        <ul className="mt-20">
          {/* Always accessible */}
          <NavItem icon={<HomeIcon className="mr-4 text-white" />} href="/" title="Dashboard" />
          <NavItem icon={<CalendarTodayIcon className="mr-4 text-white" />} href="/calendar" title="Calendar" />
          <NavItem icon={<ListIcon className="mr-4 text-white" />} href="/todo" title="To-do List" />
          <NavItem icon={<EditCalendarIcon className="mr-4 text-white" />} href="/timetable" title="Timetable" />
          <NavItem icon={<AutoStoriesIcon className="mr-4 text-white" />} href="/studysession" title="Study Session" />
          {isProUser ? (
            <NavItem icon={<LockClockIcon className="mr-4 text-white" />} href="/focus" title="Focus Session" />
          ) : (
            <Tooltip title="Upgrade to Pro to unlock Focus Session" arrow>
              <li className="mb-10 flex items-center text-gray-400 cursor-not-allowed">
                <LockIcon className="mr-4 text-white" />
                <span>Focus Session (Pro)</span>
              </li>
            </Tooltip>
          )}

                    {isProUser ? (
            <NavItem icon={<LockClockIcon className="mr-4 text-white" />} href="/vocab" title="Vocabulary Study" />
          ) : (
            <Tooltip title="Upgrade to Pro to unlock Focus Session" arrow>
              <li className="mb-10 flex items-center text-gray-400 cursor-not-allowed">
                <LockIcon className="mr-4 text-white" />
                <span>Focus Session (Pro)</span>
              </li>
            </Tooltip>
          )}

          <NavItem icon={<AccountCircleIcon className="mr-4 text-white" />} href="/userReport" title="User Report" />
          <NavItem icon={<AccountCircleIcon className="mr-4 text-white" />} href="/Userprofile" title="Profile" />
        </ul>
      </div>
    </>
  );
} 

function NavItem({ icon, href, title }: { icon: React.ReactNode; href: string; title: string }) {
  return (
    <li className="mb-10 flex items-center">
      {icon}
      <Link href={href} className="text-white hover:text-gray-400">
        {title}
      </Link>
    </li>
  );
}
  