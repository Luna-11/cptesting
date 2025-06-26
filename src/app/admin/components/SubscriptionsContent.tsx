'use client';
import { SubscriptionPlan } from '../type';
import StatCard from './StatCard';
import SubscriptionPlanCard from './SubscriptionPlanCard';
import { FaUsers, FaDollarSign } from 'react-icons/fa';

// Sample data
const subscriptionPlans: SubscriptionPlan[] = [
  { id: 1, name: "Free", price: "$0/month", features: ["Basic features", "Limited courses", "Community support"], activeUsers: 2 },
  { id: 2, name: "Pro", price: "$9.99/month", features: ["All courses", "Advanced analytics", "Priority support"], activeUsers: 2 },
  { id: 3, name: "Enterprise", price: "$29.99/month", features: ["All Pro features", "Team management", "Dedicated account manager"], activeUsers: 1 },
];

export default function SubscriptionsContent() {
  const subscriptionDistribution = {
    Free: 2,
    Pro: 2,
    Enterprise: 1
  };
  const totalUsers = subscriptionDistribution.Free + subscriptionDistribution.Pro + subscriptionDistribution.Enterprise;

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>Subscription Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Free Users" 
            value={subscriptionDistribution.Free} 
            icon={<FaUsers style={{ color: '#3d312e' }} />} 
            trend={`${Math.round((subscriptionDistribution.Free / totalUsers) * 100)}% of total`} 
          />
          <StatCard 
            title="Pro Users" 
            value={subscriptionDistribution.Pro} 
            icon={<FaDollarSign style={{ color: '#3d312e' }} />} 
            trend={`${Math.round((subscriptionDistribution.Pro / totalUsers) * 100)}% of total`} 
          />
          <StatCard 
            title="Enterprise Users" 
            value={subscriptionDistribution.Enterprise} 
            icon={<FaDollarSign style={{ color: '#3d312e' }} />} 
            trend={`${Math.round((subscriptionDistribution.Enterprise / totalUsers) * 100)}% of total`} 
          />
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
        <h2 className="text-lg font-semibold mb-6" style={{ color: '#3d312e' }}>Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map(plan => (
            <SubscriptionPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>

      {/* Subscription Actions */}
      <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>Subscription Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-90" 
            style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
          >
            Export Subscriber List
          </button>
          <button 
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-90" 
            style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
          >
            View Payment History
          </button>
          <button 
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-90" 
            style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
          >
            Manage Discounts
          </button>
        </div>
      </div>
    </div>
  );
}