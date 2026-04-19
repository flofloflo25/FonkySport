import React from 'react';
import { LayoutDashboard, Dumbbell, BookOpen, TrendingUp, User, type LucideIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Page } from '@/types';

const TABS: { id: Page; label: string; Icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Accueil', Icon: LayoutDashboard },
  { id: 'programs',  label: 'Plans',   Icon: BookOpen },
  { id: 'workout',   label: 'Séance',  Icon: Dumbbell },
  { id: 'progress',  label: 'Progrès', Icon: TrendingUp },
  { id: 'profile',   label: 'Profil',  Icon: User },
];

export default function Navigation() {
  const { currentPage, navigate, activeWorkout } = useStore(s => ({
    currentPage: s.currentPage,
    navigate: s.navigate,
    activeWorkout: s.activeWorkout,
  }));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-t border-[#1e1e1e] safe-bottom">
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ id, label, Icon }) => {
          const active = currentPage === id;
          const isWorkout = id === 'workout';
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 transition-colors relative ${
                active ? 'text-orange-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              {isWorkout && activeWorkout && (
                <span className="absolute top-2 right-1/2 translate-x-4 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
