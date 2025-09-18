import { ReactNode } from "react";
import { cookies } from "next/headers";
import AuthWrapper from "./components/AuthWrapper";
import { UserRole } from "./components/Sidebar";
import "./globals.css";


interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value as UserRole | undefined;
  const userRole = role ?? UserRole.BASIC;

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthWrapper userRole={userRole}>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
