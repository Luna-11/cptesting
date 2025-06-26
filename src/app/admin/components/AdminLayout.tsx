'use client';
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { ActiveTab } from '../type'; // Ensure correct import

export default function AdminLayout({
  children,
  activeTab,
  setActiveTab,
}: {
  children: ReactNode;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}) {
  return (
    <div className="flex h-screen bg-[#f0eeee]">
      {/* Only one Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <section className="p-6">
          {children}
        </section>
      </main>
    </div>
  );
}