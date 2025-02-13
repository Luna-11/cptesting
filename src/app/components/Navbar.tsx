// src/components/Navbar.tsx
import { Menu, X } from "lucide-react";

type NavbarProps = {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ setIsSidebarOpen }: NavbarProps) {
  return (
    <nav className="bg-blue-600 text-white py-4 text-center text-xl font-bold relative w-full">
      <button
        onClick={() => setIsSidebarOpen((prev) => !prev)} // Toggle the sidebar
        className="absolute left-4 top-1/2 transform -translate-y-1/2"
      >
        <Menu size={24} />
      </button>
      <p>Study-With-Me</p>
      
    </nav>
  );
}
