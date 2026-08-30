import React, { useState, useRef } from 'react';
import {
  Calendar,
  RefreshCw,
  Upload,
  Link2,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Swords,
  Shield,
  Zap,
  Clock,
  MapPin,
  Sparkles,
  Info,
  Layers,
  Download,
  Check,
} from 'lucide-react';
import { ScheduleEvent, Team } from '../types';
import {
  parseTeamSnapICS,
  parseTeamSnapCSV,
  parseTeamSnapText,
  ParsedTeamSnapEvent,
  TeamSnapSyncResult,
} from '../utils/teamSnapSync';

interface TeamSnapSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTeam: Team;
  existingEvents: ScheduleEvent[];
  onImportEvents: (newEvents: Omit<ScheduleEvent, 'id' | 'createdAt' | 'lastEdited'>[], replaceExisting?: boolean) => void;
}

type SyncTab = 'url' | 'file' | 'text';

export const TeamSnapSyncModal: React.FC<TeamSnapSyncModalProps> = ({
  isOpen,
  onClose,
  activeTeam,
  existingEvents = [],
  onImportEvents,
}) => {
  const [activeTab, setActiveTab] = useState<SyncTab>('url');
  const [icalUrl, setIcalUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`football_teamsnap_url_${activeTeam.id}`);
      return saved || '';
    } catch {
      return '';
    }
  });
  const [pasteText, setPasteText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [syncResult, setSyncResult] = useState<TeamSnapSyncResult | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<Record<string, boolean>>({});
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle URL Fetch
  const handleFetchFromUrl = async () => {
    if (!icalUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your TeamSnap iCal or WebCal feed URL.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Connecting to TeamSnap calendar feed...' });

    try {
      // Normalize webcal:// to https://
      let cleanUrl = icalUrl.trim();
      if (cleanUrl.startsWith('webcal://')) {
        cleanUrl = 'https://' + cleanUrl.substring(9);
      } else if (cleanUrl.startsWith('http://')) {
        cleanUrl = 'https://' + cleanUrl.substring(7);
      }

      // Save to localStorage for this team
      try {
        localStorage.setItem(`football_teamsnap_url_${activeTeam.id}`, cleanUrl);
      } catch {}

      let icsContent = '';

      // Try server API first
      try {
        const res = await fetch('/api/teamsnap/fetch-ical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.icsContent) {
            icsContent = data.icsContent;
          }
        }
      } catch (err) {
        console.warn('Backend proxy fetch failed, attempting client fetch:', err);
      }

      // If backend was unavailable or returned empty, try direct / CORS proxy fetch
      if (!icsContent) {
        try {
          const directRes = await fetch(cleanUrl);
          if (directRes.ok) {
            icsContent = await directRes.text();
          }
        } catch {
          // Try corsproxy fallback
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`;
          const proxyRes = await fetch(proxyUrl);
          if (proxyRes.ok) {
            icsContent = await proxyRes.text();
          }
        }
      }

      if (!icsContent || !icsContent.includes('BEGIN:VCALENDAR')) {
        throw new Error('Could not retrieve valid iCal feed. Please verify the URL or try downloading the .ics file and uploading below.');
      }

      const parsed = parseTeamSnapICS(icsContent, activeTeam.id);
      if (!parsed.success || parsed.events.length === 0) {
        throw new Error(parsed.error || 'No events found in this calendar feed.');
      }

      setSyncResult(parsed);
      // Select all by default
      const initialSelected: Record<string, boolean> = {};
      parsed.events.forEach((e, idx) => {
        initialSelected[e.id || String(idx)] = true;
      });
      setSelectedEventIds(initialSelected);

      setStatusMessage({
        type: 'success',
        text: `Successfully fetched ${parsed.totalParsed} events (${parsed.gamesCount} Games, ${parsed.practicesCount} Practices) from TeamSnap!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to fetch TeamSnap calendar. Check your link or try importing the .ics file directly.',
      });
      setSyncResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle File Upload (.ics or .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: `Reading ${file.name}...` });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsed: TeamSnapSyncResult;

        if (file.name.toLowerCase().endsWith('.ics') || content.includes('BEGIN:VCALENDAR')) {
          parsed = parseTeamSnapICS(content, activeTeam.id);
        } else if (file.name.toLowerCase().endsWith('.csv') || content.includes(',')) {
          parsed = parseTeamSnapCSV(content);
        } else {
          parsed = parseTeamSnapText(content);
        }

        if (!parsed.success || parsed.events.length === 0) {
          throw new Error(parsed.error || 'No schedule events could be parsed from this file.');
        }

        setSyncResult(parsed);
        const initialSelected: Record<string, boolean> = {};
        parsed.events.forEach((evt, idx) => {
          initialSelected[evt.id || String(idx)] = true;
        });
        setSelectedEventIds(initialSelected);

        setStatusMessage({
          type: 'success',
          text: `Parsed ${parsed.totalParsed} events from ${file.name}!`,
        });
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Failed to read file.',
        });
        setSyncResult(null);
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  // Handle Text Parsing
  const handleParseText = () => {
    if (!pasteText.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste your TeamSnap schedule text first.' });
      return;
    }

    setIsLoading(true);
    try {
      const parsed = parseTeamSnapText(pasteText);
      if (!parsed.success || parsed.events.length === 0) {
        throw new Error(parsed.error || 'Could not parse any schedule events from the provided text.');
      }

      setSyncResult(parsed);
      const initialSelected: Record<string, boolean> = {};
      parsed.events.forEach((evt, idx) => {
        initialSelected[evt.id || String(idx)] = true;
      });
      setSelectedEventIds(initialSelected);

      setStatusMessage({
        type: 'success',
        text: `Identified ${parsed.totalParsed} events from pasted text!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to parse text.',
      });
      setSyncResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection
  const toggleSelectAll = (select: boolean) => {
    if (!syncResult) return;
    const updated: Record<string, boolean> = {};
    syncResult.events.forEach((e, idx) => {
      updated[e.id || String(idx)] = select;
    });
    setSelectedEventIds(updated);
  };

  const toggleEventSelected = (id: string) => {
    setSelectedEventIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Execute Import
  const handleExecuteImport = () => {
    if (!syncResult || syncResult.events.length === 0) return;

    const chosen = syncResult.events.filter((e, idx) => selectedEventIds[e.id || String(idx)]);
    if (chosen.length === 0) {
      alert('Please select at least one event to import.');
      return;
    }

    const payload: Omit<ScheduleEvent, 'id' | 'createdAt' | 'lastEdited'>[] = chosen.map((e) => ({
      teamId: activeTeam.id,
      type: e.type,
      title: e.title,
      week: e.week,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      locationType: e.locationType,
      opponent: e.opponent,
      uniform: e.uniform,
      arrivalMinutesBefore: e.arrivalMinutesBefore,
      focusOrNotes: e.focusOrNotes,
    }));

    onImportEvents(payload, importMode === 'replace');
    onClose();
  };

  const selectedCount = syncResult
    ? syncResult.events.filter((e, idx) => selectedEventIds[e.id || String(idx)]).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-white/15 shrink-0">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                  TeamSnap Schedule Sync
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeTeam.name} ({activeTeam.ageGroup || 'Active Team'})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically import games, practices, arrival times, uniforms &amp; fields from TeamSnap into this team's schedule.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'url'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>1-Click TeamSnap Feed (URL)</span>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'file'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload .ICS / .CSV File</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'text'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Schedule Text</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Tab 1: URL Sync */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-white">How to get your TeamSnap Calendar URL:</p>
                  <p>
                    1. Open TeamSnap on web or app &rarr; Navigate to <strong>Schedule</strong>.
                  </p>
                  <p>
                    2. Click <strong>"Subscribe to Calendar"</strong> or <strong>"Export / iCal"</strong> and copy the <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">webcal://</code> or <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">https://</code> link.
                  </p>
                  <p>3. Paste it below to fetch and sync the schedule for <strong>{activeTeam.name}</strong>.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  TeamSnap iCal / WebCal Feed URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={icalUrl}
                      onChange={(e) => setIcalUrl(e.target.value)}
                      placeholder="e.g. webcal://ical.teamsnap.com/teams/12345/schedule.ics"
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleFetchFromUrl}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30 active:scale-95 shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? 'Syncing...' : 'Fetch Schedule'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-800/40 hover:bg-indigo-950/20 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Click or drag &amp; drop your TeamSnap Schedule file</p>
                  <p className="text-xs text-slate-400 mt-1">Supports TeamSnap <code className="text-indigo-300">.ics</code> calendar exports and <code className="text-indigo-300">.csv</code> spreadsheets</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ics,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Paste Text */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Paste Raw TeamSnap Schedule / Email Text
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={7}
                placeholder="Paste schedule dates, game times, opponents, and locations here..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleParseText}
                  disabled={isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Parse Schedule</span>
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
              }`}
            >
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Parsed Events Preview Table */}
          {syncResult && syncResult.events.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Parsed Events Preview</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {syncResult.totalParsed} total ({selectedCount} selected)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Uncheck any events you don't want to import.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSelectAll(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => toggleSelectAll(false)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-800/60 border border-slate-700 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Event list */}
              <div className="max-h-72 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950/40 divide-y divide-slate-800/80">
                {syncResult.events.map((evt, idx) => {
                  const eventKey = evt.id || String(idx);
                  const isSelected = !!selectedEventIds[eventKey];

                  return (
                    <div
                      key={eventKey}
                      onClick={() => toggleEventSelected(eventKey)}
                      className={`p-3 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-800/40 hover:bg-slate-800/70' : 'opacity-40 hover:opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by row click
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                                evt.type === 'game'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : evt.type === 'scrimmage'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : evt.type === 'meeting'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              }`}
                            >
                              {evt.type}
                            </span>
                            <span className="font-bold text-white truncate">{evt.title}</span>
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                              Week {evt.week}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <Calendar className="w-3 h-3 text-indigo-400" />
                              {evt.date} @ {evt.startTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {evt.location}
                            </span>
                            {evt.uniform && (
                              <span className="text-amber-300/90 font-medium">
                                🎽 {evt.uniform}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Import Options */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Import Destination:
                  </span>
                  <p className="text-xs text-indigo-300 font-bold">
                    Target Team: {activeTeam.name} ({activeTeam.ageGroup})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Add to existing schedule ({existingEvents.length} events)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-rose-300">Replace current schedule for {activeTeam.name}</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleExecuteImport}
            disabled={!syncResult || selectedCount === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Import {selectedCount} Events to {activeTeam.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
