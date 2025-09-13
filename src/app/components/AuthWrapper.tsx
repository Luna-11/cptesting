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

  // Debug: log the current pathname
  console.log('Current pathname:', pathname);

  // routes where we don't show sidebar/navbar
  const isAuthRoute = () => {
    const authRoutes = ['/register', '/login'];
    return authRoutes.some(route => pathname?.startsWith(route));
  };

  // Check if it's an admin route - use correct case for your folder
  const isAdminRoute = pathname === '/Admin' || 
                      pathname?.startsWith('/Admin/') ||
                      pathname?.includes('/Admin');

  // Debug: log what routes are detected
  console.log('Is auth route:', isAuthRoute());
  console.log('Is admin route:', isAdminRoute);

  return (
    <>
      {isAuthRoute() ? (
        // Auth pages (login/register) - no sidebar/navbar
        <main className="flex min-h-screen flex-col items-center justify-center">
          {children}
        </main>
      ) : isAdminRoute ? (
        // Admin pages - no sidebar/navbar, but different styling
        <div className="min-h-screen bg-gray-100">
          {children}
        </div>
      ) : (
        // Regular pages - with sidebar and navbar
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