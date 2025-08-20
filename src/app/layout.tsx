"use client";

import { Work_Sans } from "next/font/google";
import { ReactNode, useState } from "react";
import Sidebar, { UserRole } from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import "./globals.css";

const workSans = Work_Sans({ 
  subsets: ["latin"], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-work-sans'
});

function AuthWrapper({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // routes where we don’t show sidebar/navbar
  const isAuthRoute = () => {
    const authRoutes = ['/register', '/logIn', '/admin'];
    return authRoutes.some(route => pathname?.startsWith(route));
  };

  // safely determine role from session
  const userRole = session?.user?.role
    ? (Number(session.user.role) as UserRole)
    : UserRole.BASIC;

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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={workSans.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
