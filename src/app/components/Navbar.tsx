// src/components/Navbar.tsx
import { Menu, X } from "lucide-react";
import Link from "next/link";

type NavbarProps = {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ setIsSidebarOpen }: NavbarProps) {
  return (
    <nav className="navbar  py-6 text-center font-bold relative w-full">
      <div className="flex justify-between items-center w-full">
        {/* Left Side */}
        <div className="navbar text-xl flex-1 text-center">
          <p>Study-With-Me</p>
        </div>  

        {/* Right Side */}
        <div className="navbar flex space-x-6 mr-8">
        <p>Sign In</p><link rel="stylesheet" href="/" />
        <p>About Us</p> 
        </div>
      </div>
    </nav>
  );
}
