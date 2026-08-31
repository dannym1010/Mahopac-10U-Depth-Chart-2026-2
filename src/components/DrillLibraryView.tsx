import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dumbbell,
  Folder,
  FolderOpen,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Cloud,
  GripVertical,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { DrillFolder, DrillItem, UserRole } from '../types';

interface DrillRowItemProps {
  drill: DrillItem;
  pathKey: string;
  drillIdx: number;
  userRole: UserRole;
  allFolders: { path: string; name: string }[];
  onUpdateDrill: (
    pathKey: string,
    drillIdx: number,
    field: keyof DrillItem,
    value: string
  ) => void;
  onDeleteDrill: (pathKey: string, drillIdx: number) => void;
  onMoveDrillToFolder: (
    sourcePath: string,
    drillIdx: number,
    targetPath: string
  ) => void;
  onDragStart: () => void;
}

const DrillRowItem: React.FC<DrillRowItemProps> = ({
  drill,
  pathKey,
  drillIdx,
  userRole,
  allFolders,
  onUpdateDrill,
  onDeleteDrill,
  onMoveDrillToFolder,
  onDragStart,
}) => {
  const [name, setName] = useState(drill.name || '');
  const [desc, setDesc] = useState(drill.desc || '');
  const [keyVal, setKeyVal] = useState(drill.key || '');
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (!isEditingRef.current) {
      setName(drill.name || '');
      setDesc(drill.desc || '');
      setKeyVal(drill.key || '');
    }
  }, [drill.name, drill.desc, drill.key]);

  const handleNameChange = (val: string) => {
    setName(val);
    onUpdateDrill(pathKey, drillIdx, 'name', val);
  };

  const handleDescChange = (val: string) => {
    setDesc(val);
    onUpdateDrill(pathKey, drillIdx, 'desc', val);
  };

  const handleKeyChange = (val: string) => {
    setKeyVal(val);
    onUpdateDrill(pathKey, drillIdx, 'key', val);
  };

  return (
    <div
      draggable={userRole === 'admin'}
      onDragStart={onDragStart}
      className="grid grid-cols-12 gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 items-start transition-all"
    >
      {/* Drill Name */}
      <div className="col-span-12 md:col-span-3 flex items-start gap-2">
        {userRole === 'admin' && (
          <GripVertical className="w-4 h-4 text-slate-500 mt-2 flex-shrink-0 cursor-grab active:cursor-grabbing" />
        )}
        <input
          type="text"
          value={name}
          disabled={userRole !== 'admin'}
          onFocus={() => {
            isEditingRef.current = true;
          }}
          onBlur={() => {
            isEditingRef.current = false;
            onUpdateDrill(pathKey, drillIdx, 'name', name);
          }}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Drill Title"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-transparent disabled:border-transparent"
        />
      </div>

      {/* Description / Instructions */}
      <div className="col-span-12 md:col-span-5">
        <textarea
          rows={2}
          value={desc}
          disabled={userRole !== 'admin'}
          onFocus={() => {
            isEditingRef.current = true;
          }}
          onBlur={() => {
            isEditingRef.current = false;
            onUpdateDrill(pathKey, drillIdx, 'desc', desc);
          }}
          onChange={(e) => handleDescChange(e.target.value)}
          placeholder="Setup instructions, number of players, cone placement..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-300 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-600"
        />
      </div>

      {/* Coaching Key / Focus */}
      <div className="col-span-12 md:col-span-2">
        <textarea
          rows={2}
          value={keyVal}
          disabled={userRole !== 'admin'}
          onFocus={() => {
            isEditingRef.current = true;
          }}
          onBlur={() => {
            isEditingRef.current = false;
            onUpdateDrill(pathKey, drillIdx, 'key', keyVal);
          }}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder="Key coaching cues (e.g. eyes on hips)..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-300 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-600"
        />
      </div>

      {/* Move to folder & Delete */}
      <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1.5 pt-1">
        {userRole === 'admin' ? (
          <>
            <select
              value={pathKey}
              onChange={(e) =>
                onMoveDrillToFolder(pathKey, drillIdx, e.target.value)
              }
              className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-[11px] font-semibold text-slate-300 max-w-[115px] truncate focus:outline-none"
            >
              {allFolders.map((f) => (
                <option key={f.path} value={f.path}>
                  ↳ {f.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => onDeleteDrill(pathKey, drillIdx)}
              title="Delete Drill"
              className="p-1.5 hover:bg-rose-950/50 text-rose-400 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

interface DrillLibraryViewProps {
  cascadingDrills: DrillFolder[];
  collapsedFolders: Record<string, boolean>;
  userRole: UserRole;
  onToggleFolder: (pathKey: string) => void;
  onAddTopFolder: () => void;
  onAddSubfolder: (pathKey: string) => void;
  onAddDrill: (pathKey: string) => void;
  onRenameFolder: (pathKey: string) => void;
  onDeleteFolder: (pathKey: string) => void;
  onMoveFolder: (pathKey: string, direction: number) => void;
  onUpdateDrill: (
    pathKey: string,
    drillIdx: number,
    field: keyof DrillItem,
    value: string
  ) => void;
  onDeleteDrill: (pathKey: string, drillIdx: number) => void;
  onMoveDrillToFolder: (
    sourcePath: string,
    drillIdx: number,
    targetPath: string
  ) => void;
  onExportCSV: () => void;
  onImportCSVClick: () => void;
  onExportJSON: () => void;
  onImportJSONClick: () => void;
  onForceSyncCloud: () => void;
  onResetDefaults: () => void;
}

export const DrillLibraryView: React.FC<DrillLibraryViewProps> = ({
  cascadingDrills,
  collapsedFolders,
  userRole,
  onToggleFolder,
  onAddTopFolder,
  onAddSubfolder,
  onAddDrill,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder,
  onUpdateDrill,
  onDeleteDrill,
  onMoveDrillToFolder,
  onExportCSV,
  onImportCSVClick,
  onExportJSON,
  onImportJSONClick,
  onForceSyncCloud,
  onResetDefaults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedDrill, setDraggedDrill] = useState<{
    sourcePath: string;
    drillIndex: number;
  } | null>(null);

  const [dragOverFolderPath, setDragOverFolderPath] = useState<string | null>(
    null
  );

  // Helper to collect all folder paths for "Move to..." dropdown
  const getAllFoldersList = (
    list: DrillFolder[],
    parentPath = ''
  ): { path: string; name: string }[] => {
    const results: { path: string; name: string }[] = [];
    list.forEach((f, idx) => {
      const pathKey = parentPath === '' ? String(idx) : `${parentPath}_${idx}`;
      results.push({ path: pathKey, name: f.name });
      if (f.subfolders && f.subfolders.length > 0) {
        results.push(...getAllFoldersList(f.subfolders, pathKey));
      }
    });
    return results;
  };

  const allFolders = getAllFoldersList(cascadingDrills);

  // Total drill count
  const countTotalDrills = (folders: DrillFolder[]): number => {
    let count = 0;
    folders.forEach((f) => {
      count += f.drills?.length || 0;
      if (f.subfolders) count += countTotalDrills(f.subfolders);
    });
    return count;
  };

  const totalDrillsCount = useMemo(
    () => countTotalDrills(cascadingDrills),
    [cascadingDrills]
  );

  // Search filtering logic
  const query = searchTerm.trim().toLowerCase();

  // Helper to check if a drill matches search
  const isDrillMatch = (drill: DrillItem): boolean => {
    if (!query) return true;
    return (
      (drill.name || '').toLowerCase().includes(query) ||
      (drill.desc || '').toLowerCase().includes(query) ||
      (drill.key || '').toLowerCase().includes(query)
    );
  };

  // Helper to check if folder has matching drills or subfolders
  const folderHasMatch = (folder: DrillFolder): boolean => {
    if (!query) return true;
    if ((folder.name || '').toLowerCase().includes(query)) return true;
    if (folder.drills?.some(isDrillMatch)) return true;
    if (folder.subfolders?.some(folderHasMatch)) return true;
    return false;
  };

  // Count search match results
  const matchingDrillsCount = useMemo(() => {
    if (!query) return totalDrillsCount;
    let matches = 0;
    const checkNode = (folders: DrillFolder[]) => {
      folders.forEach((f) => {
        f.drills?.forEach((d) => {
          if (isDrillMatch(d)) matches++;
        });
        if (f.subfolders) checkNode(f.subfolders);
      });
    };
    checkNode(cascadingDrills);
    return matches;
  }, [cascadingDrills, query, totalDrillsCount]);

  // Handle expand/collapse all
  const handleExpandAll = () => {
    allFolders.forEach((f) => {
      if (collapsedFolders[f.path]) {
        onToggleFolder(f.path);
      }
    });
  };

  const handleCollapseAll = () => {
    allFolders.forEach((f) => {
      if (!collapsedFolders[f.path]) {
        onToggleFolder(f.path);
      }
    });
  };

  // Recursive folder node renderer
  const renderFolderNode = (
    folder: DrillFolder,
    pathKey: string,
    depth = 0
  ) => {
    // If search active and this folder has no matches, skip
    if (query && !folderHasMatch(folder)) {
      return null;
    }

    // When searching, force folder open if it contains matching items
    const isCollapsed = query ? false : Boolean(collapsedFolders[pathKey]);
    const isDragOver = dragOverFolderPath === pathKey;

    const visibleDrills = query
      ? (folder.drills || []).filter(isDrillMatch)
      : folder.drills || [];

    const totalFolderDrills =
      (folder.drills?.length || 0) +
      (folder.subfolders?.reduce((acc, sf) => acc + (sf.drills?.length || 0), 0) || 0);

    return (
      <div
        key={pathKey}
        className="border border-slate-700/80 rounded-3xl bg-slate-800/95 backdrop-blur-md shadow-xl overflow-hidden transition-all mb-4"
        style={{ marginLeft: depth > 0 ? `${depth * 16}px` : 0 }}
      >
        {/* Folder Header */}
        <div
          onDragOver={(e) => {
            if (userRole === 'admin') {
              e.preventDefault();
              e.stopPropagation();
              setDragOverFolderPath(pathKey);
            }
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            if (dragOverFolderPath === pathKey) setDragOverFolderPath(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverFolderPath(null);
            if (draggedDrill) {
              onMoveDrillToFolder(
                draggedDrill.sourcePath,
                draggedDrill.drillIndex,
                pathKey
              );
              setDraggedDrill(null);
            }
          }}
          onClick={() => onToggleFolder(pathKey)}
          className={`px-5 py-3.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors border-b ${
            isDragOver
              ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50'
              : isCollapsed
              ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-700/60'
              : 'bg-slate-900/90 hover:bg-slate-900 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {isCollapsed ? (
              <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <span className="font-black text-sm md:text-base text-slate-100 truncate tracking-tight">
              {folder.name}
            </span>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {query ? `${visibleDrills.length} match` : `${totalFolderDrills} drills`}
            </span>
          </div>

          {/* Folder Action Controls */}
          {userRole === 'admin' && (
            <div
              className="flex items-center gap-1.5 print:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onMoveFolder(pathKey, -1)}
                title="Move Folder Up"
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onMoveFolder(pathKey, 1)}
                title="Move Folder Down"
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onAddSubfolder(pathKey)}
                title="Add Subfolder"
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl flex items-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-3 h-3 text-indigo-400" />
                <span>Sub</span>
              </button>
              <button
                onClick={() => onAddDrill(pathKey)}
                title="Add Drill"
                className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Drill</span>
              </button>
              <button
                onClick={() => onRenameFolder(pathKey)}
                title="Rename Folder"
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteFolder(pathKey)}
                title="Delete Folder"
                className="p-1 hover:bg-rose-950/50 rounded-lg text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Folder Body (Subfolders & Drills) */}
        {!isCollapsed && (
          <div className="p-4 md:p-5 space-y-4 bg-slate-900/60">
            {/* Render Subfolders */}
            {folder.subfolders && folder.subfolders.length > 0 && (
              <div className="space-y-3">
                {folder.subfolders.map((sub, sIdx) =>
                  renderFolderNode(sub, `${pathKey}_${sIdx}`, depth + 1)
                )}
              </div>
            )}

            {/* Render Drills */}
            {visibleDrills && visibleDrills.length > 0 ? (
              <div className="space-y-2.5">
                {/* Drill Table Column Header */}
                <div className="grid grid-cols-12 gap-2 text-[10.5px] font-black uppercase text-slate-500 px-3 pb-1 border-b border-slate-800/80">
                  <div className="col-span-12 md:col-span-3">Drill Name</div>
                  <div className="col-span-12 md:col-span-5">Setup &amp; Instructions</div>
                  <div className="col-span-12 md:col-span-2">Coaching Focus / Key</div>
                  <div className="col-span-12 md:col-span-2 text-right">Move / Action</div>
                </div>

                {visibleDrills.map((drill, dIdx) => {
                  // Find original index in folder.drills
                  const origIdx = (folder.drills || []).indexOf(drill);
                  const drillIndex = origIdx >= 0 ? origIdx : dIdx;

                  return (
                    <DrillRowItem
                      key={`${pathKey}_drill_${drillIndex}_${drill.name}`}
                      drill={drill}
                      pathKey={pathKey}
                      drillIdx={drillIndex}
                      userRole={userRole}
                      allFolders={allFolders}
                      onUpdateDrill={onUpdateDrill}
                      onDeleteDrill={onDeleteDrill}
                      onMoveDrillToFolder={onMoveDrillToFolder}
                      onDragStart={() =>
                        setDraggedDrill({ sourcePath: pathKey, drillIndex })
                      }
                    />
                  );
                })}
              </div>
            ) : (
              !folder.subfolders?.length && (
                <div className="text-center py-6 text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-2xl">
                  {query
                    ? 'No drills match your search in this folder.'
                    : 'Drag drills here or click "+ Drill" to add exercises.'}
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Action Toolbar */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-4 md:p-5 print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-black shadow-inner">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
                  Master Drill Library &amp; Install Database
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                  {totalDrillsCount} Saved Drills
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Organized by category, agility circuits, positional skills, tackling form &amp; install scripts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onExportCSV}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV Export</span>
            </button>
            <button
              onClick={onImportCSVClick}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV Import</span>
            </button>
            <button
              onClick={onExportJSON}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={onImportJSONClick}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-sky-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={onForceSyncCloud}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Push to Cloud</span>
            </button>
            {userRole === 'admin' && (
              <>
                <button
                  onClick={onResetDefaults}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
                  title="Reset to default drills"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onAddTopFolder}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Top Folder</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Search Bar & Expand/Collapse Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
          <div className="relative flex-1 min-w-[240px] max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search all 120+ drills, keywords (e.g. 'Tackle', 'Donut', 'Rip', 'Snap', 'Cover')..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl pl-9 pr-9 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded-md hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {searchTerm && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                Found {matchingDrillsCount} matching drill{matchingDrillsCount === 1 ? '' : 's'}
              </span>
            )}
            <button
              onClick={handleExpandAll}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              title="Expand all categories & subfolders"
            >
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Expand All</span>
            </button>
            <button
              onClick={handleCollapseAll}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              title="Collapse all categories & subfolders"
            >
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              <span>Collapse All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drill Folders Tree */}
      <div className="space-y-4">
        {cascadingDrills.map((folder, idx) =>
          renderFolderNode(folder, String(idx), 0)
        )}
      </div>
    </div>
  );
};
