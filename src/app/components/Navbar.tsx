// src/components/Navbar.tsx
import { Menu, X } from "lucide-react";

type NavbarProps = {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ setIsSidebarOpen }: NavbarProps) {
  return (
    <nav className="navbar text-black py-6 text-center text-xl font-bold relative w-full">

      <p>Study-With-Me</p>
      
    </nav>
  );
}
