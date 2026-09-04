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
  Sparkles,
  Smartphone,
  Layers,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { DrillFolder, DrillItem, UserRole } from '../types';

interface DrillLibraryViewProps {
  cascadingDrills: DrillFolder[];
  collapsedFolders: Record<string, boolean>;
  onToggleFolder: (pathKey: string) => void;
  onAddTopFolder: () => void;
  onAddSubfolder: (pathKey: string) => void;
  onRenameFolder: (pathKey: string) => void;
  onDeleteFolder: (pathKey: string) => void;
  onMoveFolder: (pathKey: string, direction: -1 | 1) => void;
  onAddDrill: (pathKey: string) => void;
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
  onResetDefaults: () => void;
  onForceSyncCloud: () => void;
  userRole: UserRole;
}

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
      className="grid grid-cols-12 gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 items-start transition-all"
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
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-400 disabled:bg-transparent disabled:border-transparent"
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
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-300 leading-relaxed focus:outline-none focus:border-indigo-400 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-600"
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
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-emerald-300/90 leading-relaxed focus:outline-none focus:border-emerald-400 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-600"
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
              className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-[11px] font-semibold text-slate-300 max-w-[115px] truncate focus:outline-none focus:border-indigo-400"
            >
              {allFolders.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => onDeleteDrill(pathKey, drillIdx)}
              title="Delete Drill"
              className="p-1.5 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <span className="text-[10px] text-slate-500 italic">Read-only</span>
        )}
      </div>
    </div>
  );
};

