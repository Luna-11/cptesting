"use client";
import { useState, useEffect, useRef, MouseEvent, useCallback } from 'react';

import { Bell, LogOut, Users, Activity, CreditCard, TrendingUp, Calendar, Clock, Star, AlertCircle, CheckCircle, XCircle, Search, Filter, Download, Eye, Edit, Trash2, ArrowDown, BarChart3, PieChart, LineChart as LineChartIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthlyPurchase {
  month: string;
  total_months_purchased: number;
  total_transactions: number;
  total_revenue: number;
}

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

interface AdminNotification {
  notification_id: number;
  user_id: number;
  payment_id: number;
  title: string;
  message: string;
  type: string;
  status: string;
  purchase_status: string;
  created_at: string;
  user_name: string;
  user_email: string;
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

interface Payment {
  payment_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  amount: number;
  months: number;
  method_name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  payment_date: string;
  approved_at: string | null;
  receipt_image: string | null;
}

interface PaymentResponse {
  payments: Payment[];
  pagination: Pagination;
}

function EngagementPurchasesChart({ data }: { data: MonthlyPurchase[] }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Pro Plan Purchases & Revenue</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />

          {/* Line for purchased months */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total_months_purchased"
            stroke="#ff7300"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Purchased Months"
          />

          {/* Line for revenue */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total_revenue"
            stroke="#3874ff"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue ($)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'engagement'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
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
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [engagementData, setEngagementData] = useState<MonthlyPurchase[]>([]);

  // Handle clicking outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as any);
    };
  }, []);

  // Fetch engagement data
  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        if (json.status === "success") {
          setEngagementData(json.data.engagementStats.monthlyPurchases);
        }
      } catch (err) {
        console.error("Failed to fetch engagement data:", err);
      }
    };
    fetchEngagementData();
  }, []);

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

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}`);
      }

      const data: ApiResponse<T> = await response.json();

      if (response.status === 401 || response.status === 403) {
        setAuthError(true);
        throw new Error(data.message || 'Unauthorized - Please login as admin');
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      if (data.status === 'error') {
        throw new Error(data.message || 'API returned an error');
      }

      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw error;
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth<{
        userStats: Partial<DashboardStats>;
        engagementStats: Partial<DashboardStats>;
        recentActivity: AdminNotification[];
      }>('/api/admin/analytics');

      if (response.data) {
        setDashboardStats({
          ...response.data.userStats,
          ...response.data.engagementStats,
        } as DashboardStats);
        setNotifications(response.data.recentActivity || []);
      } else {
        throw new Error('No data received from API');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin notifications
  const fetchAdminNotifications = async () => {
    try {
      const response = await fetchWithAuth<AdminNotification[]>('/api/admin/notification');
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Notifications fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.status === "success") {
        setDashboardStats(json.data.userStats); // ✅ use userStats
      }
    };
    fetchStats();
  }, []);

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
        if (response.data.pagination) {
          setPagination({
            ...response.data.pagination,
            hasPrev: response.data.pagination.page > 1,
            hasNext: response.data.pagination.page < response.data.pagination.totalPages
          });
        }
      }
    } catch (err) {
      console.error('Users fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (showNotifications) {
      fetchAdminNotifications();
    }
  }, [showNotifications]);

  // Handle search and filter changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, searchTerm, filterStatus);
    }, 500); // Debounce search by 500ms
    
    return () => clearTimeout(timer);
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
            className="px-4 py-2 bg-[#bba2a2] text-[#f0eeee] rounded-lg hover:bg-[#a58d8d] inline-block transition-colors"
          >
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  const UsersTab = () => {
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

    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-10 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bba2a2] bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bba2a2] bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | UserStatus)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f0eeee]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {user.role === 'user' && (
                            <button 
                              onClick={() => handleUpgradeToPro(user)}
                              className="p-2 bg-[#bba2a2] text-[#f0eeee] rounded hover:bg-[#a58d8d] transition-colors"
                              title="Upgrade to Pro"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          {(user.role === 'pro' || user.role === 'admin') && (
                            <button 
                              onClick={() => handleDowngradeToUser(user)}
                              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                              title="Downgrade to User"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleUserAction('delete', user)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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

          {pagination.totalPages > 1 && (
            <div className="bg-[#f0eeee] px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchUsers(pagination.page - 1, searchTerm, filterStatus)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-[#3d312e] bg-white hover:bg-[#f0eeee] disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(pagination.page + 1, searchTerm, filterStatus)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-[#3d312e] bg-white hover:bg-[#f0eeee] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-[#3d312e]">
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
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-[#3d312e] hover:bg-[#f0eeee] disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
                            ${pagination.page === pageNum ? 'z-10 bg-[#bba2a2] border-[#bba2a2] text-[#f0eeee]' : 'bg-white border-gray-300 text-[#3d312e] hover:bg-[#f0eeee]'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => fetchUsers(pagination.page + 1, searchTerm, filterStatus)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-[#3d312e] hover:bg-[#f0eeee] disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Calculate subscription period for a single payment
  const calculateSubscriptionPeriod = (payment: Payment) => {
    if (payment.status !== 'Approved' || !payment.approved_at) {
      return null;
    }

    const startDate = new Date(payment.approved_at);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + payment.months);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      isActive: new Date() <= endDate
    };
  };

  // Calculate total subscription for a user (accumulating all approved payments)
  const calculateUserSubscription = (userId: number) => {
    const userPayments = payments.filter(p => p.user_id === userId && p.status === 'Approved' && p.approved_at);
    
    if (userPayments.length === 0) return null;

    // Sort payments by approval date (oldest first)
    const sortedPayments = userPayments.sort((a, b) => {
      const dateA = new Date(a.approved_at!).getTime();
      const dateB = new Date(b.approved_at!).getTime();
      return dateA - dateB;
    });

    // Start with the first payment
    const firstPayment = sortedPayments[0];
    let currentEndDate = new Date(firstPayment.approved_at!);
    currentEndDate.setMonth(currentEndDate.getMonth() + firstPayment.months);
    
    let totalMonthsPurchased = firstPayment.months;

    // Process subsequent payments
    for (let i = 1; i < sortedPayments.length; i++) {
      const payment = sortedPayments[i];
      const paymentDate = new Date(payment.approved_at!);
      
      // If this payment was made BEFORE the current subscription ends, extend it
      if (paymentDate <= currentEndDate) {
        currentEndDate.setMonth(currentEndDate.getMonth() + payment.months);
      } else {
        // If payment was made AFTER current subscription ended, start new period
        currentEndDate = new Date(paymentDate);
        currentEndDate.setMonth(currentEndDate.getMonth() + payment.months);
      }
      
      totalMonthsPurchased += payment.months;
    }

    const now = new Date();
    const timeDiff = currentEndDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const monthsLeft = daysLeft / 30.44;

    const earliestStart = sortedPayments[0].approved_at!;

    return {
      startDate: earliestStart.split('T')[0],
      endDate: currentEndDate.toISOString().split('T')[0],
      monthsLeft: Math.max(0, Math.floor(monthsLeft * 10) / 10), // 1 decimal place
      isActive: now <= currentEndDate,
      totalMonthsPurchased: totalMonthsPurchased
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const fetchPayments = async (status = filterPaymentStatus) => {
    setLoadingPayments(true);
    try {
      const params = new URLSearchParams({
        status: status === 'all' ? '' : status
      });

      const response = await fetchWithAuth<PaymentResponse>(
        `/api/admin/subscriptions?${params}`
      );

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
    setActionLoading(paymentId);
    try {
      const response = await fetchWithAuth('/api/admin/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          paymentId,
          action,
          ...(action === 'reject' && { rejectionReason })
        })
      });

      if (response.status === 'success') {
        await fetchPayments(filterPaymentStatus);
        setSelectedPayment(null);
        setRejectionReason('');
        setShowDetailModal(false);
        setShowRejectModal(false);
        setError(null);
        
        setError(`Payment successfully ${action === 'approve' ? 'approved' : 'rejected'}!`);
        setTimeout(() => setError(null), 3000);
      } else {
        setError(response.error || `Failed to ${action} payment`);
      }
    } catch (err) {
      console.error(`Failed to ${action} payment:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action} payment`);
    } finally {
      setActionLoading(null);
    }
  };

  const openPaymentDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const openRejectModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  useEffect(() => {
    fetchPayments();
  }, [filterPaymentStatus]);

  return (
    <div className="space-y-2">
      {/* Error/Success Message */}
      {error && (
        <div className={`p-4 rounded-lg ${
          error.includes('successfully') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {error.includes('successfully') ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 mr-2" />
            )}
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-[#3d312e]">Payment Approvals</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bba2a2] bg-white"
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
              disabled={loadingPayments}
              className="p-2 rounded-lg hover:bg-[#f0eeee] transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 text-[#3d312e] ${loadingPayments ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f0eeee]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Payment Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Approved Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Remaining Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingPayments ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading payments...
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const userSubscription = calculateUserSubscription(payment.user_id);
                  const singlePaymentSubscription = calculateSubscriptionPeriod(payment);
                  
                  return (
                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.user_name}</div>
                          <div className="text-sm text-gray-500">{payment.user_email}</div>
                          <div className="text-xs text-gray-400">ID: {payment.user_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${payment.amount}</div>
                        <div className="text-sm text-gray-500">
                          {payment.months} month{payment.months > 1 ? 's' : ''} • {payment.method_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${payment.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            payment.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.approved_at ? formatDate(payment.approved_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {singlePaymentSubscription ? formatDate(singlePaymentSubscription.endDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userSubscription ? (
                          <div className="space-y-1">
                            <div className={`font-medium ${userSubscription.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {userSubscription.monthsLeft} month{userSubscription.monthsLeft !== 1 ? 's' : ''} left
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDateRange(userSubscription.startDate, userSubscription.endDate)}
                            </div>
                            <div className="text-xs text-blue-600">
                              Total: {userSubscription.totalMonthsPurchased} month{userSubscription.totalMonthsPurchased !== 1 ? 's' : ''} purchased
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No active subscription</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {payment.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handlePaymentAction(payment.payment_id, 'approve')}
                                disabled={actionLoading === payment.payment_id}
                                className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve"
                              >
                                {actionLoading === payment.payment_id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => openRejectModal(payment)}
                                disabled={actionLoading === payment.payment_id}
                                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {payment.status !== 'Pending' && (
                            <span className="text-xs text-gray-500">No actions</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openPaymentDetail(payment)}
                          className="p-2 bg-[#bba2a2] text-[#f0eeee] rounded hover:bg-[#a58d8d] transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
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
                  className="text-gray-400 hover:text-gray-500 transition-colors"
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
                      <div className="mb-3">
                        <div className="text-lg font-medium text-gray-900">{selectedPayment.user_name}</div>
                        <div className="text-sm text-gray-500">{selectedPayment.user_email}</div>
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
                          {formatDate(selectedPayment.payment_date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approved Date:</span>
                        <span className="font-medium">
                          {selectedPayment.approved_at ? formatDate(selectedPayment.approved_at) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="font-medium">{selectedPayment.payment_id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Summary */}
                  {selectedPayment.status === 'Approved' && selectedPayment.approved_at && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Subscription Period</h4>
                      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Starts:</span>
                          <span className="font-medium text-blue-600">
                            {formatDate(selectedPayment.approved_at)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ends:</span>
                          <span className="font-medium text-blue-600">
                            {calculateSubscriptionPeriod(selectedPayment)?.endDate ? 
                              formatDate(calculateSubscriptionPeriod(selectedPayment)!.endDate) : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-blue-600">
                            {selectedPayment.months} month{selectedPayment.months > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Receipt Image</h4>
                  {selectedPayment.receipt_image ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <img
                        src={selectedPayment.receipt_image}
                        alt="Payment receipt"
                        className="w-full h-auto max-h-80 object-contain rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmM2YzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <div className="mt-3 text-center">
                        <a
                          href={selectedPayment.receipt_image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View full image in new tab
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-lg flex flex-col items-center justify-center text-gray-500">
                      <CreditCard className="h-12 w-12 mb-3 text-gray-400" />
                      <p className="text-sm">No receipt image available</p>
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
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-[#bba2a2] focus:border-[#bba2a2] resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex flex-col justify-end space-y-3">
                      <button
                        onClick={() => handlePaymentAction(selectedPayment.payment_id, 'approve')}
                        disabled={actionLoading === selectedPayment.payment_id}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === selectedPayment.payment_id ? (
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-5 w-5 mr-2" />
                        )}
                        Approve Payment
                      </button>
                      <button
                        onClick={() => {
                          if (rejectionReason.trim() || window.confirm('Are you sure you want to reject without providing a reason?')) {
                            handlePaymentAction(selectedPayment.payment_id, 'reject');
                          }
                        }}
                        disabled={actionLoading === selectedPayment.payment_id}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Payment</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-[#bba2a2] focus:border-[#bba2a2] resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handlePaymentAction(selectedPayment.payment_id, 'reject');
                  }}
                  disabled={actionLoading === selectedPayment.payment_id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === selectedPayment.payment_id ? 'Rejecting...' : 'Reject Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  const EngagementTab = ({ dashboardStats }: { dashboardStats: DashboardStats | null }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Users className="h-6 w-6" />}
          title="Total Users"
          value={dashboardStats?.total_users ?? 0}
          change="Overall"
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          title="Users"
          value={dashboardStats?.regular_users ?? 0}
          change="Standard accounts"
        />
        <StatCard
          icon={<Star className="h-6 w-6" />}
          title="Pro Users"
          value={dashboardStats?.pro_users ?? 0}
          change="Active subscriptions"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-medium mb-4 text-[#3d312e]">Subscription Analytics</h3>
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
              value={`$${(dashboardStats.total_users > 0 
                ? (dashboardStats.monthly_revenue / dashboardStats.total_users).toFixed(2) 
                : 0)}`}
              change="Monthly"
            />
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <EngagementPurchasesChart data={engagementData} />
    </div>
  );

  const StatCard = ({ icon, title, value, change }: { icon: React.ReactNode; title: string; value: string | number; change: string }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-[#f0eeee] text-[#3d312e]">
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{change}</p>
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
            className="bg-[#bba2a2] h-2 rounded-full" 
            style={{ width: `${(value / total) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-[#3d312e] shadow-sm border-b flex-shrink-0">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#f0eeee]">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-[#4a3c38] relative transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-[#f0eeee]" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <div key={notification.notification_id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {notification.purchase_status === 'pending' ? (
                                <CreditCard className="h-5 w-5 text-[#bba2a2]" />
                              ) : (
                                <Clock className="h-5 w-5 text-[#bba2a2]" />
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-600">{notification.category}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No new notifications
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                      <Link
                        href="/admin/notifications"
                        className="w-full text-center block text-sm text-[#bba2a2] hover:text-[#a58d8d] font-medium"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => window.location.href = '/login')
                  .catch((err) => console.error('Logout error:', err));
              }}
              className="p-2 rounded-full hover:bg-[#4a3c38] transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-[#f0eeee]" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#3d312e] shadow-sm flex-shrink-0">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {(['users', 'subscriptions', 'engagement'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab 
                    ? 'border-[#bba2a2] text-[#f0eeee]' 
                    : 'border-transparent text-[#bba2a2] hover:text-[#f0eeee] hover:border-[#bba2a2]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full">
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
          {activeTab === 'engagement' && <EngagementTab dashboardStats={dashboardStats} />}
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#bba2a2] focus:border-[#bba2a2] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#bba2a2] focus:border-[#bba2a2] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    defaultValue={selectedUser.role}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#bba2a2] focus:border-[#bba2a2] sm:text-sm"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#bba2a2] focus:border-[#bba2a2] sm:text-sm"
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
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-[#f0eeee] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bba2a2] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Handle save logic here
                      setShowUserModal(false);
                    }}
                    className="px-4 py-2 bg-[#bba2a2] text-[#f0eeee] rounded-md text-sm font-medium hover:bg-[#a58d8d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bba2a2] transition-colors"
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