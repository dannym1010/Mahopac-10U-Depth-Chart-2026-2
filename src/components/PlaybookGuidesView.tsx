import React, { useState } from 'react';
import {
  BookOpen,
  Settings,
  Plus,
  Maximize,
  Upload,
  FileText,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
} from 'lucide-react';
import { PlaybookGuideTree, PlaybookGuideOrder, UserRole } from '../types';

interface PlaybookGuidesViewProps {
  guideTree: PlaybookGuideTree;
  guideOrder: PlaybookGuideOrder;
  activeMain: string;
  activeSub: string;
  userRole: UserRole;
  onSelectMain: (main: string) => void;
  onSelectSub: (sub: string) => void;
  onUploadDocument: (main: string, sub: string, file: File) => void;
  onAddMainFolder: (name: string) => void;
  onAddSubTab: (main: string, name: string) => void;
  onRenameMainFolder: (oldName: string, newName: string) => void;
  onRenameSubTab: (main: string, oldName: string, newName: string) => void;
  onDeleteMainFolder: (name: string) => void;
  onDeleteSubTab: (main: string, name: string) => void;
  onMoveMainFolder: (name: string, direction: number) => void;
  onMoveSubTab: (main: string, name: string, direction: number) => void;
}

export const PlaybookGuidesView: React.FC<PlaybookGuidesViewProps> = ({
  guideTree,
  guideOrder,
  activeMain,
  activeSub,
  userRole,
  onSelectMain,
  onSelectSub,
  onUploadDocument,
  onAddMainFolder,
  onAddSubTab,
  onRenameMainFolder,
  onRenameSubTab,
  onDeleteMainFolder,
  onDeleteSubTab,
  onMoveMainFolder,
  onMoveSubTab,
}) => {
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [isFullScreenModalOpen, setIsFullScreenModalOpen] = useState(false);

  const mainCategories = guideOrder.main || Object.keys(guideTree);
  const currentSubTabs = guideOrder.sub[activeMain] || Object.keys(guideTree[activeMain] || {});
  const currentDocUrl = guideTree[activeMain]?.[activeSub] || '';

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/80 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base md:text-lg text-slate-100 tracking-tight">
                Playbooks &amp; Positional Install Guides
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Browse team installation packets, wristband diagrams, and individual position group manuals
              </p>
            </div>
          </div>

          {userRole === 'admin' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOrganizeModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span>Organize Tabs</span>
              </button>
              <button
                onClick={() => {
                  const name = prompt('Enter Position or Sub-Tab Name (e.g. Offensive Line):');
                  if (name && name.trim()) onAddSubTab(activeMain, name.trim());
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sub-Tab</span>
              </button>
            </div>
          )}
        </div>

        {/* Level 1: Main Category Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2.5 no-scrollbar">
          {mainCategories.map((mainCat) => {
            const isActive = mainCat === activeMain;
            return (
              <button
                key={mainCat}
                onClick={() => {
                  onSelectMain(mainCat);
                  const firstSub = guideOrder.sub[mainCat]?.[0] || Object.keys(guideTree[mainCat] || {})[0] || '';
                  if (firstSub) onSelectSub(firstSub);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all select-none border ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-750 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {mainCat}
              </button>
            );
          })}
        </div>

        {/* Level 2: Sub-Tabs Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-slate-900/90 border border-slate-700 rounded-2xl no-scrollbar">
          {currentSubTabs.map((subTab) => {
            const isActive = subTab === activeSub;
            return (
              <button
                key={subTab}
                onClick={() => onSelectSub(subTab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all select-none border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                }`}
              >
                {subTab}
              </button>
            );
          })}
          {currentSubTabs.length === 0 && (
            <span className="text-xs text-slate-400 p-1">No sub-tabs found.</span>
          )}
        </div>
      </div>

      {/* Document Area */}
      <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 space-y-4">
        {/* Document Action Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="font-black text-xs text-slate-200">
              Active Section: <span className="text-amber-300">{activeMain} &gt; {activeSub}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {userRole === 'admin' && (
              <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload PDF / DOC</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadDocument(activeMain, activeSub, file);
                  }}
                />
              </label>
            )}

            {currentDocUrl && (
              <button
                onClick={() => setIsFullScreenModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>Fullscreen View</span>
              </button>
            )}
          </div>
        </div>

        {/* Document Frame / Viewer */}
        <div className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl overflow-hidden min-h-[600px] flex flex-col">
          {currentDocUrl ? (
            <iframe
              src={currentDocUrl}
              title={`${activeMain} - ${activeSub}`}
              className="w-full flex-1 min-h-[650px] border-0 bg-white"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <p className="font-bold text-sm text-slate-300">
                No Document Uploaded for [{activeMain} &gt; {activeSub}]
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Upload your team playbook PDF, offensive installs, wristband sheets, or positional diagrams above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Document Modal */}
      {isFullScreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between pb-3 text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span className="font-black text-sm md:text-base">
                {activeMain} &gt; {activeSub} - Fullscreen View
              </span>
            </div>
            <button
              onClick={() => setIsFullScreenModalOpen(false)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-rose-600/30"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
          <div className="flex-1 bg-white rounded-2xl overflow-hidden mt-3 shadow-2xl">
            <iframe
              src={currentDocUrl}
              title="Fullscreen Playbook Guide"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Organize Tabs Modal */}
      {isOrganizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>Organize Playbook Folders &amp; Tabs</span>
              </h3>
              <button
                onClick={() => setIsOrganizeModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Main Folders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-black text-[11px] text-indigo-300 uppercase tracking-wider">
                  1. Main Categories:
                </label>
                <button
                  onClick={() => {
                    const name = prompt('Enter new Main Category Name:');
                    if (name && name.trim()) onAddMainFolder(name.trim());
                  }}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-800 p-2 rounded-2xl bg-slate-950/80">
                {mainCategories.map((mainCat) => (
                  <div
                    key={mainCat}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold ${
                      mainCat === activeMain
                        ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span
                      onClick={() => onSelectMain(mainCat)}
                      className="cursor-pointer hover:underline truncate"
                    >
                      {mainCat} {mainCat === activeMain ? '👈 (Selected)' : ''}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onMoveMainFolder(mainCat, -1)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onMoveMainFolder(mainCat, 1)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          const newName = prompt('Rename Category:', mainCat);
                          if (newName && newName.trim() && newName !== mainCat)
                            onRenameMainFolder(mainCat, newName.trim());
                        }}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete category "${mainCat}" and all its sub-tabs?`))
                            onDeleteMainFolder(mainCat);
                        }}
                        className="p-1 hover:bg-rose-950/50 text-rose-400 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sub-Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-black text-[11px] text-indigo-300 uppercase tracking-wider">
                  2. Sub-Tabs for [{activeMain}]:
                </label>
                <button
                  onClick={() => {
                    const name = prompt(`Enter new Sub-Tab for [${activeMain}]:`);
                    if (name && name.trim()) onAddSubTab(activeMain, name.trim());
                  }}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Sub-Tab
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-800 p-2 rounded-2xl bg-slate-950/80">
                {currentSubTabs.map((subTab) => (
                  <div
                    key={subTab}
                    className="flex items-center justify-between p-2.5 rounded-xl border bg-slate-900 border-slate-800 text-xs font-bold text-slate-300"
                  >
                    <span className="truncate">{subTab}</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onMoveSubTab(activeMain, subTab, -1)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onMoveSubTab(activeMain, subTab, 1)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          const newName = prompt('Rename Sub-Tab:', subTab);
                          if (newName && newName.trim() && newName !== subTab)
                            onRenameSubTab(activeMain, subTab, newName.trim());
                        }}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete sub-tab "${subTab}"?`))
                            onDeleteSubTab(activeMain, subTab);
                        }}
                        className="p-1 hover:bg-rose-950/50 text-rose-400 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {currentSubTabs.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No sub-tabs found.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3.5 border-t border-slate-800">
              <button
                onClick={() => setIsOrganizeModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
