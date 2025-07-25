"use client";
import { useState, useEffect } from 'react';
import { 
  Users, Activity, CreditCard, TrendingUp, Calendar,
  Clock, Star, AlertCircle, CheckCircle, XCircle,
  Search, Filter, Download, Eye, Edit, Trash2,
  BarChart3, PieChart, LineChart, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

type User = {
  user_id: number;
  name: string;
  email: string;
  role: 'user' | 'pro' | 'admin';
  role_id: number;
  status: 'active' | 'inactive' | 'dormant';
  created_at: string;
  join_date: string;
  last_event_date?: string;
  last_task_date?: string;
  total_events: number;
  total_tasks: number;
  days_since_join: number;
  study_level?: string;
  daily_study_goal?: number;
};

type ActivityLog = {
  type: 'event' | 'task';
  user_name: string;
  user_email: string;
  activity: string;
  timestamp: string;
  category: string;
};

type DashboardStats = {
  total_users: number;
  admin_users: number;
  regular_users: number;
  pro_users: number;
  new_users_30d: number;
  new_users_7d: number;
  new_users_1d: number;
  users_with_events: number;
  total_events: number;
  users_with_tasks: number;
  total_tasks: number;
  events_last_week: number;
  tasks_last_week: number;
  events_today: number;
  tasks_today: number;
  weekly_active_users: number;
  monthly_active_users: number;
  daily_active_users: number;
  avg_study_goal: number;
  conversion_rate: number;
  monthly_revenue: number;
};

type ReportData = {
  type: string;
  data: any[];
  generatedAt: string;
  filters?: any;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'engagement' | 'reports'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'dormant'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasPrev: false,
    hasNext: false
  });

  // Centralized fetch function with auth handling
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (response.status === 403) {
        setAuthError(true);
        throw new Error('Unauthorized - Please login as admin');
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/api/admin/analytics');
      setDashboardStats({
        ...data.userStats,
        ...data.activityStats,
        ...data.engagementStats
      });
      setActivityLogs(data.recentActivity || []);
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users data
  const fetchUsers = async (page = 1, search = '', status = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search,
        status
      });

      const data = await fetchWithAuth(`/api/admin/users?${params}`);
      setUsers(data.users || []);
      setPagination({
        ...data.pagination,
        hasPrev: data.pagination.page > 1,
        hasNext: data.pagination.page < data.pagination.totalPages
      });
    } catch (err: any) {
      console.error('Users fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  // Refetch users when filters change
  useEffect(() => {
    fetchUsers(1, searchTerm, filterStatus);
  }, [searchTerm, filterStatus]);

  const handleUserAction = async (action: 'edit' | 'suspend' | 'delete', user: User) => {
    try {
      switch (action) {
        case 'edit':
          setSelectedUser(user);
          setShowUserModal(true);
          break;
        case 'suspend':
          const newStatus = user.status === 'active' ? 'inactive' : 'active';
          await fetchWithAuth('/api/admin/users', {
            method: 'PUT',
            body: JSON.stringify({
              userId: user.user_id,
              status: newStatus
            })
          });
          fetchUsers(pagination.page, searchTerm, filterStatus);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this user?')) {
            await fetchWithAuth(`/api/admin/users?userId=${user.user_id}`, {
              method: 'DELETE'
            });
            fetchUsers(pagination.page, searchTerm, filterStatus);
            fetchDashboardData();
          }
          break;
      }
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchUsers(pagination.page, searchTerm, filterStatus);
  };

  // Show unauthorized screen if auth fails
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please login as an administrator.
          </p>
          <Link 
            href="/login" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
          >
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  // Tab components remain exactly the same as your original code
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* ... existing OverviewTab implementation ... */}
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      {/* ... existing UsersTab implementation ... */}
    </div>
  );

  const SubscriptionsTab = () => (
    <div className="space-y-6">
      {/* ... existing SubscriptionsTab implementation ... */}
    </div>
  );

  const EngagementTab = () => (
    <div className="space-y-6">
      {/* ... existing EngagementTab implementation ... */}
    </div>
  );

  const ReportsTab = () => {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [reportLoading, setReportLoading] = useState(false);

    const generateReport = async (type: string) => {
      setReportLoading(true);
      try {
        const data = await fetchWithAuth(`/api/admin/reports?type=${type}`);
        setReportData(data);
      } catch (err) {
        console.error('Failed to generate report:', err);
      } finally {
        setReportLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* ... existing ReportsTab implementation ... */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
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
        {error && !loading && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-red-700 hover:text-red-900"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

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
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="2" selected={selectedUser.role_id === 2}>Regular User</option>
                  <option value="3" selected={selectedUser.role_id === 3}>Pro User</option>
                  <option value="1" selected={selectedUser.role_id === 1}>Admin</option>
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