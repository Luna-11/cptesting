'use client';
import { ActiveTab } from '../type';
import { FaUsers, FaClipboardList, FaCog, FaChartPie, FaDollarSign, FaBell } from 'react-icons/fa';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 p-6 flex flex-col" style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}>
      {/* Single logo instance */}
      <div className="text-xl font-bold mb-6 flex items-center gap-2">
        <img 
          src="/study-with-me-logo.png" 
          alt="Study With Me Logo"
          className="h-8 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <span className="sr-only">Study With Me</span>
      </div>
      
      <nav className="flex flex-col gap-2">
        {[
          { icon: <FaChartPie />, label: "Dashboard", tab: "dashboard" },
          { icon: <FaUsers />, label: "User Accounts", tab: "users" },
          { icon: <FaDollarSign />, label: "Subscriptions", tab: "subscriptions" },
          { icon: <FaClipboardList />, label: "Reports", tab: "reports" },
          { icon: <FaBell />, label: "User Engagement", tab: "engagement" },
          { icon: <FaCog />, label: "Settings", tab: "settings" },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab as ActiveTab)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.tab
                ? "bg-[#948585] text-white shadow-md" 
                : "text-[#bba2a2] hover:bg-[#3d312e] hover:text-white hover:shadow-lg"
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}