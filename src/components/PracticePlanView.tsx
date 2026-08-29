import React, { useState, useRef } from 'react';
import {
  ClipboardList,
  Plus,
  Edit,
  Hash,
  Trash2,
  Save,
  Settings,
  Printer,
  Calendar,
  Clock,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  X,
  ArrowUp,
  ArrowDown,
  Check,
  UserPlus,
} from 'lucide-react';
import {
  PracticePlan,
  PracticePeriod,
  PracticeStation,
  DrillFolder,
  DrillItem,
  UserRole,
} from '../types';
import { formatTimeMinutes, parseTimeString } from '../services/storageService';

interface PracticePlanViewProps {
  practices: PracticePlan[];
  currentPracticeId: string | null;
  practiceTemplates: Record<string, PracticePeriod[]>;
  cascadingDrills: DrillFolder[];
  savedCoaches: string[];
  printFontSize: string;
  userRole: UserRole;
  onSelectPractice: (id: string) => void;
  onOpenNewPracticeModal: () => void;
  onEditPracticeDetails: () => void;
  onAutoNumberPractices: () => void;
  onDeletePractice: () => void;
  onApplyTemplate: (templateName: string) => void;
  onSaveCurrentAsTemplate: () => void;
  onOpenTemplatesModal: () => void;
  onUpdatePrintFontSize: (size: string) => void;
  onUpdateMeta: (field: keyof PracticePlan, value: any) => void;
  onAddPeriod: () => void;
  onRemovePeriod: (pIdx: number) => void;
  onMovePeriod: (pIdx: number, direction: number) => void;
  onUpdatePeriodTime: (pIdx: number, time: number) => void;
  onUpdatePeriodCategory: (pIdx: number, cat: string) => void;
  onUpdatePeriodFormat: (pIdx: number, format: 'static' | 'rotating') => void;
  onAddStationToPeriod: (pIdx: number) => void;
  onRemoveStationFromPeriod: (pIdx: number, sIdx: number) => void;
  onUpdateStation: (
    pIdx: number,
    sIdx: number,
    field: keyof PracticeStation,
    value: string
  ) => void;
  onSelectDrillForStation: (
    pIdx: number,
    sIdx: number,
    drill: DrillItem
  ) => void;
  onAddNewSavedCoach: (name: string) => void;
  onDeleteSavedCoach: (name: string) => void;
}

