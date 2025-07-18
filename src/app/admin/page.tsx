"use client";
import { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'pro' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  studyHours: number;
  tasksCompleted: number;
  subscription: {
    type: 'free' | 'pro';
    status: 'active' | 'expired' | 'cancelled';
    expiryDate?: string;
  };
  engagement: {
    loginStreak: number;
    weeklyActive: boolean;
    monthlyActive: boolean;
  };
};

type ActivityLog = {
  id: number;
  userId: number;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
};

type SubscriptionStats = {
  total: number;
  active: number;
  expired: number;
  revenue: number;
  growth: number;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'engagement' | 'reports'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock users data
    setUsers([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'pro',
        status: 'active',
        joinDate: '2024-01-15',
        lastLogin: '2024-12-20',
        studyHours: 45,
        tasksCompleted: 23,
        subscription: { type: 'pro', status: 'active', expiryDate: '2025-01-15' },
        engagement: { loginStreak: 7, weeklyActive: true, monthlyActive: true }
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-02-20',
        lastLogin: '2024-12-19',
        studyHours: 32,
        tasksCompleted: 18,
        subscription: { type: 'free', status: 'active' },
        engagement: { loginStreak: 3, weeklyActive: true, monthlyActive: true }
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'user',
        status: 'inactive',
        joinDate: '2024-03-10',
        lastLogin: '2024-12-10',
        studyHours: 12,
        tasksCompleted: 5,
        subscription: { type: 'free', status: 'active' },
        engagement: { loginStreak: 0, weeklyActive: false, monthlyActive: true }
      }
    ]);

    // Mock activity logs
    setActivityLogs([
      {
        id: 1,
        userId: 1,
        userName: 'John Doe',
        action: 'Login',
        timestamp: '2024-12-20 09:30:00',
        details: 'User logged in successfully'
      },
      {
        id: 2,
        userId: 2,
        userName: 'Jane Smith',
        action: 'Task Completed',
        timestamp: '2024-12-20 10:15:00',
        details: 'Completed task: Mathematics Study'
      },
      {
        id: 3,
        userId: 1,
        userName: 'John Doe',
        action: 'Subscription Renewed',
        timestamp: '2024-12-19 14:20:00',
        details: 'Pro subscription renewed for 1 year'
      }
    ]);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const subscriptionStats: SubscriptionStats = {
    total: users.length,
    active: users.filter(u => u.subscription.status === 'active').length,
    expired: users.filter(u => u.subscription.status === 'expired').length,
    revenue: users.filter(u => u.subscription.type === 'pro').length * 29.99,
    growth: 12.5
  };

  const handleUserAction = (action: 'edit' | 'suspend' | 'delete', user: User) => {
    switch (action) {
      case 'edit':
        setSelectedUser(user);
        setShowUserModal(true);
        break;
      case 'suspend':
        setUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u
        ));
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this user?')) {
          setUsers(prev => prev.filter(u => u.id !== user.id));
        }
        break;
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">+8% from last week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pro Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.subscription.type === 'pro').length}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">+15% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${subscriptionStats.revenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">+{subscriptionStats.growth}% from last month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activityLogs.slice(0, 5).map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{log.userName}</p>
                <p className="text-sm text-gray-600">{log.action} - {log.details}</p>
              </div>
              <span className="text-sm text-gray-500">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{user.subscription.type}</div>
                    <div className="text-sm text-gray-500">{user.subscription.expiryDate || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.studyHours}h studied</div>
                    <div className="text-sm text-gray-500">Last login: {user.lastLogin}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUserAction('edit', user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('suspend', user)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('delete', user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const SubscriptionsTab = () => (
    <div className="space-y-6">
      {/* Subscription Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900">{subscriptionStats.total}</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Pro Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.subscription.type === 'pro' && u.subscription.status === 'active').length}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${subscriptionStats.revenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {((users.filter(u => u.subscription.type === 'pro').length / users.length) * 100).toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Subscription Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.subscription.type === 'pro' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.subscription.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.subscription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.subscription.expiryDate || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${user.subscription.type === 'pro' ? '29.99' : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const EngagementTab = () => (
    <div className="space-y-6">
      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Weekly Active Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.engagement.weeklyActive).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {((users.filter(u => u.engagement.weeklyActive).length / users.length) * 100).toFixed(1)}% of total users
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Active Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.engagement.monthlyActive).length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {((users.filter(u => u.engagement.monthlyActive).length / users.length) * 100).toFixed(1)}% of total users
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Login Streak</p>
              <p className="text-3xl font-bold text-gray-900">
                {(users.reduce((sum, u) => sum + u.engagement.loginStreak, 0) / users.length).toFixed(1)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-gray-600 mt-2">days</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Study Hours</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.reduce((sum, u) => sum + u.studyHours, 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-sm text-gray-600 mt-2">across all users</p>
        </div>
      </div>

      {/* User Engagement Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">User Engagement Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Streak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.engagement.loginStreak} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.studyHours}h</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.tasksCompleted}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.engagement.weeklyActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.engagement.weeklyActive ? 'Weekly Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.engagement.monthlyActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.engagement.monthlyActive ? 'Monthly Active' : 'Not Active'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-6">
      {/* Report Actions */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-semibold">Generate Reports</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export Users
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-4 h-4" />
              Export Activity
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Download className="w-4 h-4" />
              Revenue Report
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">User Growth</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-green-600">+{Math.floor(users.length * 0.12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Month</span>
              <span className="font-semibold">+{Math.floor(users.length * 0.08)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold text-green-600">+12%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Engagement Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Active</span>
              <span className="font-semibold">{users.filter(u => u.engagement.loginStreak > 0).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weekly Active</span>
              <span className="font-semibold">{users.filter(u => u.engagement.weeklyActive).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retention Rate</span>
              <span className="font-semibold text-green-600">85%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Revenue Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Revenue</span>
              <span className="font-semibold">${subscriptionStats.revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ARPU</span>
              <span className="font-semibold">${(subscriptionStats.revenue / users.length).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conversion</span>
              <span className="font-semibold text-green-600">
                {((users.filter(u => u.subscription.type === 'pro').length / users.length) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Activity Log */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Activity Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activityLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.action === 'Login' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'Task Completed' ? 'bg-green-100 text-green-800' :
                      log.action === 'Subscription Renewed' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, Admin</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
              { id: 'engagement', label: 'Engagement', icon: Activity },
              { id: 'reports', label: 'Reports', icon: LineChart }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="min-h-[600px]">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'subscriptions' && <SubscriptionsTab />}
        {activeTab === 'engagement' && <EngagementTab />}
        {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit User: {selectedUser.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="user">User</option>
                  <option value="pro">Pro User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}