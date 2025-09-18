// app/layout.tsx
import { Work_Sans } from "next/font/google";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import AuthWrapper from "./components/AuthWrapper";
import { UserRole } from "./components/Sidebar";
import "./globals.css";

// Configure Work Sans with both className and variable
const workSans = Work_Sans({ 
  subsets: ["latin"], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-work-sans",
  display: "swap",   // optional but recommended
});

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value as UserRole | undefined;
  const userRole = role ?? UserRole.BASIC;

  return (
    <html lang="en" className={`${workSans.variable} ${workSans.className}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthWrapper userRole={userRole}>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
