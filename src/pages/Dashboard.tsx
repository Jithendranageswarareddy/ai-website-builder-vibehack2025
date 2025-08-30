import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { AuthModal } from '@/components/auth/AuthModal';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);
  const navigate = useNavigate();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          navigate('/');
        }}
        defaultTab="signin"
      />
    );
  }

  const handleCreateWebsite = () => {
    navigate('/builder');
  };

  const handleEditWebsite = (websiteId: string) => {
    navigate(`/builder?website=${websiteId}`);
  };

  return (
    <UserDashboard
      onCreateWebsite={handleCreateWebsite}
      onEditWebsite={handleEditWebsite}
    />
  );
};

export default Dashboard;
