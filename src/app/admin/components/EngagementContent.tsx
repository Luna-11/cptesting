'use client';
import { User, Activity } from '../type';
import StatCard from './StatCard';
import ActivityItem from './ActivityItem';
import EngagementTool from './EngagementTool';
import { FaUsers, FaCalendarAlt, FaChartLine, FaBell, FaFire } from 'react-icons/fa';

// Sample data
const users: User[] = [];
const recentActivity: Activity[] = [];

export default function EngagementContent() {
  return (
    <div className="space-y-6">
      {/* Engagement Metrics */}
      <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>Engagement Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Daily Active Users" 
            value="24" 
            icon={<FaUsers style={{ color: '#3d312e' }} />} 
            trend="↑ 2 from yesterday" 
          />
          <StatCard 
            title="Avg. Session" 
            value="32" 
            unit="mins" 
            icon={<FaCalendarAlt style={{ color: '#3d312e' }} />} 
            trend="↓ 4 mins from last week" 
          />
          <StatCard 
            title="Retention Rate" 
            value="68" 
            unit="%" 
            icon={<FaChartLine style={{ color: '#3d312e' }} />} 
            trend="↑ 5% from last month" 
          />
          <StatCard 
            title="Notifications Sent" 
            value="142" 
            icon={<FaBell style={{ color: '#3d312e' }} />} 
            trend="↑ 23 this week" 
          />
        </div>
      </div>

      {/* User Activity */}
      <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>User Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium mb-2" style={{ color: '#3d312e' }}>Most Active Users</h3>
            {/* <div className="space-y-3">
              {[...users].sort((a, b) => b.studyHours - a.studyHours).slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f8f4f4' }}>
                  <div className="flex items-center gap-3">
                    <div className="font-medium" style={{ color: '#3d312e' }}>{index + 1}. {user.name}</div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#bba2a2', color: '#3d312e' }}>
                      {user.studyHours} hours
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: '#948585' }}>{user.role}</span>
                </div>
              ))}
            </div> */}
          </div>
          <div>
            <h3 className="text-md font-medium mb-2" style={{ color: '#3d312e' }}>Recent Activity Stream</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Tools */}
      <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>Engagement Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EngagementTool 
            title="Send Notification" 
            description="Send a push notification to all users" 
            icon={<FaBell />}
            actionText="Compose"
          />
          <EngagementTool 
            title="Create Challenge" 
            description="Start a new study challenge" 
            icon={<FaFire />}
            actionText="Create"
          />
          <EngagementTool 
            title="Schedule Reminder" 
            description="Set up study reminders" 
            icon={<FaCalendarAlt />}
            actionText="Schedule"
          />
        </div>
      </div>
    </div>
  );
}