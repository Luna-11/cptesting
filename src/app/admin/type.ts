export type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User" | "Tutor";
  studyHours?: number;
  completedTasks?: number;
  streak?: number;
  courses?: string[];
  subscription: "Free" | "Pro" | "Enterprise";
  lastActive?: string;
  joinDate?: string;
};

export type Activity = {
  user: string;
  action: string;
  time: string;
};

export type Course = {
  id: number;
  title: string;
  enrolledUsers: number;
  completionRate: number;
};

export type SubscriptionPlan = {
  id: number;
  name: string;
  price: string;
  features: string[];
  activeUsers: number;
};

export type Report = {
  id: number;
  title: string;
  date: string;
  type: "Usage" | "Activity" | "Financial";
  downloadUrl: string;
};

export type ActiveTab = "dashboard" | "users" | "subscriptions" | "reports" | "engagement" | "settings";