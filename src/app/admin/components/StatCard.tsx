'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend: string;
}

export default function StatCard({ title, value, unit = "", icon, trend }: StatCardProps) {
  return (
    <div 
      className="rounded-xl p-6 flex items-start justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: '#948585' }}>{title}</p>
        <p className="mt-1 text-2xl font-semibold" style={{ color: '#3d312e' }}>
          {value} {unit && <span className="text-sm font-normal" style={{ color: '#948585' }}>{unit}</span>}
        </p>
        <p className="mt-1 text-xs" style={{ color: '#948585' }}>{trend}</p>
      </div>
      <div 
        className="p-3 rounded-lg transition-all duration-200 hover:shadow-md" 
        style={{ backgroundColor: '#bba2a2', color: '#3d312e' }}
      >
        {icon}
      </div>
    </div>
  );
}