import Link from "next/link";
import { X, Menu } from "lucide-react"; // Import both icons

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
          className="text-white fixed top-4 left-4 z-50 transition-opacity duration-200"
        >
          <Menu size={24} />
        </button>
      ) : (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-white fixed top-4 left-4 z-50 transition-opacity duration-200"
        >
          <X size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white w-64 p-4 fixed h-full top-0 left-0 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
              To-do List
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/timetable" className="text-white hover:text-gray-400">
              Timetable
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/VR" className="text-white hover:text-gray-400">
              Timer
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/settings" className="text-white hover:text-gray-400">
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