export const PracticePlanView: React.FC<PracticePlanViewProps> = ({
  practices,
  currentPracticeId,
  practiceTemplates,
  cascadingDrills,
  savedCoaches,
  printFontSize,
  userRole,
  onSelectPractice,
  onOpenNewPracticeModal,
  onEditPracticeDetails,
  onAutoNumberPractices,
  onDeletePractice,
  onApplyTemplate,
  onSaveCurrentAsTemplate,
  onOpenTemplatesModal,
  onUpdatePrintFontSize,
  onUpdateMeta,
  onAddPeriod,
  onRemovePeriod,
  onMovePeriod,
  onUpdatePeriodTime,
  onUpdatePeriodCategory,
  onUpdatePeriodFormat,
  onAddStationToPeriod,
  onRemoveStationFromPeriod,
  onUpdateStation,
  onSelectDrillForStation,
  onAddNewSavedCoach,
  onDeleteSavedCoach,
}) => {
  const [isTreeDropdownOpen, setIsTreeDropdownOpen] = useState(false);
  const [activeCoachPopup, setActiveCoachPopup] = useState<string | null>(null);
  const [collapsedTreeFolders, setCollapsedTreeFolders] = useState<
    Record<string, boolean>
  >({});

  const currentPlan =
    practices.find((p) => p.id === currentPracticeId) || practices[0];

  // Helper to flat list drills from matching category or all
  const getDrillsForCategory = (catName: string): DrillItem[] => {
    const flat: DrillItem[] = [];
    const traverse = (nodeList: DrillFolder[]) => {
      nodeList.forEach((n) => {
        if (n.drills) flat.push(...n.drills);
        if (n.subfolders) traverse(n.subfolders);
      });
    };

    const matchingFolder = cascadingDrills.find((f) => f.name === catName);
    if (matchingFolder) {
      if (matchingFolder.drills) flat.push(...matchingFolder.drills);
      if (matchingFolder.subfolders) traverse(matchingFolder.subfolders);
    } else {
      traverse(cascadingDrills);
    }
    return flat;
  };

  // Build hierarchical year -> week -> practice tree
  const practiceTree: Record<string, Record<string, PracticePlan[]>> = {};
  const sortedPractices = [...practices].sort((a, b) =>
    (a.date || '1970-01-01').localeCompare(b.date || '1970-01-01')
  );

  sortedPractices.forEach((p) => {
    const yr = p.year || '2026';
    const wk = p.weekFolder || 'Week 1';
    if (!practiceTree[yr]) practiceTree[yr] = {};
    if (!practiceTree[yr][wk]) practiceTree[yr][wk] = [];
    practiceTree[yr][wk].push(p);
  });

  let currentStartMinutes = parseTimeString(currentPlan?.startTime || '17:05');

  return (
    <div className="space-y-5">
      {/* Top Action & Navigation Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl p-5 print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          
          {/* Practice Tree Selector Dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTreeDropdownOpen(!isTreeDropdownOpen)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-100 flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {currentPlan
                    ? `${currentPlan.title} (${currentPlan.year} / ${currentPlan.weekFolder})`
                    : 'Select Practice...'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Hierarchical Dropdown Popup */}
              {isTreeDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 max-h-80 overflow-y-auto backdrop-blur-md">
                  {Object.keys(practiceTree).map((yr) => {
                    const yrKey = `yr_${yr}`;
                    const isYrCollapsed = collapsedTreeFolders[yrKey];

                    return (
                      <div key={yr} className="mb-2">
                        <div
                          onClick={() =>
                            setCollapsedTreeFolders({
                              ...collapsedTreeFolders,
                              [yrKey]: !isYrCollapsed,
                            })
                          }
                          className="px-2.5 py-1.5 text-xs font-black text-indigo-300 flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 rounded-xl select-none"
                        >
                          {isYrCollapsed ? (
                            <Folder className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>Season {yr}</span>
                        </div>

                        {!isYrCollapsed && (
                          <div className="pl-3 space-y-1 mt-1 border-l border-slate-800 ml-3">
                            {Object.keys(practiceTree[yr]).map((wk) => {
                              const wkKey = `wk_${yr}_${wk}`;
                              const isWkCollapsed = collapsedTreeFolders[wkKey];

                              return (
                                <div key={wk}>
                                  <div
                                    onClick={() =>
                                      setCollapsedTreeFolders({
                                        ...collapsedTreeFolders,
                                        [wkKey]: !isWkCollapsed,
                                      })
                                    }
                                    className="px-2 py-1 text-[11.5px] font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 rounded-lg select-none"
                                  >
                                    {isWkCollapsed ? (
                                      <Folder className="w-3 h-3 text-amber-400" />
                                    ) : (
                                      <FolderOpen className="w-3 h-3 text-amber-400" />
                                    )}
                                    <span>{wk}</span>
                                  </div>

                                  {!isWkCollapsed && (
                                    <div className="pl-3 space-y-0.5 mt-0.5">
                                      {practiceTree[yr][wk].map((p) => (
                                        <button
                                          key={p.id}
                                          onClick={() => {
                                            onSelectPractice(p.id);
                                            setIsTreeDropdownOpen(false);
                                          }}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                            p.id === currentPracticeId
                                              ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/30 font-black'
                                              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                                          }`}
                                        >
                                          <span>{p.title}</span>
                                          <span className="text-[10px] text-slate-500 font-mono">
                                            {p.date}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Practice Plan Management Buttons */}
            {userRole === 'admin' && (
              <>
                <button
                  onClick={onOpenNewPracticeModal}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Plan</span>
                </button>
                <button
                  onClick={onEditPracticeDetails}
                  title="Edit Date, Day, Year, Week title"
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-1 transition-all"
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Details</span>
                </button>
                <button
                  onClick={onAutoNumberPractices}
                  title="Auto-number practice days sequentially"
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-sky-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-1 transition-all"
                >
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                  <span>Auto #</span>
                </button>
                <button
                  onClick={onDeletePractice}
                  title="Delete this practice plan"
                  className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Templates & Print Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {userRole === 'admin' && (
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl">
                <span className="text-[11px] font-black uppercase text-slate-400">
                  Template:
                </span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onApplyTemplate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="">-- Apply --</option>
                  {Object.keys(practiceTemplates).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onSaveCurrentAsTemplate}
                  title="Save current plan as template"
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                </button>
                <button
                  onClick={onOpenTemplatesModal}
                  title="Manage templates"
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Print font size */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl">
              <span className="text-[11px] font-black uppercase text-slate-400">Font:</span>
              <select
                value={printFontSize}
                onChange={(e) => onUpdatePrintFontSize(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg px-1.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="9">9px (Tight)</option>
                <option value="10">10px (Default)</option>
                <option value="11">11px (Med)</option>
                <option value="12">12px (Large)</option>
                <option value="13">13px (XL)</option>
                <option value="14">14px (2XL)</option>
              </select>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={onAddPeriod}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-slate-800 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>
          </div>
        </div>

        {/* Practice Meta Bar */}
        {currentPlan && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs font-semibold text-slate-300">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Year
              </span>
              <input
                type="text"
                value={currentPlan.year || '2026'}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('year', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Week Folder
              </span>
              <input
                type="text"
                value={currentPlan.weekFolder || 'Week 1'}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('weekFolder', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Practice Date
              </span>
              <input
                type="date"
                value={currentPlan.date || ''}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('date', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Day of Week
              </span>
              <select
                value={currentPlan.day || 'Wednesday'}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('day', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Start Time
              </span>
              <input
                type="time"
                value={currentPlan.startTime || '17:05'}
                disabled={userRole !== 'admin'}
                onChange={(e) => onUpdateMeta('startTime', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-100 disabled:bg-transparent disabled:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Printable Sheet Title Header (Shown only on Print) */}
      <div className="hidden print:block mb-3 border-b-2 border-black pb-2 text-center">
        <h1 className="font-extrabold text-base uppercase text-black">
          Mahopac 10U Practice Itinerary &amp; Script
        </h1>
        <p className="text-xs font-bold text-black mt-0.5">
          {currentPlan?.title} | Date: {currentPlan?.date} ({currentPlan?.day}) | Start: {currentPlan?.startTime} | {currentPlan?.weekFolder}
        </p>
      </div>

      {/* Main Practice Schedule Table */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full border-collapse practice-table text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-300 font-black uppercase text-[11px] border-b border-slate-800">
              <th className="py-3 px-3.5 text-left w-28">Time / Period</th>
              <th className="py-3 px-3.5 text-left w-44">Category / Format</th>
              <th className="py-3 px-3.5 text-left">Stations / Drills</th>
              <th className="py-3 px-3.5 text-left w-40">Coaches Assigned</th>
              <th className="py-3 px-3.5 text-left w-48">Coaching Focus</th>
              {userRole === 'admin' && (
                <th className="py-3 px-2 text-center w-24 print:hidden">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {(currentPlan?.plan || []).map((row, pIdx) => {
              const rowDuration = Number(row.time) || 0;
              const periodEndMin = currentStartMinutes + rowDuration;
              const timeString = `${formatTimeMinutes(currentStartMinutes)} - ${formatTimeMinutes(periodEndMin)}`;
              const isRotating = row.format === 'rotating';

              const stationsList =
                row.stations && row.stations.length > 0
                  ? row.stations
                  : [{ name: '', desc: '', coach: '', focus: '' }];
              const numStations = stationsList.length;
              const stationDuration =
                isRotating && numStations > 0
                  ? rowDuration / numStations
                  : rowDuration;

              const categoryDrills = getDrillsForCategory(row.category);

              const element = stationsList.map((station, sIdx) => {
                const isFirstStationInPeriod = sIdx === 0;
                const coachPopupId = `coach_popup_${pIdx}_${sIdx}`;
                const isCoachPopupOpen = activeCoachPopup === coachPopupId;

                const assignedCoachTokens = (station.coach || '')
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean);

                const stationStartMin =
                  currentStartMinutes + sIdx * stationDuration;
                const stationEndMin = stationStartMin + stationDuration;

                return (
                  <tr
                    key={`${pIdx}_${sIdx}`}
                    className={`border-b border-slate-800/80 ${
                      pIdx % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-950/40'
                    }`}
                  >
                    {/* Time / Period Cell (Rowspan) */}
                    {isFirstStationInPeriod && (
                      <td
                        rowSpan={numStations}
                        className="py-3.5 px-3.5 align-top border-r border-slate-800 font-bold"
                      >
                        <div className="text-xs font-black text-indigo-300 uppercase tracking-tight print:hidden">
                          Period {pIdx + 1}
                        </div>
                        <div className="hidden print:block text-xs font-black text-slate-950 uppercase tracking-tight">
                          Period {pIdx + 1}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 print:hidden">
                          <input
                            type="number"
                            value={row.time}
                            disabled={userRole !== 'admin'}
                            onChange={(e) =>
                              onUpdatePeriodTime(
                                pIdx,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-12 bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-100"
                          />
                          <span className="text-[11px] text-slate-400 font-medium">mins</span>
                        </div>
                        <div className="text-[11px] font-extrabold text-amber-300 mt-1.5 font-mono print:hidden">
                          {timeString}
                        </div>
                        <div className="hidden print:block text-[11px] font-extrabold text-slate-900 font-mono mt-0.5">
                          {timeString}
                        </div>
                        <div className="hidden print:block text-[10px] font-bold text-slate-600 mt-0.5">
                          ({row.time} min)
                        </div>
                      </td>
                    )}

                    {/* Category / Format Cell (Rowspan) */}
                    {isFirstStationInPeriod && (
                      <td
                        rowSpan={numStations}
                        className="py-3.5 px-3.5 align-top border-r border-slate-800 space-y-2"
                      >
                        <div className="print:hidden">
                          <select
                            value={row.category}
                            disabled={userRole !== 'admin'}
                            onChange={(e) =>
                              onUpdatePeriodCategory(pIdx, e.target.value)
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-200"
                          >
                            {cascadingDrills.map((folder) => (
                              <option key={folder.name} value={folder.name}>
                                {folder.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="hidden print:block font-black text-slate-950 text-xs uppercase tracking-tight">
                          {row.category}
                        </div>

                        {/* Format selector (Static vs Rotating) */}
                        <div className="print:hidden">
                          <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-wider">
                            Station Mode:
                          </label>
                          <select
                            value={row.format || 'static'}
                            disabled={userRole !== 'admin'}
                            onChange={(e) =>
                              onUpdatePeriodFormat(
                                pIdx,
                                e.target.value as 'static' | 'rotating'
                              )
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-slate-300"
                          >
                            <option value="static">Static Group</option>
                            <option value="rotating">Rotating Stations</option>
                          </select>
                        </div>
                        <div className="hidden print:block text-[10px] font-bold text-slate-600 mt-0.5">
                          {isRotating ? 'Rotating Stations' : 'Full Group'}
                        </div>
                      </td>
                    )}

                    {/* Station / Drill Title & Instructions */}
                    <td className="py-3 px-3.5 align-top border-r border-slate-800 space-y-2">
                      {isRotating && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-[10.5px] font-black border border-indigo-500/20 print:bg-slate-100 print:text-slate-900 print:border-slate-300 print:py-0.5 print:px-1.5">
                          <Clock className="w-3 h-3 print:hidden" />
                          <span className="font-mono print:text-[9.5px]">
                            Station {sIdx + 1}: {formatTimeMinutes(stationStartMin)} -{' '}
                            {formatTimeMinutes(stationEndMin)} (
                            {Math.round(stationDuration)} min)
                          </span>
                        </div>
                      )}

                      {/* Drill Quick Select Dropdown */}
                      <div className="print:hidden">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const found = categoryDrills.find(
                              (d) => d.name === e.target.value
                            );
                            if (found) {
                              onSelectDrillForStation(pIdx, sIdx, found);
                              e.target.value = '';
                            }
                          }}
                          className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-indigo-300"
                        >
                          <option value="">-- Choose Drill from Library --</option>
                          {categoryDrills.map((d, dIdx) => (
                            <option key={dIdx} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Station Title */}
                      <input
                        type="text"
                        value={station.name || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateStation(pIdx, sIdx, 'name', e.target.value)
                        }
                        placeholder="Drill / Group Name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-100 focus:ring-1 focus:ring-indigo-500 disabled:bg-transparent disabled:border-transparent print:hidden"
                      />

                      {/* Station Details */}
                      <textarea
                        rows={2}
                        value={station.desc || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateStation(pIdx, sIdx, 'desc', e.target.value)
                        }
                        placeholder="Instructions, alignments, cone layout..."
                        className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-300 leading-relaxed focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-600 print:hidden"
                      />

                      {/* Print view */}
                      <div className="hidden print:block">
                        <div className="text-[11px] font-black text-slate-950 uppercase tracking-tight">
                          {station.name || 'Station / Drill'}
                        </div>
                        {station.desc && (
                          <div className="text-[10px] font-medium text-slate-800 mt-1 whitespace-pre-wrap leading-snug">
                            {station.desc}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Coaches Column */}
                    <td className="py-3 px-3.5 align-top border-r border-slate-800 relative">
                      <textarea
                        rows={2}
                        value={station.coach || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateStation(pIdx, sIdx, 'coach', e.target.value)
                        }
                        placeholder="Type coach names..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold text-slate-100 leading-tight focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-600 print:hidden"
                      />

                      <div
                        onClick={() =>
                          setActiveCoachPopup(
                            isCoachPopupOpen ? null : coachPopupId
                          )
                        }
                        className="text-[10.5px] text-indigo-400 font-black cursor-pointer mt-1.5 hover:underline print:hidden flex items-center gap-1"
                      >
                        <span>Select Coaches</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </div>

                      <div className="hidden print:block text-[10.5px] font-bold text-slate-950 leading-snug">
                        {station.coach || '—'}
                      </div>

                      {/* Coach Multi-select Popup */}
                      {isCoachPopupOpen && (
                        <div
                          className="absolute left-0 top-full mt-1.5 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2 print:hidden backdrop-blur-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-[11px] font-black text-slate-200">
                              Assigned Staff
                            </span>
                            <button
                              onClick={() => setActiveCoachPopup(null)}
                              className="text-slate-400 hover:text-slate-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1 max-h-36 overflow-y-auto">
                            {savedCoaches.map((coachName) => {
                              const isChecked =
                                assignedCoachTokens.includes(coachName) ||
                                assignedCoachTokens.includes(`Coach ${coachName}`);

                              return (
                                <div
                                  key={coachName}
                                  className="flex items-center justify-between p-1.5 hover:bg-slate-800/80 rounded-lg"
                                >
                                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        let updatedTokens = [...assignedCoachTokens];
                                        if (e.target.checked) {
                                          if (!updatedTokens.includes(coachName))
                                            updatedTokens.push(coachName);
                                        } else {
                                          updatedTokens = updatedTokens.filter(
                                            (t) =>
                                              t !== coachName &&
                                              t !== `Coach ${coachName}`
                                          );
                                        }
                                        onUpdateStation(
                                          pIdx,
                                          sIdx,
                                          'coach',
                                          updatedTokens.join(', ')
                                        );
                                      }}
                                      className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                                    />
                                    <span className="text-xs font-bold text-slate-200">
                                      {coachName}
                                    </span>
                                  </label>
                                  <button
                                    onClick={() => onDeleteSavedCoach(coachName)}
                                    className="text-rose-400 hover:text-rose-300 p-0.5"
                                    title="Delete Coach"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-slate-800 text-center">
                            <button
                              onClick={() => {
                                const name = prompt('Enter new Coach Name:');
                                if (name && name.trim())
                                  onAddNewSavedCoach(name.trim());
                              }}
                              className="w-full py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Add New Coach</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Coaching Focus Column */}
                    <td className="py-3 px-3.5 align-top border-r border-slate-800">
                      <textarea
                        rows={2}
                        value={station.focus || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateStation(pIdx, sIdx, 'focus', e.target.value)
                        }
                        placeholder="Key coaching cues & assignments..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-semibold text-slate-200 leading-tight focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-600 print:hidden"
                      />
                      <div className="hidden print:block text-[10.5px] font-medium text-slate-900 whitespace-pre-wrap leading-snug">
                        {station.focus || '—'}
                      </div>
                    </td>

                    {/* Period Actions (Only on first station row in the period) */}
                    {userRole === 'admin' && isFirstStationInPeriod && (
                      <td
                        rowSpan={numStations}
                        className="py-3.5 px-2 align-top text-center print:hidden"
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onMovePeriod(pIdx, -1)}
                              title="Move Period Up"
                              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onMovePeriod(pIdx, 1)}
                              title="Move Period Down"
                              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => onAddStationToPeriod(pIdx)}
                            className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sky-300 text-[10px] font-bold rounded-lg flex items-center gap-0.5 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5 text-sky-400" />
                            <span>Station</span>
                          </button>
                          <button
                            onClick={() => onRemovePeriod(pIdx)}
                            title="Delete Period"
                            className="p-1 text-rose-400 hover:bg-rose-950/50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              });

              currentStartMinutes = periodEndMin;
              return element;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
