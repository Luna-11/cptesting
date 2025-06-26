'use client';
import { useState } from 'react';
import { ActiveTab, User } from './type';
import DashboardContent from './components/DashboardContent';
import UsersContent from './components/UserContent';
import SubscriptionsContent from './components/SubscriptionsContent';
import ReportsContent from './components/ReportContent';
import EngagementContent from './components/EngagementContent';
import SettingsContent from './components/SettingContent';
import UserModal from './components/UserModal';
import AdminLayout from './components/AdminLayout';


export const dynamicParams = false;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({});

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "users":
        return <UsersContent 
          setShowUserModal={setShowUserModal}
          setSelectedUser={setSelectedUser}
          setUserFormData={setUserFormData}
        />;
      case "subscriptions":
        return <SubscriptionsContent />;
      case "reports":
        return <ReportsContent />;
      case "engagement":
        return <EngagementContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
<AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
  {renderContent()}
  {showUserModal && (
    <UserModal
      selectedUser={selectedUser}
      userFormData={userFormData}
      setUserFormData={setUserFormData}
      setShowUserModal={setShowUserModal}
      saveUserChanges={() => {
        console.log("Saving user changes:", userFormData);
        setShowUserModal(false);
      }}
    />
  )}
</AdminLayout>


  );
}