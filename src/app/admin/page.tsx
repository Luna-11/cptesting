"use client";
import { useState, useEffect } from 'react';
import { 
  Users, Activity, CreditCard, TrendingUp, Calendar,
  Clock, Star, AlertCircle, CheckCircle, XCircle,
  Search, Filter, Download, Eye, Edit, Trash2,
  BarChart3, PieChart, LineChart, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

// Type definitions
type UserRole = 'user' | 'pro' | 'admin';
type UserStatus = 'active' | 'inactive' | 'dormant';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  role_id: number;
  status: UserStatus;
  created_at: string;
  join_date: string;
  last_event_date?: string;
  last_task_date?: string;
  total_events: number;
  total_tasks: number;
  days_since_join: number;
  study_level?: string;
  daily_study_goal?: number;
}

interface ActivityLog {
  type: 'event' | 'task';
  user_name: string;
  user_email: string;
  activity: string;
  timestamp: string;
  category: string;
}

interface DashboardStats {
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
}

interface ReportData {
  type: string;
  data: unknown[];
  generatedAt: string;
  filters?: Record<string, unknown>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

interface ApiResponse<T> {
  status?: string;
  message?: string;
  data?: T;
  pagination?: Pagination;
  error?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'engagement' | 'reports'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasPrev: false,
    hasNext: false
  });

  // Improved fetch function with better error handling
  const fetchWithAuth = async <T,>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const data: ApiResponse<T> = await response.json();

      console.log('API Response:', { url, status: response.status, data });

      if (response.status === 401 || response.status === 403) {
        setAuthError(true);
        throw new Error(data.message || 'Unauthorized - Please login as admin');
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      // Handle cases where API might use 'status' instead of 'success'
      if (data.status === 'error') {
        throw new Error(data.message || 'API returned an error');
      }

      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    }
  };

  // Fetch dashboard data with proper error handling
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth<{
        userStats: Partial<DashboardStats>;
        activityStats: Partial<DashboardStats>;
        engagementStats: Partial<DashboardStats>;
        recentActivity: ActivityLog[];
      }>('/api/admin/analytics');

      if (response.data) {
        setDashboardStats({
          ...(response.data.userStats || {}),
          ...(response.data.activityStats || {}),
          ...(response.data.engagementStats || {})
        } as DashboardStats);
        setActivityLogs(response.data.recentActivity || []);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users data with pagination and filtering
  const fetchUsers = async (page = 1, search = '', status: 'all' | UserStatus = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(status !== 'all' && { status })
      });

      const response = await fetchWithAuth<{
        users: User[];
        pagination: Pagination;
      }>(`/api/admin/users?${params}`);

      if (response.data) {
        setUsers(response.data.users || []);
        setPagination({
          ...(response.data.pagination || {
            page,
            limit: pagination.limit,
            total: 0,
            totalPages: 0,
            hasPrev: false,
            hasNext: false
          }),
          hasPrev: page > 1,
          hasNext: (response.data.pagination?.page || page) < (response.data.pagination?.totalPages || 0)
        });
      }
    } catch (err) {
      console.error('Users fetch error:', err);
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

  // Handle user actions
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
      setError(err instanceof Error ? err.message : 'Action failed');
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
const UsersTab = () => {
  // Add this function to handle manual role upgrade

  const handleDowngradeToUser = async (user: User) => {
  try {
    const response = await fetchWithAuth('/api/admin/users', {
      method: 'PUT',
      body: JSON.stringify({
        userId: user.user_id,
        role: 'user'
      })
    });

    if (response.status === 'success') {
      fetchUsers(pagination.page, searchTerm, filterStatus);
      setError(null);
    } else {
      setError(response.error || 'Failed to downgrade user');
    }
  } catch (err) {
    console.error('Failed to downgrade user:', err);
    setError(err instanceof Error ? err.message : 'Failed to downgrade user');
  }
};

  const handleUpgradeToPro = async (user: User) => {
    try {
      const response = await fetchWithAuth('/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify({
          userId: user.user_id,
          role: 'pro'
        })
      });

      if (response.status === 'success') {
        // Refresh the users list to show the updated role
        fetchUsers(pagination.page, searchTerm, filterStatus);
        setError(null);
      } else {
        setError(response.error || 'Failed to upgrade user');
      }
    } catch (err) {
      console.error('Failed to upgrade user:', err);
      setError(err instanceof Error ? err.message : 'Failed to upgrade user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | UserStatus)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600">{user.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'pro' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.join_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Upgrade to Pro button - only show for regular users */}
                        {user.role === 'user' && (
                          <button 
                            onClick={() => handleUpgradeToPro(user)}
                            className="text-green-600 hover:text-green-900"
                            title="Upgrade to Pro"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleUserAction('suspend', user)}
                          className={user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                          title={user.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {user.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleUserAction('delete', user)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchUsers(pagination.page - 1, searchTerm, filterStatus)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1, searchTerm, filterStatus)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> users
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => fetchUsers(pagination.page - 1, searchTerm, filterStatus)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 极市 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchUsers(pageNum, searchTerm, filterStatus)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium 
                          ${pagination.page === pageNum ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => fetchUsers(pagination.page + 1, searchTerm, filterStatus)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.极市a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 极市01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SubscriptionsTab = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchPayments = async (status = filterPaymentStatus) => {
    setLoadingPayments(true);
    try {
      const params = new URLSearchParams({
        status: status === 'all' ? '' : status
      });

      const response = await fetchWithAuth<{
        payments: any[];
        pagination: Pagination;
      }>(`/api/admin/subscriptions?${params}`);

      if (response.data) {
        setPayments(response.data.payments || []);
      }
    } catch (err) {
      console.error('Payments fetch error:', err);
      setError('Failed to fetch subscription payments');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handlePaymentAction = async (paymentId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetchWithAuth('/api/admin/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          paymentId,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        })
      });

      if (response.status === 'success') {
        fetchPayments(filterPaymentStatus);
        setSelectedPayment(null);
        setRejectionReason('');
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error(`Failed to ${action} payment:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action} payment`);
    }
  };

  const openPaymentDetail = (payment: any) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  useEffect(() => {
    fetchPayments();
  }, [filterPaymentStatus]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Subscription Analytics</h3>
        {dashboardStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              icon={<CreditCard className="h-6 w-6" />}
              title="Monthly Revenue"
              value={`$${dashboardStats.monthly_revenue}`}
              change="Current month"
            />
            <StatCard 
              icon={<Users className="h-6 w-6" />}
              title="Pro Users"
              value={dashboardStats.pro_users}
              change={`${dashboardStats.conversion_rate}% conversion`}
            />
            <StatCard 
              icon={<TrendingUp className="h-6 w-6" />}
              title="Avg. Revenue per User"
              value={`$${(dashboardStats.monthly_revenue / dashboardStats.total_users).toFixed(2)}`}
              change="Monthly"
            />
          </div>
        ) : (
          <p className="text-gray-500">Loading subscription data...</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Payment Approvals</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <button 
              onClick={() => fetchPayments()}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingPayments ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600">{payment.user_name?.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{payment.user_name}</div>
                          <div className="text-sm text-gray-500">{payment.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${payment.amount}</div>
                      <div className="text-sm text-gray-500">
                        {payment.months} month{payment.months > 1 ? 's' : ''} • {payment.method_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${payment.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          payment.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {payment.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handlePaymentAction(payment.payment_id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setRejectionReason('');
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openPaymentDetail(payment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-medium text-gray-900">Payment Details</h3>
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPayment(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">User Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{selectedPayment.user_name?.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-medium text-gray-900">{selectedPayment.user_name}</div>
                          <div className="text-sm text-gray-500">{selectedPayment.user_email}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        User ID: {selectedPayment.user_id}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">${selectedPayment.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {selectedPayment.months} month{selectedPayment.months > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{selectedPayment.method_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                          ${selectedPayment.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            selectedPayment.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {selectedPayment.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Date:</span>
                        <span className="font-medium">
                          {new Date(selectedPayment.payment_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="font-medium">{selectedPayment.payment_id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Receipt Image</h4>
                  {selectedPayment.receipt_image ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <img
                        src={selectedPayment.receipt_image}
                        alt="Payment receipt"
                        className="w-full h-auto max-h-80 object-contain rounded-lg border border-gray-200"
                      />
                      <div className="mt-3 text-center">
                        <a
                          href={selectedPayment.receipt_image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View full image
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-lg flex flex-col items-center justify-center text-gray-500">
                      <CreditCard className="h-12 w-12 mb-3" />
                      <p>No receipt image available</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPayment.status === 'Pending' && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Admin Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (optional)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex flex-col justify-end space-y-3">
                      <button
                        onClick={() => handlePaymentAction(selectedPayment.payment_id, 'approve')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Approve Payment
                      </button>
                      <button
                        onClick={() => {
                          if (rejectionReason.trim() || window.confirm('Are you sure you want to reject without providing a reason?')) {
                            handlePaymentAction(selectedPayment.payment_id, 'reject');
                          }
                        }}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Reject Payment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  const EngagementTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">User Activity</h3>
          {dashboardStats ? (
            <div className="space-y-4">
              <EngagementMetric 
                label="Daily Active Users"
                value={dashboardStats.daily_active_users}
                total={dashboardStats.total_users}
              />
              <EngagementMetric 
                label="Weekly Active Users"
                value={dashboardStats.weekly_active_users}
                total={dashboardStats.total_users}
              />
              <EngagementMetric 
                label="Monthly Active Users"
                value={dashboardStats.monthly_active_users}
                total={dashboardStats.total_users}
              />
            </div>
          ) : (
            <p className="text-gray-500">Loading engagement data...</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Content Engagement</h3>
          {dashboardStats ? (
            <div className="space-y-4">
              <EngagementMetric 
                label="Total Events"
                value={dashboardStats.total_events}
              />
              <EngagementMetric 
                label="Events Today"
                value={dashboardStats.events_today}
              />
              <EngagementMetric 
                label="Total Tasks"
                value={dashboardStats.total_tasks}
              />
              <EngagementMetric 
                label="Tasks Today"
                value={dashboardStats.tasks_today}
              />
            </div>
          ) : (
            <p className="text-gray-500">Loading content data...</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Activity Charts</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
            <BarChart3 className="h-16 w-16 text-gray-400" />
            <p className="ml-3 text-gray-500">Activity chart will be displayed here</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
            <LineChart className="h-16 w-16 text-gray-400" />
            <p className="ml-3 text-gray-500">Engagement trend will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper components
  const StatCard = ({ icon, title, value, change }: { icon: React.ReactNode; title: string; value: string | number; change: string }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{change}</p>
    </div>
  );

  const ActivityItem = ({ log }: { log: ActivityLog }) => (
    <div className="flex items-start">
      <div className={`p-2 rounded-full mr-3 ${log.type === 'event' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
        {log.type === 'event' ? <Calendar className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-gray-900">{log.user_name}</p>
          <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
        </div>
        <p className="text-sm text-gray-500">{log.activity}</p>
        <p className="text-xs text-gray-400 mt-1">{log.category}</p>
      </div>
    </div>
  );

  const QuickStatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );

  const EngagementMetric = ({ label, value, total }: { label: string; value: number; total?: number }) => (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">
          {value}
          {total !== undefined && (
            <span className="text-gray-500 font-normal"> / {total}</span>
          )}
        </span>
      </div>
      {total !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${(value / total) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600">AD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {(['users', 'subscriptions', 'engagement'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-4 text-sm font-medium border-b-2 ${activeTab === tab 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="min-h-[600px]">
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'engagement' && <EngagementTab />}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    defaultValue={selectedUser.role}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="user">User</option>
                    <option value="pro">Pro</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    defaultValue={selectedUser.status}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="dormant">Dormant</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Handle save logic here
                      setShowUserModal(false);
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}