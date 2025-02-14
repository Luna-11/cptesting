// src/components/Navbar.tsx
import { Menu, X } from "lucide-react";

type NavbarProps = {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ setIsSidebarOpen }: NavbarProps) {
  return (
    <nav className="bg-blue-300 text-black py-4 text-center text-xl font-bold relative w-full">

      <p>Study-With-Me</p>
      
    </nav>
  );
}
