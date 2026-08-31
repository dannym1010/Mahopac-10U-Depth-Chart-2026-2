import React, { useState, useEffect } from 'react';
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
  Settings,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  GripVertical,
  Star,
  Sliders,
} from 'lucide-react';
import { UnitType, UserRole } from '../types';
import { safeJSONParse, safeJSONSet } from '../services/storageService';

interface NavigationTabsProps {
  activeUnit: UnitType;
  onSelectUnit: (unit: UnitType) => void;
  userRole: UserRole;
  depthSubUnit?: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage';
  onSelectDepthSubUnit?: (subUnit: 'offense' | 'defense' | 'st' | 'groups' | 'scrimmage') => void;
  defaultScreen?: UnitType;
  onSetDefaultScreen?: (screen: UnitType) => void;
  onOpenPreferencesModal?: () => void;
}

export interface NavTabItem {
  id: UnitType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export const DEFAULT_NAV_TABS: NavTabItem[] = [
  { id: 'schedule', label: '📅 Season Schedule', icon: Calendar },
  { id: 'compliance', label: '⚡ Practice Hours & Compliance', icon: Zap },
  { id: 'depth_chart', label: '📋 Depth Chart', icon: ClipboardList },
  { id: 'wristband', label: '⌚ Wristband', icon: Watch },
  { id: 'scouting', label: '📊 Scouting', icon: FileSpreadsheet },
  { id: 'practice', label: '📋 Practice Plan', icon: ClipboardList },
  { id: 'drills', label: '🏋️ Drills Library', icon: Dumbbell },
  { id: 'guide', label: '📖 Playbooks & Guides', icon: BookOpen },
  { id: 'users', label: '👥 Staff & Users', icon: Users, adminOnly: true },
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeUnit,
  onSelectUnit,
  userRole,
  depthSubUnit = 'offense',
  onSelectDepthSubUnit,
  defaultScreen,
  onSetDefaultScreen,
  onOpenPreferencesModal,
}) => {
  const [tabOrder, setTabOrder] = useState<string[]>(() => {
    const saved = safeJSONParse<string[]>('footballTopTabOrder', []);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      // Ensure all current valid tab ids exist in saved order
      const validIds = DEFAULT_NAV_TABS.map((t) => t.id);
      const filtered = saved.filter((id) => validIds.includes(id as UnitType));
      validIds.forEach((id) => {
        if (!filtered.includes(id)) filtered.push(id);
      });
      return filtered;
    }
    return DEFAULT_NAV_TABS.map((t) => t.id);
  });

  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  // Sync tab order changes to localStorage
  const handleSaveTabOrder = (newOrder: string[]) => {
    setTabOrder(newOrder);
    safeJSONSet('footballTopTabOrder', newOrder);
  };

  const handleResetTabOrder = () => {
    const defaultIds = DEFAULT_NAV_TABS.map((t) => t.id);
    setTabOrder(defaultIds);
    safeJSONSet('footballTopTabOrder', defaultIds);
  };

  const handleMoveTab = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tabOrder.length) return;
    const newOrder = [...tabOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    handleSaveTabOrder(newOrder);
  };

  // Build sorted tabs list
  const tabMap = new Map(DEFAULT_NAV_TABS.map((t) => [t.id, t]));
  const orderedTabs = tabOrder
    .map((id) => tabMap.get(id as UnitType))
    .filter((t): t is NavTabItem => Boolean(t))
    .filter((tab) => !tab.adminOnly || userRole === 'admin');

  // Check if active unit is one of the depth chart sub-units
  const isDepthChartActive =
    activeUnit === 'depth_chart' ||
    ['offense', 'defense', 'st', 'groups', 'scrimmage'].includes(activeUnit);

  const handleTopTabClick = (tabId: UnitType) => {
    if (tabId === 'depth_chart') {
      // If clicking depth chart, select current depthSubUnit or 'offense'
      if (['offense', 'defense', 'st', 'groups', 'scrimmage'].includes(activeUnit)) {
        // already on a depth unit
      } else {
        onSelectUnit(depthSubUnit || 'offense');
      }
    } else {
      onSelectUnit(tabId);
    }
  };

  return (
    <>
      <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/80 sticky top-[108px] z-30 shadow-md print:hidden">
        <div className="max-w-[1700px] mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Scrollable Nav Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar items-center py-0.5 flex-1 min-w-0">
            {orderedTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                tab.id === 'depth_chart' ? isDepthChartActive : activeUnit === tab.id;
              const isDefaultTab =
                (defaultScreen || 'schedule') === tab.id ||
                (defaultScreen === 'offense' && tab.id === 'depth_chart');

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTopTabClick(tab.id)}
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
                  {isDefaultTab && (
                    <span
                      title="⭐ Default Landing Screen"
                      className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        isActive
                          ? 'bg-white/20 text-amber-300'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      ★ Default
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions: Defaults & Reorder */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenPreferencesModal && (
              <button
                onClick={onOpenPreferencesModal}
                title="Select Default Screen & Team"
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-750 text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400/20 text-amber-400" />
                <span className="hidden sm:inline">Set Defaults</span>
              </button>
            )}

            {/* Reorder Tabs Action Button */}
            <button
              onClick={() => setIsReorderModalOpen(true)}
              title="Reorder Navigation Tabs"
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reorder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reorder Navigation Tabs Modal */}
      {isReorderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-100 text-base">Reorder &amp; Default Screen</h3>
                  <p className="text-xs text-slate-400">Reorder top navigation tabs and pick your default startup screen</p>
                </div>
              </div>
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab List */}
            <div className="p-5 overflow-y-auto space-y-2 max-h-[55vh]">
              {tabOrder.map((tabId, index) => {
                const tabInfo = tabMap.get(tabId as UnitType);
                if (!tabInfo) return null;
                const Icon = tabInfo.icon;
                const isFirst = index === 0;
                const isLast = index === tabOrder.length - 1;
                const isDefaultTab =
                  (defaultScreen || 'schedule') === tabId ||
                  (defaultScreen === 'offense' && tabId === 'depth_chart');

                return (
                  <div
                    key={tabId}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                      isDefaultTab
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-inner'
                        : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 font-mono text-xs font-black flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-bold text-xs text-slate-200 truncate">
                          {tabInfo.label}
                        </span>
                        {tabInfo.adminOnly && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-black uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Set Default Screen Button */}
                      {onSetDefaultScreen && (
                        <button
                          type="button"
                          onClick={() => onSetDefaultScreen(tabId as UnitType)}
                          title={
                            isDefaultTab
                              ? '⭐ Default Startup Screen'
                              : 'Set as Default Startup Screen'
                          }
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                            isDefaultTab
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900 border border-slate-700'
                          }`}
                        >
                          <Star
                            className={`w-3 h-3 ${
                              isDefaultTab ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                            }`}
                          />
                          <span>{isDefaultTab ? 'Default' : 'Set Default'}</span>
                        </button>
                      )}

                      {/* Move Up / Down Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveTab(index, 'up')}
                          title="Move Up"
                          className={`p-1.5 rounded-xl border transition-all ${
                            isFirst
                              ? 'text-slate-600 border-slate-800 cursor-not-allowed'
                              : 'text-slate-300 hover:text-white bg-slate-900 border-slate-700 hover:border-slate-500 active:scale-95'
                          }`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveTab(index, 'down')}
                          title="Move Down"
                          className={`p-1.5 rounded-xl border transition-all ${
                            isLast
                              ? 'text-slate-600 border-slate-800 cursor-not-allowed'
                              : 'text-slate-300 hover:text-white bg-slate-900 border-slate-700 hover:border-slate-500 active:scale-95'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetTabOrder}
                className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-1.5 hover:border-rose-500/40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Order</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReorderModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
