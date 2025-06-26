'use client';
import { SubscriptionPlan } from '../type';
import { FaCrown, FaStar, FaGem } from 'react-icons/fa';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
}

export default function SubscriptionPlanCard({ plan }: SubscriptionPlanCardProps) {
  // Get appropriate icon for each plan
  const PlanIcon = {
    'Enterprise': FaCrown,
    'Pro': FaStar,
    'Free': FaGem
  }[plan.name];

  // Color scheme for different plans
  const planColors = {
    'Enterprise': {
      bg: '#3d312e',
      text: '#f0eeee',
      border: '#948585'
    },
    'Pro': {
      bg: '#948585',
      text: '#f0eeee',
      border: '#bba2a2'
    },
    'Free': {
      bg: '#f0eeee',
      text: '#3d312e',
      border: '#bba2a2'
    }
  };

  return (
    <div 
      className="rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{ 
        backgroundColor: planColors[plan.name].bg,
        color: planColors[plan.name].text,
        border: `1px solid ${planColors[plan.name].border}`
      }}
    >
      {/* Plan header with accent bar */}
      <div 
        className="h-2"
        style={{ 
          backgroundColor: planColors[plan.name].border 
        }}
      ></div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <PlanIcon className="text-2xl" />
        </div>
        
        <p className="text-2xl font-bold mb-4">{plan.price}</p>
        
        {/* Features list */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">FEATURES:</h4>
          <ul className="space-y-2 text-sm">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span> {feature}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Active users */}
        <div className="text-sm mb-6">
          <span className="font-medium">{plan.activeUsers}</span> active subscribers
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <button 
            className="flex-1 py-2 text-sm rounded transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: plan.name === 'Free' ? '#3d312e' : '#f0eeee',
              color: plan.name === 'Free' ? '#f0eeee' : '#3d312e'
            }}
          >
            Manage
          </button>
          <button 
            className="flex-1 py-2 text-sm rounded transition-all duration-200 hover:opacity-90"
            style={{ 
              border: `1px solid ${planColors[plan.name].border}`,
              backgroundColor: 'transparent'
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}