export const DrillLibraryView: React.FC<DrillLibraryViewProps> = ({
  cascadingDrills,
  collapsedFolders,
  onToggleFolder,
  onAddTopFolder,
  onAddSubfolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder,
  onAddDrill,
  onUpdateDrill,
  onDeleteDrill,
  onMoveDrillToFolder,
  onExportCSV,
  onImportCSVClick,
  onExportJSON,
  onImportJSONClick,
  onResetDefaults,
  onForceSyncCloud,
  userRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedDrill, setDraggedDrill] = useState<{
    sourcePath: string;
    drillIndex: number;
  } | null>(null);
  const [dragOverFolderPath, setDragOverFolderPath] = useState<string | null>(
    null
  );

  // View Mode: 'cards' (Mobile Sideline Cards) vs 'tree' (Master Tree View)
  const [viewMode, setViewMode] = useState<'cards' | 'tree'>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [copiedDrillId, setCopiedDrillId] = useState<string | null>(null);

  // Helper to normalize strings for robust category matching (stripping emoji, whitespace, punctuation)
  const cleanCategoryStr = (str: string) =>
    (str || '')
      .toLowerCase()
      .replace(/[\p{Emoji}\u200B-\u200D\uFE0F]/gu, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();

  // Helper: check if a drill belongs to a target category
  const isDrillCategoryMatch = (
    item: { topCategory: string; folderName: string; parentCategories: string[] },
    targetCat: string
  ) => {
    if (!targetCat || targetCat === 'all') return true;
    if (item.topCategory === targetCat || item.folderName === targetCat) return true;
    if (item.parentCategories.includes(targetCat)) return true;

    const targetClean = cleanCategoryStr(targetCat);
    const topClean = cleanCategoryStr(item.topCategory);
    const folderClean = cleanCategoryStr(item.folderName);

    if (topClean === targetClean || folderClean === targetClean) return true;
    if (item.parentCategories.some((p) => cleanCategoryStr(p) === targetClean)) return true;

    if (
      targetClean.includes('offense') &&
      (topClean.includes('offense') ||
        item.parentCategories.some((p) => cleanCategoryStr(p).includes('offense')))
    ) {
      return true;
    }
    if (
      targetClean.includes('defense') &&
      (topClean.includes('defense') ||
        item.parentCategories.some((p) => cleanCategoryStr(p).includes('defense')))
    ) {
      return true;
    }
    if (
      targetClean.includes('special') &&
      (topClean.includes('special') ||
        item.parentCategories.some((p) => cleanCategoryStr(p).includes('special')))
    ) {
      return true;
    }
    if (
      targetClean.includes('warm') &&
      (topClean.includes('warm') ||
        item.parentCategories.some((p) => cleanCategoryStr(p).includes('warm')))
    ) {
      return true;
    }
    if (
      targetClean.includes('general') &&
      (topClean.includes('general') ||
        item.parentCategories.some((p) => cleanCategoryStr(p).includes('general')))
    ) {
      return true;
    }
    return false;
  };

  // Flatten all folders for dropdown selector
  const allFolders = useMemo(() => {
    const list: { path: string; name: string }[] = [];
    const traverse = (folders: DrillFolder[], parentPath = '') => {
      folders.forEach((f, idx) => {
        const path = parentPath ? `${parentPath}_${idx}` : String(idx);
        list.push({ path, name: f.name });
        if (f.subfolders && f.subfolders.length > 0) {
          traverse(f.subfolders, path);
        }
      });
    };
    traverse(cascadingDrills);
    return list;
  }, [cascadingDrills]);

  // Flatten all drills into an indexed list for fast mobile search & category filtering
  const flattenedDrillList = useMemo(() => {
    const list: {
      drill: DrillItem;
      folderName: string;
      topCategory: string;
      parentCategories: string[];
      pathKey: string;
      drillIdx: number;
    }[] = [];

    const traverse = (
      folders: DrillFolder[],
      parentPath = '',
      topCategoryName = '',
      ancestorNames: string[] = []
    ) => {
      folders.forEach((f, idx) => {
        const pathKey = parentPath ? `${parentPath}_${idx}` : String(idx);
        const topCat = topCategoryName || f.name;
        const currentAncestors = [...ancestorNames, f.name];

        (f.drills || []).forEach((drill, dIdx) => {
          list.push({
            drill,
            folderName: f.name,
            topCategory: topCat,
            parentCategories: currentAncestors,
            pathKey,
            drillIdx: dIdx,
          });
        });
        if (f.subfolders && f.subfolders.length > 0) {
          traverse(f.subfolders, pathKey, topCat, currentAncestors);
        }
      });
    };

    traverse(cascadingDrills);
    return list;
  }, [cascadingDrills]);

  // Extract unique top-level category names
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    cascadingDrills.forEach((f) => set.add(f.name));
    return Array.from(set);
  }, [cascadingDrills]);

  // Extract subcategories if a specific top-level category is selected
  const subcategoryOptions = useMemo(() => {
    if (selectedCategory === 'all') return [];
    const matchedTop = cascadingDrills.find(
      (f) =>
        f.name === selectedCategory ||
        cleanCategoryStr(f.name) === cleanCategoryStr(selectedCategory)
    );
    if (!matchedTop || !matchedTop.subfolders || matchedTop.subfolders.length === 0) {
      return [];
    }
    return matchedTop.subfolders.map((sf) => sf.name);
  }, [cascadingDrills, selectedCategory]);

  // Total count of drills
  const totalDrillsCount = flattenedDrillList.length;

  const query = searchTerm.trim().toLowerCase();

  // Filter drills for mobile card view
  const filteredCardDrills = useMemo(() => {
    return flattenedDrillList.filter(
      ({ drill, folderName, topCategory, parentCategories }) => {
        // Top Category filter
        if (selectedCategory !== 'all') {
          if (!isDrillCategoryMatch({ topCategory, folderName, parentCategories }, selectedCategory)) {
            return false;
          }
        }

        // Subcategory filter
        if (selectedSubcategory !== 'all') {
          if (
            folderName !== selectedSubcategory &&
            !parentCategories.includes(selectedSubcategory)
          ) {
            return false;
          }
        }

        // Search term filter
        if (!query) return true;
        const name = (drill.name || '').toLowerCase();
        const desc = (drill.desc || '').toLowerCase();
        const key = (drill.key || '').toLowerCase();
        const cat = folderName.toLowerCase();
        const topCat = topCategory.toLowerCase();
        return (
          name.includes(query) ||
          desc.includes(query) ||
          key.includes(query) ||
          cat.includes(query) ||
          topCat.includes(query)
        );
      }
    );
  }, [flattenedDrillList, selectedCategory, selectedSubcategory, query]);

  // Helper: check if a drill matches query
  const isDrillMatch = (drill: DrillItem) => {
    if (!query) return true;
    const name = (drill.name || '').toLowerCase();
    const desc = (drill.desc || '').toLowerCase();
    const key = (drill.key || '').toLowerCase();
    return name.includes(query) || desc.includes(query) || key.includes(query);
  };

  // Helper: check if a folder or its subfolders have any drill matches
  const folderHasMatch = (folder: DrillFolder): boolean => {
    if (!query) return true;
    if (folder.drills?.some(isDrillMatch)) return true;
    if (folder.subfolders?.some(folderHasMatch)) return true;
    return false;
  };

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

  // Copy drill info to clipboard
  const handleCopyDrill = (drill: DrillItem, folderName: string, id: string) => {
    const text = `🏈 ${drill.name} (${folderName})\n📋 Setup: ${drill.desc}\n⚡ Key Coaching Cues: ${drill.key}`;
    navigator.clipboard?.writeText(text);
    setCopiedDrillId(id);
    setTimeout(() => setCopiedDrillId(null), 2200);
  };

  // Recursive folder node renderer for Master Tree Mode
  const renderFolderNode = (
    folder: DrillFolder,
    pathKey: string,
    depth = 0
  ) => {
    if (query && !folderHasMatch(folder)) {
      return null;
    }

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
        className="border border-slate-800 rounded-3xl bg-slate-900/90 backdrop-blur-md shadow-xl overflow-hidden transition-all mb-4"
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
              ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400/50'
              : isCollapsed
              ? 'bg-slate-950/80 hover:bg-slate-900 border-slate-800'
              : 'bg-slate-900/95 hover:bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {isCollapsed ? (
              <Folder className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            ) : (
              <FolderOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            )}
            <span className="font-black text-sm md:text-base text-slate-100 truncate tracking-tight">
              {folder.name}
            </span>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
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
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onMoveFolder(pathKey, 1)}
                title="Move Folder Down"
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onAddSubfolder(pathKey)}
                title="Add Subfolder"
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3 text-indigo-400" />
                <span>Sub</span>
              </button>
              <button
                onClick={() => onAddDrill(pathKey)}
                title="Add Drill"
                className="px-2.5 py-1 text-[11px] font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Drill</span>
              </button>
              <button
                onClick={() => onRenameFolder(pathKey)}
                title="Rename Folder"
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteFolder(pathKey)}
                title="Delete Folder"
                className="p-1 hover:bg-rose-950/50 rounded-lg text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Folder Body (Subfolders & Drills) */}
        {!isCollapsed && (
          <div className="p-4 md:p-5 space-y-4 bg-slate-950/60">
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
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[10.5px] font-black uppercase text-slate-500 px-3 pb-1 border-b border-slate-800">
                  <div className="col-span-12 md:col-span-3">Drill Name</div>
                  <div className="col-span-12 md:col-span-5">Setup &amp; Instructions</div>
                  <div className="col-span-12 md:col-span-2">Coaching Focus / Key</div>
                  <div className="col-span-12 md:col-span-2 text-right">Move / Action</div>
                </div>

                {visibleDrills.map((drill, dIdx) => {
                  const origIdx = (folder.drills || []).indexOf(drill);
                  const drillIndex = origIdx >= 0 ? origIdx : dIdx;

                  return (
                    <DrillRowItem
                      key={drill.id || `${pathKey}_drill_${drillIndex}`}
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
                    : 'Click "+ Drill" to add exercises to this folder.'}
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Action Toolbar */}
      <div className="bg-slate-950/95 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl p-4 md:p-5 print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Header Title & Pill */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black shadow-inner">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
                  Master Drill Library &amp; Install Database
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black">
                  {totalDrillsCount} Drills
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Varsity football drills organized for fast sideline recall &amp; practice install
              </p>
            </div>
          </div>

          {/* View Mode Toggle & Top Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Selector */}
            <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Sideline Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'tree'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Master Tree</span>
              </button>
            </div>

            {/* Quick Add Top Folder */}
            {userRole === 'admin' && (
              <button
                onClick={onAddTopFolder}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Search Bar & Horizontal Category Filter Pills */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search drills, cues (e.g. 'Tackle', 'Donut', 'Rip', 'Cover 3', 'RPO')..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-10 pr-9 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tree Mode Controls */}
            {viewMode === 'tree' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExpandAll}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Expand all categories"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Expand All</span>
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Collapse all categories"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>Collapse All</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Category Chips for Mobile & Sideline Filtering */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                All Categories ({flattenedDrillList.length})
              </button>
              {categoryOptions.map((cat) => {
                const count = flattenedDrillList.filter((d) => isDrillCategoryMatch(d, cat)).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubcategory('all');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm font-black'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`ml-1.5 text-[10px] ${isSelected ? 'text-indigo-200 font-black' : 'text-slate-500'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Subcategories (Positions / Sub-groups) for Selected Category */}
            {subcategoryOptions.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 pl-1 border-l-2 border-indigo-500/50">
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory('all')}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    selectedSubcategory === 'all'
                      ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  All in {selectedCategory} ({flattenedDrillList.filter((d) => isDrillCategoryMatch(d, selectedCategory)).length})
                </button>
                {subcategoryOptions.map((sub) => {
                  const subCount = flattenedDrillList.filter(
                    (d) =>
                      isDrillCategoryMatch(d, selectedCategory) &&
                      (d.folderName === sub || d.parentCategories.includes(sub))
                  ).length;
                  const isSubSelected = selectedSubcategory === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        isSubSelected
                          ? 'bg-indigo-500 text-white border-indigo-400 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{sub}</span>
                      <span className="ml-1 text-[10px] opacity-80">({subCount})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODE 1: MOBILE SIDELINE CARD VIEW (Optimized for Touch & Handheld Devices)
          ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {/* Active Filter Header */}
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 flex-wrap">
              <span>Showing {filteredCardDrills.length} Drills</span>
              {selectedCategory !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] normal-case font-bold">
                  {selectedCategory}
                </span>
              )}
              {selectedSubcategory !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-750 text-[10px] normal-case font-bold">
                  {selectedSubcategory}
                </span>
              )}
            </div>
          </div>

          {/* Drill Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredCardDrills.map(({ drill, folderName, topCategory, pathKey, drillIdx }) => {
              const cardId = `${pathKey}_${drillIdx}`;
              const isCopied = copiedDrillId === cardId;

              return (
                <div
                  key={drill.id || cardId}
                  className="bg-slate-900/95 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-3 transition-all group"
                >
                  <div className="space-y-2.5">
                    {/* Card Header: Title + Category Badge + Copy Action */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400/90 block mb-0.5 truncate">
                          {topCategory && topCategory !== folderName ? `${topCategory} • ${folderName}` : folderName}
                        </span>
                        <h3 className="font-black text-sm text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug">
                          {drill.name || 'Untitled Drill'}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyDrill(drill, folderName, cardId)}
                        title="Copy Drill to Clipboard"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 transition-all shrink-0 cursor-pointer"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Setup & Instructions */}
                    {drill.desc && (
                      <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-850">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                          📋 Setup &amp; Execution:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {drill.desc}
                        </p>
                      </div>
                    )}

                    {/* Key Coaching Cues */}
                    {drill.key && (
                      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-2.5">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span>Key Coaching Focus:</span>
                        </span>
                        <p className="text-xs font-bold text-emerald-200/90 leading-relaxed">
                          {drill.key}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions (Admin Controls) */}
                  {userRole === 'admin' && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <select
                        value={pathKey}
                        onChange={(e) =>
                          onMoveDrillToFolder(pathKey, drillIdx, e.target.value)
                        }
                        className="bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-lg px-2 py-1 max-w-[140px] truncate focus:outline-none focus:border-indigo-400"
                        title="Move to category"
                      >
                        {allFolders.map((f) => (
                          <option key={f.path} value={f.path}>
                            {f.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDeleteDrill(pathKey, drillIdx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete Drill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCardDrills.length === 0 && (
            <div className="text-center py-12 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-6">
              <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">
                No drills found matching "{searchTerm}"
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for another keyword or select "All Categories".
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODE 2: MASTER FOLDER TREE VIEW (For Deep Playbook Organizing & Structuring)
          ========================================================================= */}
      {viewMode === 'tree' && (
        <div className="space-y-4">
          {selectedCategory !== 'all' && (
            <div className="flex items-center justify-between bg-slate-900/90 border border-indigo-500/30 rounded-xl px-3.5 py-2 text-xs">
              <span className="text-slate-300 font-bold">
                Filtering tree by: <span className="text-indigo-400 font-extrabold">{selectedCategory}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                }}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Show All Categories
              </button>
            </div>
          )}
          {cascadingDrills
            .filter((folder) => {
              if (selectedCategory === 'all') return true;
              return (
                folder.name === selectedCategory ||
                cleanCategoryStr(folder.name) === cleanCategoryStr(selectedCategory) ||
                (cleanCategoryStr(selectedCategory).includes('offense') &&
                  cleanCategoryStr(folder.name).includes('offense')) ||
                (cleanCategoryStr(selectedCategory).includes('defense') &&
                  cleanCategoryStr(folder.name).includes('defense')) ||
                (cleanCategoryStr(selectedCategory).includes('special') &&
                  cleanCategoryStr(folder.name).includes('special')) ||
                (cleanCategoryStr(selectedCategory).includes('warm') &&
                  cleanCategoryStr(folder.name).includes('warm'))
              );
            })
            .map((folder) => {
              const origIdx = cascadingDrills.indexOf(folder);
              return renderFolderNode(folder, String(origIdx >= 0 ? origIdx : 0), 0);
            })}
        </div>
      )}
    </div>
  );
};
