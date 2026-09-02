import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Palette,
  Check,
  Zap,
  Shield,
  Watch,
  Users,
  Eye,
  Sliders,
  Sun,
  Moon,
  Flame,
  Star,
  Award,
} from 'lucide-react';

export interface ThemeScheme {
  id: string;
  name: string;
  subtitle: string;
  vibe: string;
  category: 'Modern Pro' | 'Championship' | 'Sports Tech' | 'Tactical' | 'Vintage Heritage';
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  starterBadge: {
    bg: string;
    text: string;
    border: string;
    label: string;
  };
  backupBadge: {
    bg: string;
    text: string;
    border: string;
    label: string;
  };
  reserveBadge: {
    bg: string;
    text: string;
    border: string;
    label: string;
  };
  launchpadCard: {
    gradient: string;
    border: string;
    iconBg: string;
    iconText: string;
    titleColor: string;
    badgeBg: string;
    badgeText: string;
  };
  wristband: {
    headerBg: string;
    headerText: string;
    leftRowBg: string;
    rightRowBg: string;
    tagBg: string;
  };
  swatches: { name: string; hex: string; desc: string }[];
  sidelineAdvantage: string;
}

export const THEME_SCHEMES: ThemeScheme[] = [
  {
    id: 'electric_volt',
    name: 'Midnight Gridiron & Electric Volt',
    subtitle: 'Nike Elite & Modern Oregon Athletic Style',
    category: 'Modern Pro',
    vibe: 'Ultra-modern, high-voltage energy with razor-sharp outdoor contrast.',
    bgGradient: 'from-slate-950 via-zinc-950 to-emerald-950/40',
    cardBg: 'bg-zinc-900/95',
    cardBorder: 'border-lime-500/40 hover:border-lime-400',
    starterBadge: {
      bg: 'bg-lime-400 text-black',
      border: 'border-lime-300',
      text: 'text-black font-black',
      label: 'STARTER • VOLT',
    },
    backupBadge: {
      bg: 'bg-cyan-500/20 text-cyan-300',
      border: 'border-cyan-400/40',
      text: 'text-cyan-300',
      label: '2ND STRING • CYAN',
    },
    reserveBadge: {
      bg: 'bg-zinc-800 text-zinc-300',
      border: 'border-zinc-700',
      text: 'text-zinc-300',
      label: '3RD STRING',
    },
    launchpadCard: {
      gradient: 'from-zinc-900 via-zinc-900 to-lime-950/40',
      border: 'border-lime-500/50 hover:border-lime-400',
      iconBg: 'bg-lime-400/20 border-lime-400/40',
      iconText: 'text-lime-400',
      titleColor: 'text-white group-hover:text-lime-300',
      badgeBg: 'bg-lime-400/20',
      badgeText: 'text-lime-300 border-lime-400/30',
    },
    wristband: {
      headerBg: 'bg-lime-400 text-black',
      headerText: 'text-black font-black',
      leftRowBg: 'bg-lime-950/30 border-lime-500/30',
      rightRowBg: 'bg-cyan-950/30 border-cyan-500/30',
      tagBg: 'bg-lime-400 text-black',
    },
    swatches: [
      { name: 'Carbon Jet', hex: '#0B0F17', desc: 'Base canvas' },
      { name: 'Volt Neon', hex: '#CCFF00', desc: 'Starters & key calls' },
      { name: 'Electric Cyan', hex: '#06B6D4', desc: '2nd string & motions' },
      { name: 'Smoked Zinc', hex: '#27272A', desc: 'Card background' },
    ],
    sidelineAdvantage: 'High-luminance volt cuts through midday sun glare and bright stadium lights instantly.',
  },
  {
    id: 'championship_gold',
    name: 'Carbon Stealth & Championship Gold',
    subtitle: 'Vegas Nights & Black-and-Gold Dynasty',
    category: 'Championship',
    vibe: 'Premium, authoritative, collegiate championship feel with warm metallic luster.',
    bgGradient: 'from-zinc-950 via-neutral-950 to-amber-950/30',
    cardBg: 'bg-neutral-900/95',
    cardBorder: 'border-amber-500/40 hover:border-amber-400',
    starterBadge: {
      bg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black',
      border: 'border-amber-300',
      text: 'text-black font-black',
      label: 'STARTER • GOLD',
    },
    backupBadge: {
      bg: 'bg-neutral-800 text-amber-300',
      border: 'border-amber-500/40',
      text: 'text-amber-300',
      label: '2ND STRING • SILVER/GOLD',
    },
    reserveBadge: {
      bg: 'bg-neutral-850 text-neutral-400',
      border: 'border-neutral-700',
      text: 'text-neutral-300',
      label: '3RD STRING',
    },
    launchpadCard: {
      gradient: 'from-neutral-900 via-neutral-900 to-amber-950/40',
      border: 'border-amber-500/50 hover:border-amber-400',
      iconBg: 'bg-amber-400/20 border-amber-400/40',
      iconText: 'text-amber-400',
      titleColor: 'text-white group-hover:text-amber-300',
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300 border-amber-500/30',
    },
    wristband: {
      headerBg: 'bg-amber-400 text-black',
      headerText: 'text-black font-black',
      leftRowBg: 'bg-amber-950/30 border-amber-500/30',
      rightRowBg: 'bg-neutral-900 border-neutral-700',
      tagBg: 'bg-amber-400 text-black',
    },
    swatches: [
      { name: 'Obsidian Jet', hex: '#09090B', desc: 'Background dark' },
      { name: 'Aztec Gold', hex: '#F59E0B', desc: 'Primary accents' },
      { name: 'Ice Silver', hex: '#E2E8F0', desc: 'Text & borders' },
      { name: 'Bronze Shadow', hex: '#78350F', desc: 'Depth layers' },
    ],
    sidelineAdvantage: 'High contrast with deep gold accents gives playbooks and depth charts a bold varsity look.',
  },
  {
    id: 'cyber_cobalt',
    name: 'Cyber Cobalt & Coral Rush',
    subtitle: 'HUDL & Catapult Next-Gen Sports Analytics',
    category: 'Sports Tech',
    vibe: 'Crisp sports analytics interface with high visual differentiation between units.',
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950/40',
    cardBg: 'bg-slate-900/95',
    cardBorder: 'border-indigo-500/40 hover:border-indigo-400',
    starterBadge: {
      bg: 'bg-indigo-600 text-white',
      border: 'border-indigo-400',
      text: 'text-white font-black',
      label: 'STARTER • COBALT',
    },
    backupBadge: {
      bg: 'bg-rose-500/20 text-rose-300',
      border: 'border-rose-400/40',
      text: 'text-rose-300',
      label: '2ND STRING • CORAL',
    },
    reserveBadge: {
      bg: 'bg-slate-800 text-slate-300',
      border: 'border-slate-700',
      text: 'text-slate-300',
      label: '3RD STRING',
    },
    launchpadCard: {
      gradient: 'from-slate-900 via-slate-900 to-indigo-950/50',
      border: 'border-indigo-500/50 hover:border-indigo-400',
      iconBg: 'bg-indigo-500/20 border-indigo-500/40',
      iconText: 'text-indigo-400',
      titleColor: 'text-white group-hover:text-indigo-300',
      badgeBg: 'bg-indigo-500/20',
      badgeText: 'text-indigo-300 border-indigo-500/30',
    },
    wristband: {
      headerBg: 'bg-indigo-600 text-white',
      headerText: 'text-white font-black',
      leftRowBg: 'bg-indigo-950/40 border-indigo-500/30',
      rightRowBg: 'bg-rose-950/40 border-rose-500/30',
      tagBg: 'bg-rose-500 text-white',
    },
    swatches: [
      { name: 'Space Navy', hex: '#0A0F24', desc: 'Main backdrop' },
      { name: 'Hyper Cobalt', hex: '#3B82F6', desc: 'Offense & starters' },
      { name: 'Coral Rush', hex: '#F43F5E', desc: 'Blitz & warnings' },
      { name: 'Cyan Glass', hex: '#06B6D4', desc: 'Badges & tags' },
    ],
    sidelineAdvantage: 'Instant cognitive separation between Offense (Cobalt) and Defense/Substitutions (Coral).',
  },
  {
    id: 'stealth_olive',
    name: 'Stealth Olive & Tactical Desert',
    subtitle: 'Special Ops & Service Academy Athletic',
    category: 'Tactical',
    vibe: 'Rugged, disciplined, matte field equipment aesthetic with safety orange pop.',
    bgGradient: 'from-stone-950 via-zinc-950 to-emerald-950/30',
    cardBg: 'bg-zinc-900/95',
    cardBorder: 'border-orange-500/40 hover:border-orange-400',
    starterBadge: {
      bg: 'bg-orange-500 text-white',
      border: 'border-orange-400',
      text: 'text-white font-black',
      label: 'STARTER • ORANGE',
    },
    backupBadge: {
      bg: 'bg-lime-950/60 text-lime-300',
      border: 'border-lime-500/40',
      text: 'text-lime-300',
      label: '2ND STRING • OLIVE',
    },
    reserveBadge: {
      bg: 'bg-stone-850 text-stone-300',
      border: 'border-stone-700',
      text: 'text-stone-300',
      label: '3RD STRING',
    },
    launchpadCard: {
      gradient: 'from-zinc-900 via-zinc-900 to-orange-950/30',
      border: 'border-orange-500/50 hover:border-orange-400',
      iconBg: 'bg-orange-500/20 border-orange-500/40',
      iconText: 'text-orange-400',
      titleColor: 'text-white group-hover:text-orange-300',
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-300 border-orange-500/30',
    },
    wristband: {
      headerBg: 'bg-orange-500 text-white',
      headerText: 'text-white font-black',
      leftRowBg: 'bg-orange-950/30 border-orange-500/30',
      rightRowBg: 'bg-lime-950/30 border-lime-500/30',
      tagBg: 'bg-orange-500 text-white',
    },
    swatches: [
      { name: 'Gunmetal Slate', hex: '#18181B', desc: 'Tactical base' },
      { name: 'Safety Blaze', hex: '#F97316', desc: 'High-priority actions' },
      { name: 'Field Olive', hex: '#65A30D', desc: 'Sub-packages' },
      { name: 'Desert Sand', hex: '#D6D3D1', desc: 'Monospace data' },
    ],
    sidelineAdvantage: 'Extremely easy on coach eyes for evening practices, film breakdown, and low-light sidelines.',
  },
  {
    id: 'heritage_crimson',
    name: 'Vintage Heritage Crimson & Warm Bone',
    subtitle: 'Classic Powerhouse & Traditional NCAA Varsity',
    category: 'Vintage Heritage',
    vibe: 'Timeless powerhouse aesthetic with rich burgundy, warm bone off-white, and antique gold.',
    bgGradient: 'from-slate-950 via-neutral-950 to-rose-950/30',
    cardBg: 'bg-neutral-900/95',
    cardBorder: 'border-rose-500/40 hover:border-rose-400',
    starterBadge: {
      bg: 'bg-rose-700 text-white',
      border: 'border-rose-500',
      text: 'text-white font-black',
      label: 'STARTER • CRIMSON',
    },
    backupBadge: {
      bg: 'bg-amber-950/50 text-amber-200',
      border: 'border-amber-500/40',
      text: 'text-amber-200',
      label: '2ND STRING • ATHLETIC GOLD',
    },
    reserveBadge: {
      bg: 'bg-neutral-800 text-stone-300',
      border: 'border-neutral-700',
      text: 'text-stone-300',
      label: '3RD STRING',
    },
    launchpadCard: {
      gradient: 'from-neutral-900 via-neutral-900 to-rose-950/40',
      border: 'border-rose-500/50 hover:border-rose-400',
      iconBg: 'bg-rose-500/20 border-rose-500/40',
      iconText: 'text-rose-400',
      titleColor: 'text-white group-hover:text-rose-300',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300 border-rose-500/30',
    },
    wristband: {
      headerBg: 'bg-rose-700 text-white',
      headerText: 'text-white font-black',
      leftRowBg: 'bg-rose-950/30 border-rose-500/30',
      rightRowBg: 'bg-amber-950/30 border-amber-500/30',
      tagBg: 'bg-rose-700 text-white',
    },
    swatches: [
      { name: 'Heritage Burgundy', hex: '#881337', desc: 'Varsity identity' },
      { name: 'Warm Bone', hex: '#FAF5EE', desc: 'Ultra-clean text' },
      { name: 'Varsity Gold', hex: '#D97706', desc: 'Highlights & badges' },
      { name: 'Obsidian Neutral', hex: '#171717', desc: 'Card container' },
    ],
    sidelineAdvantage: 'Classic timeless varsity appeal with maximum warmth and zero digital eye strain.',
  },
];

