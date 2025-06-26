'use client';
import SettingItem from './SettingItems';

export default function SettingsContent() {
  return (
    <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
      <h2 className="text-lg font-semibold mb-6" style={{ color: '#3d312e' }}>System Settings</h2>
      <div className="space-y-4">
        <SettingItem 
          title="Notification Preferences" 
          description="Configure how and when you receive notifications" 
        />
        <SettingItem 
          title="Study Reminders" 
          description="Set up automatic reminders for users" 
        />
        <SettingItem 
          title="User Permissions" 
          description="Manage what different user roles can access" 
        />
        <SettingItem 
          title="API Configuration" 
          description="Set up integrations with other services" 
        />
      </div>
    </div>
  );
}