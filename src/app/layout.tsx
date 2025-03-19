"use client";
import { Work_Sans } from "next/font/google";
import { ReactNode, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import "./globals.css"; // Import the global styles here

const workSans = Work_Sans({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });

export default function Layout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="h-full">
        <div className="flex h-full">
          {/* Sidebar */}
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

          {/* Main Content */}
          <div className="flex flex-col flex-1">
            {/* Navbar */}
            <Navbar setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main content (Children will be rendered here) */}
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
