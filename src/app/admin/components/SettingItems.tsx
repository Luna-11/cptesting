'use client';

interface SettingItemProps {
  title: string;
  description: string;
}

export default function SettingItem({ title, description }: SettingItemProps) {
  return (
    <div 
      className="pb-4 transition-all duration-200 hover:shadow-md hover:bg-[#f8f4f4] rounded-lg p-4"
      style={{ borderBottom: '1px solid #bba2a2' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium" style={{ color: '#3d312e' }}>{title}</h3>
          <p className="text-sm mt-1" style={{ color: '#948585' }}>{description}</p>
        </div>
        <button 
          className="text-sm px-3 py-1 rounded transition-all duration-200 hover:shadow-md hover:opacity-90"
          style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
        >
          Configure
        </button>
      </div>
    </div>
  );
}