// src/app/admin/components/SubscriptionContent.tsx
"use client";

import SubscriptionPlanCard from "./SubscriptionPlanCard";

type SubscriptionPlan = {
  id: string;
  name: "Pro";
  price: string;
  features: string[];
  recommended?: boolean;
};

export default function SubscriptionContent() {
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "1",
      name: "Pro",
      price: "$9.99/mo",
      features: ["Feature 1", "Feature 2"],
    }
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