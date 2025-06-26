'use client';
import { User } from '../type';

interface UserCardProps {
  user: User;
  rank: number;
}

export default function UserCard({ user, rank }: UserCardProps) {
  const rankColors = [
    '#3d312e', // First place
    '#948585', // Second place
    '#bba2a2'  // Third place
  ];
  
  return (
    <div 
      className="rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium transition-all duration-200 hover:shadow-md"
            style={{ backgroundColor: rankColors[rank - 1] }}
          >
            {rank}
          </div>
          <div>
            <h3 className="font-medium" style={{ color: '#3d312e' }}>{user.name}</h3>
            <p className="text-sm" style={{ color: '#948585' }}>{user.email}</p>
          </div>
        </div>
        <span 
          className="text-xs px-2 py-1 rounded-full transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: '#bba2a2', color: '#3d312e' }}
        >
          {user.studyHours} hours
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p style={{ color: '#948585' }}>Tasks</p>
          <p style={{ color: '#3d312e' }}>{user.completedTasks}</p>
        </div>
        <div>
          <p style={{ color: '#948585' }}>Streak</p>
          <p style={{ color: '#3d312e' }}>{user.streak} days</p>
        </div>
      </div>
    </div>
  );
}