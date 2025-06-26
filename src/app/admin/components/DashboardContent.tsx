'use client';
import { useState, useEffect } from 'react';
import { User, Activity } from '../type';
import StatCard from './StatCard';
import UserCard from './UserCard';
import ActivityItem from './ActivityItem';
import { FaUsers, FaClipboardList, FaCalendarAlt, FaFire } from 'react-icons/fa';

export default function DashboardContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, activitiesRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/activities')
        ]);
        if (!usersRes.ok || !activitiesRes.ok) {
          throw new Error('Failed to fetch data');
        }
        const usersData: User[] = await usersRes.json();
        const activitiesData: Activity[] = await activitiesRes.json();
        setUsers(usersData);
        setRecentActivity(activitiesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  // Calculate dashboard metrics (same as before)
  const totalUsers = users.length;
  const averageStudyHours =
    users.reduce((total, user) => total + (user.studyHours || 0), 0) /
    (users.length || 1);
  const totalCompletedTasks = users.reduce(
    (total, user) => total + (user.completedTasks || 0),
    0
  );
  const activeStreaks = users.filter((user) => (user.streak || 0) >= 3).length;
  const topPerformers = [...users]
    .sort((a, b) => (b.studyHours || 0) - (a.studyHours || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<FaUsers style={{ color: '#3d312e' }} />}
          trend="↑ 12% from last month"
        />
        <StatCard
          title="Avg. Study Hours"
          value={averageStudyHours.toFixed(1)}
          unit="hours"
          icon={<FaCalendarAlt style={{ color: '#3d312e' }} />}
          trend="↑ 1.2h from last week"
        />
        <StatCard
          title="Completed Tasks"
          value={totalCompletedTasks}
          icon={<FaClipboardList style={{ color: '#3d312e' }} />}
          trend="↑ 23 tasks this week"
        />
        <StatCard
          title="Active Streaks"
          value={activeStreaks}
          icon={<FaFire style={{ color: '#3d312e' }} />}
          trend="3 new streaks today"
        />
      </div>

      {/* Top Performers */}
      <div
        className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg"
        style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>
          Top Performers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPerformers.map((user, index) => (
            <UserCard key={user.id} user={user} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div
        className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg"
        style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>
          Recent Activity
        </h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div> */}
    </div>
  );
}
