// src/app/admin/components/SubscriptionContent.tsx
"use client";

import SubscriptionPlanCard from "./SubscriptionPlanCard";

type SubscriptionPlan = {
  id: string;
  name: "Enterprise" | "Professional" | "Basic"; // Must match PlanName
  price: string;
  features: string[];
  recommended?: boolean;
};

export default function SubscriptionContent() {
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "1",
      name: "Basic",
      price: "$9.99/mo",
      features: ["Feature 1", "Feature 2"],
    },
    {
      id: "2",
      name: "Professional",
      price: "$19.99/mo",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      recommended: true,
    },
    {
      id: "3",
      name: "Enterprise",
      price: "$49.99/mo",
      features: ["All Features", "Priority Support"],
    },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <SubscriptionPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}