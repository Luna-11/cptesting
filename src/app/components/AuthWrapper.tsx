// src/components/AuthWrapper.tsx
"use client";

import { ReactNode, useState } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

// Update the props interface
interface AuthWrapperProps {
  children: ReactNode;
  userRole: UserRole;
  isAuthenticated?: boolean;
}

export default function AuthWrapper({ 
  children, 
  userRole,
  isAuthenticated = false 
}: AuthWrapperProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Debug: log the current pathname
  console.log('Current pathname:', pathname);

  // routes where we don't show sidebar/navbar
  const isAuthRoute = () => {
    const authRoutes = ['/register', '/login'];
    return authRoutes.some(route => pathname?.startsWith(route));
  };

  // Check if it's an admin route
  const isAdminRoute = pathname === '/Admin' || 
                      pathname?.startsWith('/Admin/') ||
                      pathname?.includes('/Admin');

  // Debug: log what routes are detected
  console.log('Is auth route:', isAuthRoute());
  console.log('Is admin route:', isAdminRoute);
  console.log('Is authenticated:', isAuthenticated);
  console.log('User role:', userRole);

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
        // Regular pages - conditionally show sidebar based on authentication
        <div className="flex min-h-screen w-full">
          {/* Sidebar - Only show for authenticated users */}
          {isAuthenticated && (
            <Sidebar 
              isSidebarOpen={isSidebarOpen} 
              setIsSidebarOpen={setIsSidebarOpen}
              userRole={userRole}
            />
          )}
          
          <div className={`flex flex-1 flex-col ${isAuthenticated ? '' : 'w-full'}`}>
            {/* Navbar - Always show but pass authentication status */}
            <Navbar 
              setIsSidebarOpen={setIsSidebarOpen}
              userRole={userRole}
              isAuthenticated={isAuthenticated}
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