import React from 'react';
import { useStore } from '@/store/useStore';
import Onboarding from '@/components/Onboarding';
import Navigation from '@/components/Navigation';
import Dashboard from '@/pages/Dashboard';
import WorkoutPage from '@/pages/Workout';
import HistoryPage from '@/pages/History';
import ProgressPage from '@/pages/Progress';
import ProfilePage from '@/pages/Profile';
import ProgramsPage from '@/pages/Programs';

function PageContent() {
  const currentPage = useStore(s => s.currentPage);

  switch (currentPage) {
    case 'dashboard': return <Dashboard />;
    case 'programs':  return <ProgramsPage />;
    case 'workout':   return <WorkoutPage />;
    case 'history':   return <HistoryPage />;
    case 'progress':  return <ProgressPage />;
    case 'profile':   return <ProfilePage />;
    default:          return <Dashboard />;
  }
}

export default function App() {
  const setupDone = useStore(s => s.user.setupDone);

  if (!setupDone) {
    return <Onboarding />;
  }

  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto overflow-x-hidden">
      {/* Page content — scrollable, padded for nav */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
        <PageContent />
      </main>

      {/* Bottom navigation */}
      <Navigation />
    </div>
  );
}
