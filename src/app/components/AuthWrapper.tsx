"use client";

import { ReactNode, useState } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

export default function AuthWrapper({ 
  children, 
  userRole 
}: { 
  children: ReactNode; 
  userRole: UserRole; 
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // routes where we don’t show sidebar/navbar
  const isAuthRoute = () => {
    const authRoutes = ['/register', '/logIn', '/admin'];
    return authRoutes.some(route => pathname?.startsWith(route));
  };

  return (
    <>
      {isAuthRoute() ? (
        <main className="flex min-h-screen flex-col items-center justify-center">
          {children}
        </main>
      ) : (
        <div className="flex min-h-screen w-full">
          {/* Sidebar gets role */}
          <Sidebar 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen}
            userRole={userRole}
          />
          
          <div className="flex flex-1 flex-col">
            {/* Navbar also gets role */}
            <Navbar 
              setIsSidebarOpen={setIsSidebarOpen}
              userRole={userRole}
            />
            
            <main className="flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      )}
    </>
  );
}
