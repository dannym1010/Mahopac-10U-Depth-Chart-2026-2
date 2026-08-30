import React, { useState } from 'react';
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
} from 'lucide-react';
import { DrillFolder, DrillItem, UserRole } from '../types';

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

  // Recursive folder node renderer
  const renderFolderNode = (
    folder: DrillFolder,
    pathKey: string,
    depth = 0
  ) => {
    const isCollapsed = Boolean(collapsedFolders[pathKey]);
    const isDragOver = dragOverFolderPath === pathKey;

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
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {(folder.drills?.length || 0) + (folder.subfolders?.length || 0)}
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
            {folder.drills && folder.drills.length > 0 ? (
              <div className="space-y-2.5">
                {/* Drill Table Column Header */}
                <div className="grid grid-cols-12 gap-2 text-[10.5px] font-black uppercase text-slate-500 px-3 pb-1 border-b border-slate-800/80">
                  <div className="col-span-12 md:col-span-3">Drill Name</div>
                  <div className="col-span-12 md:col-span-5">Setup &amp; Instructions</div>
                  <div className="col-span-12 md:col-span-2">Coaching Focus / Key</div>
                  <div className="col-span-12 md:col-span-2 text-right">Move / Action</div>
                </div>

                {folder.drills.map((drill, dIdx) => (
                  <div
                    key={dIdx}
                    draggable={userRole === 'admin'}
                    onDragStart={() =>
                      setDraggedDrill({ sourcePath: pathKey, drillIndex: dIdx })
                    }
                    className="grid grid-cols-12 gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 items-start transition-all"
                  >
                    {/* Drill Name */}
                    <div className="col-span-12 md:col-span-3 flex items-start gap-2">
                      {userRole === 'admin' && (
                        <GripVertical className="w-4 h-4 text-slate-500 mt-2 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                      )}
                      <input
                        type="text"
                        value={drill.name || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateDrill(pathKey, dIdx, 'name', e.target.value)
                        }
                        placeholder="Drill Title"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-transparent disabled:border-transparent"
                      />
                    </div>

                    {/* Description / Instructions */}
                    <div className="col-span-12 md:col-span-5">
                      <textarea
                        rows={2}
                        value={drill.desc || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateDrill(pathKey, dIdx, 'desc', e.target.value)
                        }
                        placeholder="Setup instructions, number of players, cone placement..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-300 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y disabled:bg-transparent disabled:border-transparent placeholder:text-slate-600"
                      />
                    </div>

                    {/* Coaching Key / Focus */}
                    <div className="col-span-12 md:col-span-2">
                      <textarea
                        rows={2}
                        value={drill.key || ''}
                        disabled={userRole !== 'admin'}
                        onChange={(e) =>
                          onUpdateDrill(pathKey, dIdx, 'key', e.target.value)
                        }
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
                              onMoveDrillToFolder(pathKey, dIdx, e.target.value)
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
                            onClick={() => onDeleteDrill(pathKey, dIdx)}
                            title="Delete Drill"
                            className="p-1.5 hover:bg-rose-950/50 text-rose-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !folder.subfolders?.length && (
                <div className="text-center py-6 text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-2xl">
                  Drag drills here or click "+ Drill" to add exercises.
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
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-4 md:p-5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-black shadow-inner">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
                Master Drill Library &amp; Install Database
              </h2>
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
