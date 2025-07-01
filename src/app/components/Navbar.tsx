// src/components/Navbar.tsx
import { Menu, X } from "lucide-react";
import Link from "next/link";

type NavbarProps = {
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>; // Made optional with ?
};

export default function Navbar({ setIsSidebarOpen }: NavbarProps) {
  return (
    <nav className="navbar py-6 text-center font-bold relative w-full">
      <div className="flex justify-between items-center w-full">
        {/* Left Side */}
        <div className="text-xl flex-1 text-center">
          <p>Study-With-Me</p>
        </div>  

        {/* Right Side */}
        <div className="flex space-x-6 mr-8">
          <Link href="/logIn" className="hover:underline">Log In</Link>
          <Link href="/aboutUs" className="hover:underline">About Us</Link>
        </div>
      </div>
    </nav>
  );
}