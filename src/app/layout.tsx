"use client";
import { Work_Sans } from "next/font/google";
import { ReactNode, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";
import "./globals.css";

// Font configuration moved outside the component
const workSans = Work_Sans({ 
  subsets: ["latin"], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-work-sans'
});

export default function Layout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // Improved auth route handling
  const isAuthRoute = () => {
    const authRoutes = ['/register', '/logIn', '/admin'];
    return authRoutes.some(route => pathname?.startsWith(route));
  };

  return (
    <html lang="en" className={workSans.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {isAuthRoute() ? (
          // Auth layout - simple centered container
          <main className="flex min-h-screen flex-col items-center justify-center">
            {children}
          </main>
        ) : (
          // Main app layout with sidebar and navbar
          <div className="flex min-h-screen w-full">
            <Sidebar 
              isSidebarOpen={isSidebarOpen} 
              setIsSidebarOpen={setIsSidebarOpen} 
            />
            
            <div className="flex flex-1 flex-col">
              <Navbar setIsSidebarOpen={setIsSidebarOpen} />
              
              <main className="flex flex-1 flex-col overflow-hidden">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
  
}