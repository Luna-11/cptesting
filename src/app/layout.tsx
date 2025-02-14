// src/app/layout.tsx

"use client";
import { Analytics } from "@vercel/analytics/react"


import { ReactNode, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import "./globals.css"; // Import the global styles here

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
