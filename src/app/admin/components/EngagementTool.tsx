'use client';
import { ReactNode } from 'react';

interface EngagementToolProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionText: string;
  onClick?: () => void;
}

export default function EngagementTool({
  title,
  description,
  icon,
  actionText,
  onClick
}: EngagementToolProps) {
  return (
    <div 
      className="rounded-lg p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="p-3 rounded-lg transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: '#bba2a2', color: '#3d312e' }}
        >
          {icon}
        </div>
        <h3 className="font-medium" style={{ color: '#3d312e' }}>{title}</h3>
      </div>
      <p className="text-sm mb-4" style={{ color: '#948585' }}>{description}</p>
      <button 
        onClick={onClick}
        className="w-full px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-90"
        style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
      >
        {actionText}
      </button>
    </div>
  );
}