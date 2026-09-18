import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  RefreshCw,
  Printer,
  Layers,
  AlertCircle,
  Loader2,
} from 'lucide-react';

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  fileName?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  fileName,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [rotation, setRotation] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'continuous' | 'single'>('continuous');
  const [loading, setLoading] = useState<boolean>(true);
  const [renderingPages, setRenderingPages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Download URL (adds ?download=1 if it's our internal API endpoint)
  const downloadUrl = pdfUrl.startsWith('/api/files/')
    ? `${pdfUrl}?download=1`
    : pdfUrl;

  const displayFileName = fileName || title || 'ملف_الامتحان.pdf';

  // Load PDF Document via PDF.js
  const loadPdfDocument = useCallback(async () => {
    if (!pdfUrl) return;

    setLoading(true);
    setError(null);
    setNumPages(0);
    setCurrentPage(1);

    try {
      // Ensure PDF.js is available
      if (!window.pdfjsLib) {
        // Wait briefly in case the script is still initializing
        let attempts = 0;
        while (!window.pdfjsLib && attempts < 10) {
          await new Promise((res) => setTimeout(res, 200));
          attempts++;
        }
      }

      if (!window.pdfjsLib) {
        throw new Error('محرك قراءة ملفات الـ PDF غير متوفر حالياً. يمكنك فتح أو تنزيل الملف مباشرة.');
      }

      // Ensure worker is configured
      if (window.pdfjsLib.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
      }

      const loadingTask = window.pdfjsLib.getDocument({
        url: pdfUrl,
        withCredentials: false,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });

      const doc = await loadingTask.promise;
      pdfDocRef.current = doc;
      setNumPages(doc.numPages);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading PDF document:', err);
      setError(err?.message || 'تعذر تحميل ملف الـ PDF. يرجى التأكد من صحة الملف أو فتحه في نافذة جديدة.');
      setLoading(false);
    }
  }, [pdfUrl]);

  useEffect(() => {
    if (isOpen && pdfUrl) {
      loadPdfDocument();
    } else {
      pdfDocRef.current = null;
    }
  }, [isOpen, pdfUrl, loadPdfDocument]);

  // Render Page to Canvas
  const renderPageToCanvas = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement) => {
      if (!pdfDocRef.current) return;
      try {
        const page = await pdfDocRef.current.getPage(pageNum);
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale, rotation: rotation });

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    },
    [scale, rotation]
  );

  // Render all or single page when ready, or when scale/rotation/viewMode changes
  useEffect(() => {
    if (!isOpen || !pdfDocRef.current || numPages === 0 || loading) return;

    let isMounted = true;
    setRenderingPages(true);

    const renderPages = async () => {
      if (!pagesContainerRef.current) return;

      const container = pagesContainerRef.current;
      // Clear existing canvases
      container.innerHTML = '';

      if (viewMode === 'continuous') {
        // Render every page from 1 to numPages
        for (let i = 1; i <= numPages; i++) {
          if (!isMounted) break;

          const pageWrapper = document.createElement('div');
          pageWrapper.className =
            'mb-6 flex flex-col items-center shadow-lg rounded-xl overflow-hidden bg-white border border-slate-200 transition-all';
          pageWrapper.id = `pdf-page-${i}`;

          // Page header badge
          const badge = document.createElement('div');
          badge.className =
            'w-full bg-slate-100/90 border-b border-slate-200 px-4 py-1.5 text-[11px] font-bold text-slate-600 flex items-center justify-between';
          badge.innerHTML = `<span>الصفحة ${i} من ${numPages}</span><span class="text-slate-400 text-[10px]">ورقة الامتحان الأصلية</span>`;
          pageWrapper.appendChild(badge);

          const canvas = document.createElement('canvas');
          canvas.className = 'max-w-full block bg-white';
          pageWrapper.appendChild(canvas);

          container.appendChild(pageWrapper);

          await renderPageToCanvas(i, canvas);
        }
      } else {
        // Single Page Mode
        const pageWrapper = document.createElement('div');
        pageWrapper.className =
          'flex flex-col items-center shadow-lg rounded-xl overflow-hidden bg-white border border-slate-200 transition-all';
        pageWrapper.id = `pdf-page-${currentPage}`;

        const badge = document.createElement('div');
        badge.className =
          'w-full bg-slate-100/90 border-b border-slate-200 px-4 py-1.5 text-[11px] font-bold text-slate-600 flex items-center justify-between';
        badge.innerHTML = `<span>الصفحة ${currentPage} من ${numPages}</span><span class="text-slate-400 text-[10px]">ورقة الامتحان الأصلية</span>`;
        pageWrapper.appendChild(badge);

        const canvas = document.createElement('canvas');
        canvas.className = 'max-w-full block bg-white';
        pageWrapper.appendChild(canvas);

        container.appendChild(pageWrapper);

        await renderPageToCanvas(currentPage, canvas);
      }

      if (isMounted) setRenderingPages(false);
    };

    renderPages();

    return () => {
      isMounted = false;
    };
  }, [isOpen, numPages, currentPage, scale, rotation, viewMode, loading, renderPageToCanvas]);

  // Adjust zoom for mobile screen width on first load
  useEffect(() => {
    if (isOpen) {
      if (window.innerWidth < 640) {
        setScale(0.85);
      } else if (window.innerWidth < 1024) {
        setScale(1.1);
      } else {
        setScale(1.25);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      id="pdf-viewer-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700"
        id="pdf-viewer-container"
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
      >
        {/* Top Header */}
        <div className="bg-slate-950 text-white p-3 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-rose-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate" title={displayFileName}>
                {displayFileName}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                {numPages > 0 ? (
                  <span>
                    إجمالي الصفحات: <strong className="text-emerald-400">{numPages}</strong> صفحة
                  </span>
                ) : (
                  <span>جاري التحميل...</span>
                )}
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-emerald-300/80 font-medium">ملف PDF سحابي أصلي</span>
              </div>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Open in New Window */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              title="فتح الملف في علامة تبويب جديدة للمتصفح"
              id="pdf-btn-open-newtab"
            >
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">نافذة جديدة</span>
            </a>

            {/* Download Button */}
            <a
              href={downloadUrl}
              download={displayFileName}
              className="p-2 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="تحميل ملف الـ PDF الأصلي إلى جهازك"
              id="pdf-btn-download"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">تحميل PDF</span>
            </a>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700 hidden sm:flex"
              title="طباعة"
              id="pdf-btn-print"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition border border-slate-700 cursor-pointer"
              title="إغلاق العارض"
              id="pdf-btn-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Toolbar (Zoom, Rotation, Page navigation, Continuous/Single Mode) */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-300 select-none">
          {/* View Mode & Page Navigation */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('continuous')}
                className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'continuous'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="عرض جميع صفحات الامتحان متتالية واحدة تلو الأخرى"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>كافة الصفحات</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'single'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="عرض الامتحان صفحة بصفحة مع التنقل"
              >
                <span>صفحة واحدة</span>
              </button>
            </div>

            {/* Single Page Navigation Arrows */}
            {viewMode === 'single' && numPages > 1 && (
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="font-bold text-[11px] px-1 text-slate-200">
                  {currentPage} / {numPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= numPages}
                  onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Zoom & Rotation Controls */}
          <div className="flex items-center gap-1.5">
            {/* Zoom Out */}
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.2).toFixed(2))))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700 cursor-pointer"
              title="تصغير (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Label / Reset */}
            <button
              type="button"
              onClick={() => setScale(1.25)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-700 cursor-pointer"
              title="إعادة ضبط الحجم (100%)"
            >
              {Math.round((scale / 1.25) * 100)}%
            </button>

            {/* Zoom In */}
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(3.0, Number((s + 0.2).toFixed(2))))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700 cursor-pointer"
              title="تكبير (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Rotate */}
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700 cursor-pointer"
              title="تدوير الصفحة 90 درجة"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PDF Document Viewport Canvas Area */}
        <div className="flex-1 bg-slate-800/90 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start relative">
          {/* Loading State */}
          {loading && (
            <div className="my-auto flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
              <h4 className="font-bold text-base text-white mb-1">جاري فتح وقراءة ملف الامتحان (PDF)...</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                يتم استدعاء الملف السحابي وتحضير جميع صفحات الامتحان بدقة عالية للطباعة والقراءة.
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="my-auto max-w-lg bg-slate-900/95 border border-rose-500/40 rounded-2xl p-6 text-center shadow-xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white mb-2">تعذر عرض ملف الـ PDF عبر المحرك المدمج</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                {error}
              </p>

              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={loadPdfDocument}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة المحاولة</span>
                </button>

                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح في علامة تبويب جديدة</span>
                </a>

                <a
                  href={downloadUrl}
                  download={displayFileName}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الملف الأصلي</span>
                </a>
              </div>
            </div>
          )}

          {/* Rendering Progress Indicator */}
          {renderingPages && !loading && !error && (
            <div className="fixed bottom-6 bg-slate-950/90 text-white px-4 py-2 rounded-full border border-slate-700 shadow-xl flex items-center gap-2 text-xs font-bold animate-pulse z-20">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>جاري عرض صفحات الامتحان بدقة عالية...</span>
            </div>
          )}

          {/* Rendered Canvases Container */}
          <div
            ref={pagesContainerRef}
            className="w-full max-w-4xl flex flex-col items-center justify-center my-auto transition-all"
            id="pdf-rendered-pages"
          />
        </div>

        {/* Bottom Status / Tips Bar */}
        <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <span>
            💡 نصيحة: يمكنك تكبير الصفحة وتدويرها أو تنزيل نسخة الامتحان بصيغة PDF الأصلية في أي وقت.
          </span>
          <span className="text-emerald-400/90 font-bold">
            ✓ نظام عرض متوافق مع الهاتف والتابلت والكمبيوتر
          </span>
        </div>
      </div>
    </div>
  );
};
