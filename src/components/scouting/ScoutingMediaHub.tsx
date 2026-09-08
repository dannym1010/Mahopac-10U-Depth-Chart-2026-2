import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Code,
  UploadCloud,
  ExternalLink,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  X,
  Check,
  Copy,
  Plus,
  Trash2,
  Edit3,
  FileCode,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ScoutingAttachment } from '../../types';

interface ScoutingMediaHubProps {
  attachments?: ScoutingAttachment[];
  isPowerAdmin?: boolean;
  onUpdateAttachments: (updated: ScoutingAttachment[]) => void;
  opponentName?: string;
  weekName?: string;
}

// Convert data URL (base64) to Blob
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'application/octet-stream';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

// Format bytes into human readable string
function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Compress and resize images via canvas if needed to keep data URL compact
async function processImageFile(file: File): Promise<{ dataUrl: string; sizeStr: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image'));
      img.onload = () => {
        const MAX_DIM = 1600;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: src, sizeStr: formatBytes(file.size) });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG with 0.85 quality for photographic content or PNG if transparency exists
        const isPng = file.type === 'image/png';
        const mime = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? undefined : 0.85;
        const compressedUrl = canvas.toDataURL(mime, quality);

        // Approximate size
        const approxBytes = Math.round((compressedUrl.length * 3) / 4);
        resolve({
          dataUrl: compressedUrl,
          sizeStr: formatBytes(approxBytes),
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

const SAMPLE_HTML_REPORT = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #1e293b; background: #f8fafc; }
    h2 { color: #0f172a; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #e0e7ff; color: #3730a3; margin-right: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th { background: #0f172a; color: #ffffff; text-align: left; padding: 8px 12px; font-weight: 600; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; background: #ffffff; }
    tr:nth-child(even) td { background: #f1f5f9; }
    .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 4px; color: #991b1b; }
  </style>
</head>
<body>
  <h2>🏈 Opponent Formation & Tendency Breakdown</h2>
  <span class="badge">HUDL EXPORT</span>
  <span class="badge">GAME PREP</span>
  
  <div class="alert-box">
    <strong>Key Coaching Alert:</strong> Opponent shifts to Pistol 20 Personnel on 3rd & short (84% run to strong side off-tackle).
  </div>

  <table>
    <thead>
      <tr>
        <th>Down & Distance</th>
        <th>Top Formation</th>
        <th>Run %</th>
        <th>Pass %</th>
        <th>Primary Play Concept</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1st & 10</td>
        <td>Shotgun 11 Pro</td>
        <td>58%</td>
        <td>42%</td>
        <td>Inside Zone / Bubble Screen</td>
      </tr>
      <tr>
        <td>2nd & Short (1-3)</td>
        <td>Pistol 20 Heavy</td>
        <td>85%</td>
        <td>15%</td>
        <td>Power O / Counter Trey</td>
      </tr>
      <tr>
        <td>3rd & Long (7+)</td>
        <td>Empty Trips 10</td>
        <td>8%</td>
        <td>92%</td>
        <td>Levels / Mesh Shallow Cross</td>
      </tr>
      <tr>
        <td>Red Zone (Inside 20)</td>
        <td>I-Form Tight Wing</td>
        <td>72%</td>
        <td>28%</td>
        <td>Lead Toss / Play Action Boot</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

export const ScoutingMediaHub: React.FC<ScoutingMediaHubProps> = ({
  attachments = [],
  isPowerAdmin = true,
  onUpdateAttachments,
  opponentName = 'Opponent',
  weekName = 'Week 1',
}) => {
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'image' | 'html'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Active modal viewers
  const [activeViewerAttachment, setActiveViewerAttachment] = useState<ScoutingAttachment | null>(null);
  const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<ScoutingAttachment | null>(null);

  // HTML Editor Modal State
  const [htmlTitle, setHtmlTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlPreviewMode, setHtmlPreviewMode] = useState<'preview' | 'code'>('preview');
  const [htmlCopied, setHtmlCopied] = useState(false);

  // Image Lightbox Controls
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  // Caption Editing State
  const [captionInput, setCaptionInput] = useState('');
  const [isEditingCaption, setIsEditingCaption] = useState(false);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset zoom & rotation when viewer opens
  useEffect(() => {
    setImageZoom(1);
    setImageRotation(0);
    if (activeViewerAttachment) {
      setCaptionInput(activeViewerAttachment.caption || '');
      setIsEditingCaption(false);
    }
  }, [activeViewerAttachment]);

  // Filtered attachments
  const filteredAttachments = useMemo(() => {
    if (filterType === 'all') return attachments;
    return attachments.filter((a) => a.type === filterType);
  }, [attachments, filterType]);

  const pdfCount = attachments.filter((a) => a.type === 'pdf').length;
  const imageCount = attachments.filter((a) => a.type === 'image').length;
  const htmlCount = attachments.filter((a) => a.type === 'html').length;

  // Process uploaded files (PDF, images, HTML)
  const handleProcessFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setUploadError(null);

    const newAttachments: ScoutingAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name || `Attachment ${Date.now()}`;
      const lowerName = fileName.toLowerCase();

      try {
        if (file.type === 'application/pdf' || lowerName.endsWith('.pdf')) {
          // PDF Handler
          if (file.size > 8 * 1024 * 1024) {
            setUploadError(`"${fileName}" exceeds 8MB. Please compress PDF for optimal performance.`);
            continue;
          }

          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Failed to read PDF file'));
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });

          newAttachments.push({
            id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: fileName,
            type: 'pdf',
            dataUrl: base64,
            fileSize: formatBytes(file.size),
            caption: `Uploaded PDF document for ${opponentName}`,
            createdAt: Date.now(),
          });
        } else if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(lowerName)) {
          // Image Handler
          const { dataUrl, sizeStr } = await processImageFile(file);

          newAttachments.push({
            id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: fileName,
            type: 'image',
            dataUrl,
            fileSize: sizeStr,
            caption: `Scouting diagram / photo for ${opponentName}`,
            createdAt: Date.now(),
          });
        } else if (
          file.type === 'text/html' ||
          lowerName.endsWith('.html') ||
          lowerName.endsWith('.htm')
        ) {
          // HTML File Handler
          const htmlText = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Failed to read HTML file'));
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsText(file);
          });

          newAttachments.push({
            id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: fileName.replace(/\.html?$/i, ''),
            type: 'html',
            htmlCode: htmlText,
            fileSize: formatBytes(file.size),
            caption: `Interactive HTML scouting breakdown for ${opponentName}`,
            createdAt: Date.now(),
          });
        } else {
          setUploadError(
            `"${fileName}" is not supported. Supported formats: PDF documents (.pdf), Pictures (.png, .jpg, .webp, .svg), and HTML (.html).`
          );
        }
      } catch (err: any) {
        console.error('Error processing file:', err);
        setUploadError(`Failed to process ${fileName}: ${err.message}`);
      }
    }

    if (newAttachments.length > 0) {
      onUpdateAttachments([...attachments, ...newAttachments]);
    }
    setIsProcessing(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Open HTML Editor (new or edit existing)
  const handleOpenHtmlEditor = (existing?: ScoutingAttachment) => {
    if (existing) {
      setEditingAttachment(existing);
      setHtmlTitle(existing.name);
      setHtmlContent(existing.htmlCode || '');
    } else {
      setEditingAttachment(null);
      setHtmlTitle(`${opponentName} HTML Scouting Report`);
      setHtmlContent(SAMPLE_HTML_REPORT);
    }
    setHtmlPreviewMode('preview');
    setIsHtmlEditorOpen(true);
  };

  // Save HTML Report
  const handleSaveHtmlReport = () => {
    if (!htmlTitle.trim()) {
      setUploadError('Please provide a title for the HTML report.');
      return;
    }

    const approxBytes = new Blob([htmlContent]).size;
    const sizeStr = formatBytes(approxBytes);

    if (editingAttachment) {
      // Update existing
      const updated = attachments.map((a) =>
        a.id === editingAttachment.id
          ? {
              ...a,
              name: htmlTitle.trim(),
              htmlCode: htmlContent,
              fileSize: sizeStr,
            }
          : a
      );
      onUpdateAttachments(updated);
      if (activeViewerAttachment?.id === editingAttachment.id) {
        setActiveViewerAttachment({
          ...editingAttachment,
          name: htmlTitle.trim(),
          htmlCode: htmlContent,
          fileSize: sizeStr,
        });
      }
    } else {
      // Create new
      const newAtt: ScoutingAttachment = {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: htmlTitle.trim(),
        type: 'html',
        htmlCode: htmlContent,
        fileSize: sizeStr,
        caption: `Custom HTML report for ${opponentName}`,
        createdAt: Date.now(),
      };
      onUpdateAttachments([...attachments, newAtt]);
    }

    setIsHtmlEditorOpen(false);
    setEditingAttachment(null);
  };

  // Delete attachment
  const handleDeleteAttachment = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this scouting attachment?')) {
      onUpdateAttachments(attachments.filter((a) => a.id !== id));
      if (activeViewerAttachment?.id === id) {
        setActiveViewerAttachment(null);
      }
    }
  };

  // Update caption
  const handleSaveCaption = () => {
    if (!activeViewerAttachment) return;
    const updated = attachments.map((a) =>
      a.id === activeViewerAttachment.id ? { ...a, caption: captionInput.trim() } : a
    );
    onUpdateAttachments(updated);
    setActiveViewerAttachment({ ...activeViewerAttachment, caption: captionInput.trim() });
    setIsEditingCaption(false);
  };

  // Download attachment
  const handleDownloadAttachment = (att: ScoutingAttachment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let downloadUrl = '';
    let fileName = att.name;

    if (att.type === 'pdf' || att.type === 'image') {
      if (!att.dataUrl) return;
      downloadUrl = att.dataUrl;
      if (!fileName.includes('.')) {
        fileName += att.type === 'pdf' ? '.pdf' : '.jpg';
      }
    } else if (att.type === 'html') {
      const blob = new Blob([att.htmlCode || ''], { type: 'text/html;charset=utf-8' });
      downloadUrl = URL.createObjectURL(blob);
      if (!fileName.toLowerCase().endsWith('.html') && !fileName.toLowerCase().endsWith('.htm')) {
        fileName += '.html';
      }
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Open in new tab (creates Blob URL so browser native PDF / HTML viewer renders directly)
  const handleOpenInNewTab = (att: ScoutingAttachment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let blobUrl = '';
    if (att.type === 'pdf' && att.dataUrl) {
      const blob = dataUrlToBlob(att.dataUrl);
      blobUrl = URL.createObjectURL(blob);
    } else if (att.type === 'image' && att.dataUrl) {
      blobUrl = att.dataUrl;
    } else if (att.type === 'html') {
      const blob = new Blob([att.htmlCode || ''], { type: 'text/html;charset=utf-8' });
      blobUrl = URL.createObjectURL(blob);
    }

    if (blobUrl) {
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Blob URL for active viewer
  const activeBlobUrl = useMemo(() => {
    if (!activeViewerAttachment) return '';
    if (activeViewerAttachment.type === 'pdf' && activeViewerAttachment.dataUrl) {
      try {
        const blob = dataUrlToBlob(activeViewerAttachment.dataUrl);
        return URL.createObjectURL(blob);
      } catch (err) {
        console.error('Failed to create PDF blob URL:', err);
        return activeViewerAttachment.dataUrl;
      }
    }
    return '';
  }, [activeViewerAttachment]);

  return (
    <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-xl p-5 md:p-6 print:hidden space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shadow-sm">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm md:text-base text-slate-100">
                Scouting Attachments, Documents &amp; HTML Code
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-700/80 text-slate-300 font-mono text-[10px] font-black uppercase">
                {attachments.length} Attached
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Upload opponent PDF reports, whiteboard diagrams/pictures, or paste custom HTML embeds
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload PDF or Picture</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenHtmlEditor()}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Code className="w-4 h-4 text-amber-400" />
            <span>Paste / Edit HTML Code</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input (Supports click & multiple files) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf,image/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.html,.htm,text/html"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleProcessFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Error Banner */}
      {uploadError && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-2xl text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 md:p-6 text-center transition-all cursor-pointer group ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-900/80'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileCode className="w-4 h-4" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
              <span className="text-indigo-400 underline decoration-indigo-400/50 underline-offset-2">
                Click to browse
              </span>{' '}
              or drag &amp; drop files here
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports <strong className="text-red-300">PDF Documents</strong>,{' '}
              <strong className="text-emerald-300">Pictures/Diagrams</strong> (PNG, JPG, WebP), and{' '}
              <strong className="text-amber-300">HTML reports</strong>
            </p>
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold pt-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Processing &amp; optimizing files...</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      {attachments.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold w-fit">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({attachments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('pdf')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'pdf' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>PDFs ({pdfCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('image')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'image' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Pictures ({imageCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('html')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'html' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>HTML ({htmlCount})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Saved to {weekName} Scouting Profile
          </span>
        </div>
      )}

      {/* Attachments Grid */}
      {filteredAttachments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttachments.map((att) => {
            const isPdf = att.type === 'pdf';
            const isImage = att.type === 'image';
            const isHtml = att.type === 'html';

            return (
              <div
                key={att.id}
                onClick={() => setActiveViewerAttachment(att)}
                className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-indigo-500/60 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Visual Thumbnail Area */}
                <div className="relative h-36 w-full bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-800">
                  {isImage && att.dataUrl ? (
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : isPdf ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                        PDF Scouting Document
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Code className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                        Interactive HTML Report
                      </span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase tracking-wider border shadow-xs ${
                        isPdf
                          ? 'bg-red-600/90 text-white border-red-400/50'
                          : isImage
                          ? 'bg-emerald-600/90 text-white border-emerald-400/50'
                          : 'bg-amber-600/90 text-white border-amber-400/50'
                      }`}
                    >
                      {att.type.toUpperCase()}
                    </span>
                    {att.fileSize && (
                      <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-slate-300 text-[9px] font-mono font-bold">
                        {att.fileSize}
                      </span>
                    )}
                  </div>

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveViewerAttachment(att);
                      }}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title="Open Interactive Viewer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleOpenInNewTab(att, e)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title="Open in New Tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadAttachment(att, e)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className="font-black text-xs text-slate-100 truncate group-hover:text-indigo-300 transition-colors"
                      title={att.name}
                    >
                      {att.name}
                    </h4>
                    {isPowerAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        {isHtml && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenHtmlEditor(att);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit HTML Source"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAttachment(att.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {att.caption && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {att.caption}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{new Date(att.createdAt).toLocaleDateString()}</span>
                    <span className="text-indigo-400 group-hover:underline flex items-center gap-0.5">
                      <span>Click to view</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : attachments.length > 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          No attachments match the selected filter. Switch back to "All" to view all documents.
        </div>
      ) : (
        <div className="py-6 text-center text-slate-500 text-xs italic bg-slate-900/30 rounded-2xl border border-slate-800/80">
          No scouting documents uploaded yet. Add an opponent PDF packet, diagram photo, or HTML report above.
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INTERACTIVE ATTACHMENT VIEWER (PDF, PICTURE, OR HTML) */}
      {/* ========================================================================= */}
      {activeViewerAttachment && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    activeViewerAttachment.type === 'pdf'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : activeViewerAttachment.type === 'image'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {activeViewerAttachment.type === 'pdf' ? (
                    <FileText className="w-5 h-5" />
                  ) : activeViewerAttachment.type === 'image' ? (
                    <ImageIcon className="w-5 h-5" />
                  ) : (
                    <Code className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-sm sm:text-base text-slate-100 truncate">
                      {activeViewerAttachment.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[9px] font-black uppercase">
                      {activeViewerAttachment.type.toUpperCase()}
                    </span>
                    {activeViewerAttachment.fileSize && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {activeViewerAttachment.fileSize}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Uploaded on {new Date(activeViewerAttachment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Viewer Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Image Specific Controls */}
                {activeViewerAttachment.type === 'image' && (
                  <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageRotation((r) => (r + 90) % 360)}
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg cursor-pointer"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageZoom(1);
                        setImageRotation(0);
                      }}
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg cursor-pointer"
                      title="Reset View"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* HTML Edit Shortcut */}
                {activeViewerAttachment.type === 'html' && isPowerAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const cur = activeViewerAttachment;
                      setActiveViewerAttachment(null);
                      handleOpenHtmlEditor(cur);
                    }}
                    className="px-3 py-1.5 bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit HTML</span>
                  </button>
                )}

                {/* Open In New Tab */}
                <button
                  type="button"
                  onClick={() => handleOpenInNewTab(activeViewerAttachment)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Open full page in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </button>

                {/* Download */}
                <button
                  type="button"
                  onClick={() => handleDownloadAttachment(activeViewerAttachment)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Download attachment"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setActiveViewerAttachment(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Active Media Viewer */}
            <div className="flex-1 overflow-auto bg-slate-950 p-4 flex items-center justify-center min-h-[450px]">
              {/* PDF Viewer */}
              {activeViewerAttachment.type === 'pdf' && (
                <div className="w-full h-[68vh] flex flex-col">
                  {activeBlobUrl ? (
                    <iframe
                      src={activeBlobUrl}
                      title={activeViewerAttachment.name}
                      className="w-full h-full rounded-2xl border border-slate-800 bg-slate-900"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                      <FileText className="w-12 h-12 text-red-400" />
                      <p className="text-slate-300 font-bold text-sm">
                        PDF preview ready. Click below to open in your browser's native PDF reader.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenInNewTab(activeViewerAttachment)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open PDF in New Window</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Picture / Diagram Viewer */}
              {activeViewerAttachment.type === 'image' && (
                <div className="w-full h-[68vh] overflow-auto flex items-center justify-center p-4">
                  <div
                    style={{
                      transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="max-w-full max-h-full flex items-center justify-center"
                  >
                    <img
                      src={activeViewerAttachment.dataUrl}
                      alt={activeViewerAttachment.name}
                      className="max-w-full max-h-[64vh] object-contain rounded-xl shadow-2xl border border-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* HTML Report Viewer */}
              {activeViewerAttachment.type === 'html' && (
                <div className="w-full h-[68vh] flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-700">
                  <iframe
                    srcDoc={activeViewerAttachment.htmlCode || ''}
                    title={activeViewerAttachment.name}
                    className="w-full h-full border-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Caption / Notes Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex-1">
                {isEditingCaption ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={captionInput}
                      onChange={(e) => setCaptionInput(e.target.value)}
                      placeholder="Add coach notes or caption for this document..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveCaption}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-500"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCaption(false)}
                      className="px-2 py-1.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">Notes:</span>
                    <span className="text-slate-300">
                      {activeViewerAttachment.caption || 'No specific notes logged.'}
                    </span>
                    {isPowerAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCaption(true)}
                        className="text-indigo-400 hover:text-indigo-300 ml-1 p-0.5 cursor-pointer"
                        title="Edit notes"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {isPowerAdmin && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteAttachment(activeViewerAttachment.id, e)}
                    className="px-3 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Attachment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PASTE & EDIT HTML SCOUTING CODE */}
      {/* ========================================================================= */}
      {isHtmlEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-100">
                    {editingAttachment ? 'Edit HTML Scouting Report' : 'Paste Custom HTML Report Code'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Paste raw HTML from Hudl, web scouting exports, or custom styled opponent breakdowns
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsHtmlEditorOpen(false);
                  setEditingAttachment(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs & Mode Switcher */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={htmlTitle}
                  onChange={(e) => setHtmlTitle(e.target.value)}
                  placeholder="e.g. Opponent Hudl Tendency Breakdown"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setHtmlPreviewMode('preview')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      htmlPreviewMode === 'preview'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHtmlPreviewMode('code')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      htmlPreviewMode === 'code'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>HTML Source</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setHtmlContent(SAMPLE_HTML_REPORT);
                    setHtmlTitle(`${opponentName} Formation & Tendency Breakdown`);
                  }}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Insert a sample football scouting breakdown template"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Load Template</span>
                </button>
              </div>
            </div>

            {/* Editor / Preview Area */}
            <div className="flex-1 overflow-hidden min-h-[380px] flex flex-col bg-slate-950 p-4">
              {htmlPreviewMode === 'code' ? (
                <div className="relative flex-1 flex flex-col">
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="Paste your custom HTML code here (<table...>, <div>, Hudl embed, etc.)..."
                    className="w-full flex-1 min-h-[340px] bg-slate-900 font-mono text-xs text-amber-200/90 p-4 rounded-2xl border border-slate-800 focus:outline-none focus:border-amber-500/80 resize-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(htmlContent);
                      setHtmlCopied(true);
                      setTimeout(() => setHtmlCopied(false), 2000);
                    }}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800/90 hover:bg-slate-750 text-slate-300 rounded-lg text-[11px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {htmlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{htmlCopied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-slate-800 min-h-[340px]">
                  <iframe
                    srcDoc={htmlContent}
                    title="Live HTML Scouting Preview"
                    sandbox="allow-same-origin allow-scripts"
                    className="w-full h-full min-h-[340px] border-none"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                HTML report will be saved directly with this week's scouting data
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsHtmlEditorOpen(false);
                    setEditingAttachment(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveHtmlReport}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAttachment ? 'Update HTML Report' : 'Save HTML Report'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
