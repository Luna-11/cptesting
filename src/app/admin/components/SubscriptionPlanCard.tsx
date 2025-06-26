"use client";

type PlanName = "Enterprise" | "Professional" | "Basic"; // Add all your plan names here

interface PlanColors {
  bg: string;
  text: string;
  border: string;
}

interface Plan {
  name: PlanName;
  price: string;
  features: string[];
  recommended?: boolean;
  // ... any other plan properties
}

const planColors: Record<PlanName, PlanColors> = {
  Enterprise: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
  },
  Professional: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  Basic: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
};

export default function SubscriptionPlanCard({ plan }: { plan: Plan }) {
  // Safe access to colors since we've properly typed everything
  const colors = planColors[plan.name];

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border ${colors.border} ${colors.bg} ${colors.text} ${
        plan.recommended ? "ring-2 ring-offset-2 ring-yellow-400" : ""
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          {plan.recommended && (
            <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">
              Recommended
            </span>
          )}
        </div>
        
        <p className="mt-4 text-3xl font-extrabold">{plan.price}</p>
        
        <ul className="mt-6 space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg
                className={`w-5 h-5 mr-2 ${colors.text}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        
        <button
          className={`mt-8 w-full py-3 px-6 rounded-md font-medium ${colors.bg.replace("bg-100", "bg-500")} text-white hover:${colors.bg.replace("bg-100", "bg-600")} transition-colors`}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}