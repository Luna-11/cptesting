'use client';
import { Activity } from '../type';
import { FaBook } from 'react-icons/fa';

interface ActivityItemProps {
  activity: Activity;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div 
      className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
      style={{ backgroundColor: '#f0eeee' }}
    >
      <div 
        className="mt-1 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md"
        style={{ backgroundColor: '#bba2a2', color: '#3d312e' }}
      >
        <FaBook className="text-sm" />
      </div>
      <div>
        <p className="text-sm" style={{ color: '#3d312e' }}>
          <span className="font-medium">{activity.user}</span> {activity.action}
        </p>
        <p className="text-xs mt-1" style={{ color: '#948585' }}>{activity.time}</p>
      </div>
    </div>
  );
}