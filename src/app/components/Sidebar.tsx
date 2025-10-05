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
import InfoIcon from "@mui/icons-material/Info";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
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
        className="fixed top-2.5 left-4 z-50 transition-opacity duration-200 bg-[#f0eeee] p-2 rounded-md shadow-md"
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay - Only visible on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed h-full top-0 left-0 bg-[#3d312e] p-4 transform transition-transform duration-300 z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "13rem" }}
      >
        <ul className="mt-20">
          {/* Always accessible */}
          <NavItem icon={<HomeIcon className="mr-4 text-[#f0eeee]" />} href="/" title="Dashboard" />
          <NavItem icon={<CalendarTodayIcon className="mr-4 text-[#f0eeee]" />} href="/calendar" title="Calendar" />
          <NavItem icon={<ListIcon className="mr-4 text-[#f0eeee]" />} href="/todo" title="To-do List" />
          <NavItem icon={<EditCalendarIcon className="mr-4 text-[#f0eeee]" />} href="/timetable" title="Timetable" />
          <NavItem icon={<AutoStoriesIcon className="mr-4 text-[#f0eeee]" />} href="/studysession" title="Study Session" />
          
          {isProUser ? (
            <NavItem icon={<LockClockIcon className="mr-4 text-[#f0eeee]" />} href="/focus" title="Focus Session" />
          ) : (
            <Tooltip title="Upgrade to Pro to unlock Focus Session" arrow>
              <li className="mb-10 flex items-center text-[#bba2a2] cursor-not-allowed">
                <LockIcon className="mr-4 text-[#bba2a2]" />
                <span>Focus Session (Pro)</span>
              </li>
            </Tooltip>
          )}

          {isProUser ? (
            <NavItem icon={<SchoolIcon className="mr-4 text-[#f0eeee]" />} href="/vocab" title="Vocabulary Study" />
          ) : (
            <Tooltip title="Upgrade to Pro to unlock Vocabulary Study" arrow>
              <li className="mb-10 flex items-center text-[#bba2a2] cursor-not-allowed">
                <LockIcon className="mr-4 text-[#bba2a2]" />
                <span>Vocabulary Study (Pro)</span>
              </li>
            </Tooltip>
          )}

          <NavItem icon={<AssessmentIcon className="mr-4 text-[#f0eeee]" />} href="/userReport" title="User Report" />
          <NavItem icon={<PersonIcon className="mr-4 text-[#f0eeee]" />} href="/Userprofile" title="Profile" />
          
          {/* About Us added under Profile */}
          <NavItem icon={<InfoIcon className="mr-4 text-[#f0eeee]" />} href="/aboutUs" title="About Us" />
        </ul>
      </div>
    </>
  );
} 

function NavItem({ icon, href, title }: { icon: React.ReactNode; href: string; title: string }) {
  return (
    <li className="mb-10 flex items-center">
      {icon}
      <Link href={href} className="text-[#f0eeee] hover:text-[#bba2a2]">
        {title}
      </Link>
    </li>
  );
}