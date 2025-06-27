// src/app/admin/components/SubscriptionPlanCard.tsx
"use client";

type PlanName = "Pro";

interface PlanColors {
  bg: string;
  text: string;
  border: string;
}

interface Plan {
  id: string; // Added this since your usage shows plan.id
  name: PlanName;
  price: string;
  features: string[];
  recommended?: boolean;
}

const planColors: Record<PlanName, PlanColors> = {
  Pro: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
};

export default function SubscriptionPlanCard({ plan }: { plan: Plan }) {
  const colors = planColors[plan.name];

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border ${colors.border} ${colors.bg} ${colors.text} ${
        plan.recommended ? "ring-2 ring-offset-2 ring-yellow-400" : ""
      }`}
    >
      {/* Rest of your component remains the same */}
    </div>
  );
}