import React from 'react';
import {
  Shield,
  Zap,
  Target,
  Swords,
  Watch,
  FileSpreadsheet,
  BookOpen,
  Dumbbell,
  ClipboardList,
  Users,
  Calendar,
} from 'lucide-react';
import { UnitType, UserRole } from '../types';

interface NavigationTabsProps {
  activeUnit: UnitType;
  onSelectUnit: (unit: UnitType) => void;
  userRole: UserRole;
}

interface TabItem {
  id: UnitType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeUnit,
  onSelectUnit,
  userRole,
}) => {
  const tabs: TabItem[] = [
    { id: 'schedule', label: '📅 Season Schedule', icon: Calendar },
    { id: 'compliance', label: '⚡ Practice Hours & Compliance', icon: Zap },
    { id: 'offense', label: 'Offense', icon: Zap },
    { id: 'defense', label: 'Defense', icon: Shield },
    { id: 'st', label: 'Special Teams', icon: Target },
    { id: 'groups', label: 'Depth Chart', icon: ClipboardList },
    { id: 'scrimmage', label: 'Practice / Scrimmage', icon: Swords },
    { id: 'wristband', label: 'Wristband', icon: Watch },
    { id: 'scouting', label: 'Scouting', icon: FileSpreadsheet },
    { id: 'practice', label: 'Practice Plan', icon: ClipboardList },
    { id: 'drills', label: 'Drills Library', icon: Dumbbell },
    { id: 'guide', label: 'Playbooks & Guides', icon: BookOpen },
    { id: 'users', label: 'Staff & Users', icon: Users, adminOnly: true },
  ];

  return (
    <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/80 sticky top-[108px] z-30 shadow-md print:hidden">
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex gap-2 overflow-x-auto no-scrollbar items-center">
        {tabs
          .filter((tab) => !tab.adminOnly || userRole === 'admin')
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeUnit === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectUnit(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black tracking-tight whitespace-nowrap transition-all select-none border active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border-indigo-500/50 ring-1 ring-white/10'
                    : 'bg-slate-900/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-white' : 'text-slate-300'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
};