interface ThemeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
}

export const ThemeGalleryModal: React.FC<ThemeGalleryModalProps> = ({
  isOpen,
  onClose,
  selectedThemeId = 'electric_volt',
  onSelectTheme,
}) => {
  const [activeTabThemeId, setActiveTabThemeId] = useState<string>(selectedThemeId);
  const [appliedThemeId, setAppliedThemeId] = useState<string>(selectedThemeId);

  if (!isOpen) return null;

  const currentTheme = THEME_SCHEMES.find((s) => s.id === activeTabThemeId) || THEME_SCHEMES[0];

  const handleApply = (themeId: string) => {
    setAppliedThemeId(themeId);
    if (onSelectTheme) {
      onSelectTheme(themeId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Sideline Visual Scheme Showcase
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  5 Trendy Themes
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Compare athletic palettes optimized for sideline glare, phone screens, and high-contrast coaching.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-Column Layout on Desktop, Scrollable on Mobile */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. Theme Scheme Picker Carousel / Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {THEME_SCHEMES.map((scheme) => {
              const isActive = scheme.id === currentTheme.id;
              const isApplied = scheme.id === appliedThemeId;

              return (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => setActiveTabThemeId(scheme.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 border-indigo-400 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-400'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {scheme.category}
                    </span>
                    {isApplied && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[9px] font-black">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-black text-white line-clamp-1">
                    {scheme.name.split('&')[0].trim()}
                  </div>

                  {/* Tiny Color Swatch Preview Bar */}
                  <div className="flex gap-1 mt-2">
                    {scheme.swatches.map((sw, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full border border-black/40 shadow-xs"
                        style={{ backgroundColor: sw.hex }}
                        title={sw.name}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 2. Active Scheme Showcase Card */}
          <div className={`rounded-3xl border ${currentTheme.cardBorder} p-4 sm:p-5 bg-gradient-to-br ${currentTheme.bgGradient} space-y-5 shadow-2xl relative overflow-hidden transition-all duration-300`}>
            {/* Theme Hero Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20">
                    {currentTheme.category}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    {currentTheme.subtitle}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  {currentTheme.name}
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {currentTheme.vibe}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleApply(currentTheme.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    appliedThemeId === currentTheme.id
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-white text-black hover:bg-slate-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{appliedThemeId === currentTheme.id ? 'Active Scheme' : 'Set as App Theme'}</span>
                </button>
              </div>
            </div>

            {/* Visual Component Previews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Preview 1: Mobile Depth Chart Card */}
              <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-slate-400" />
                    Depth Chart Card (Mobile)
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">I-Formation • QB</span>
                </div>

                {/* 1st String (Starter) */}
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black text-amber-300 font-mono font-black text-xs flex items-center justify-center border border-zinc-700">
                      #12
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">
                        Jaxson Dart
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        Starter • 1st String
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${currentTheme.starterBadge.bg} ${currentTheme.starterBadge.text} border ${currentTheme.starterBadge.border}`}>
                    {currentTheme.starterBadge.label.split('•')[0]}
                  </span>
                </div>

                {/* 2nd String (Backup) */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2 opacity-90">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 text-slate-300 font-mono font-black text-xs flex items-center justify-center border border-zinc-700">
                      #7
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-200 truncate">
                        C. Williams
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        2nd String Backup
                      </div>
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${currentTheme.backupBadge.bg} ${currentTheme.backupBadge.text} border ${currentTheme.backupBadge.border}`}>
                    2nd
                  </span>
                </div>
              </div>

              {/* Preview 2: Mobile Launchpad Quick Tile */}
              <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-3.5 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-slate-400" />
                      Mobile Launch Pad
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Quick Touch</span>
                  </div>

                  <div className={`bg-gradient-to-br ${currentTheme.launchpadCard.gradient} border ${currentTheme.launchpadCard.border} p-3 rounded-2xl shadow-lg relative overflow-hidden group`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl ${currentTheme.launchpadCard.iconBg} ${currentTheme.launchpadCard.iconText} border flex items-center justify-center`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${currentTheme.launchpadCard.badgeBg} ${currentTheme.launchpadCard.badgeText} border`}>
                        Mobile View
                      </span>
                    </div>
                    <div className={`text-sm font-black ${currentTheme.launchpadCard.titleColor}`}>
                      Depth Chart
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Pocket Chart &amp; Matrix
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 italic">
                  Instant touch response with high-chroma button glow.
                </div>
              </div>

              {/* Preview 3: Wristband Callout & Swatches */}
              <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-3.5 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Watch className="w-3 h-3 text-slate-400" />
                      Wristband Callout
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">High Vis</span>
                  </div>

                  <div className="border border-black rounded-xl overflow-hidden shadow-md">
                    <div className={`px-2.5 py-1 text-[11px] ${currentTheme.wristband.headerBg} flex items-center justify-between`}>
                      <span className="font-black">RED • RUN</span>
                      <span className="font-mono font-black">#24</span>
                    </div>
                    <div className={`p-2 bg-slate-900 border-t border-slate-800 text-xs font-black text-white flex items-center justify-between`}>
                      <span>I-Right 24 Power Lead</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-400/20 text-amber-300 font-bold">
                        P1
                      </span>
                    </div>
                  </div>
                </div>

                {/* Swatches List */}
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <div className="text-[10px] font-black uppercase text-slate-400">Palette Tokens</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentTheme.swatches.map((sw, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                          style={{ backgroundColor: sw.hex }}
                        />
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-white truncate leading-tight">
                            {sw.name}
                          </div>
                          <div className="text-[8px] font-mono text-slate-400 leading-none">
                            {sw.hex}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sideline Advantage Callout */}
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs text-slate-200">
                <span className="font-black text-white">Sideline Advantage: </span>
                {currentTheme.sidelineAdvantage}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            Tip: You can switch schemes anytime to match team jersey colors or light conditions.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
          >
            Close Showcase
          </button>
        </div>
      </div>
    </div>
  );
};
