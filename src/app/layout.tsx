"use client";
import { Work_Sans } from "next/font/google";
import { ReactNode, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";
import "./globals.css";

const workSans = Work_Sans({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });

export default function Layout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // Routes where we don't want sidebar and navbar
  const authRoutes = ['/register', '/logIn', '/admin'];
  const isAuthRoute = authRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className={workSans.className}>
        {isAuthRoute ? (
          // For auth routes, just render the children
          <div className="h-full">{children}</div>
        ) : (
          // For other routes, use the full layout with sidebar and navbar
          <div className="flex h-full">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex flex-col flex-1">
              <Navbar setIsSidebarOpen={setIsSidebarOpen} />
              <div className="flex-1">{children}</div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}