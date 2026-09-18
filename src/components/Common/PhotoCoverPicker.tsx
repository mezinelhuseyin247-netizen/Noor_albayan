import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Trash2, RefreshCw, Check, X, Sparkles, Upload, Smartphone, Laptop } from 'lucide-react';

interface PhotoCoverPickerProps {
  type: 'avatar' | 'cover';
  currentValue?: string;
  onSave: (base64Url: string | undefined) => void;
  onCancel?: () => void;
  title?: string;
}

// Preset cover artistic backgrounds
export const COVER_PRESETS = [
  { id: 'preset-1', name: 'زمردي نور البيان', value: 'linear-gradient(135deg, #064e3b 0%, #0d9488 50%, #10b981 100%)' },
  { id: 'preset-2', name: 'أزرق سماوي ملكي', value: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%)' },
  { id: 'preset-3', name: 'ذهبي أصيل', value: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #f59e0b 100%)' },
  { id: 'preset-4', name: 'بنفسجي علم ومعرفة', value: 'linear-gradient(135deg, #3b0764 0%, #6b21a8 50%, #a855f7 100%)' },
  { id: 'preset-5', name: 'وردي ياقوتي', value: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #fb7185 100%)' },
  { id: 'preset-6', name: 'كحلي ليلي أنيق', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' },
];

// Helper to compress image into lightweight base64 for persistent cloud/DB storage
export function compressImageFile(file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const PhotoCoverPicker: React.FC<PhotoCoverPickerProps> = ({
  type,
  currentValue,
  onSave,
  onCancel,
  title,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');
  const [previewImage, setPreviewImage] = useState<string | undefined>(currentValue);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const maxDim = type === 'cover' ? 1200 : 700;
      const compressed = await compressImageFile(file, maxDim, maxDim, 0.88);
      setPreviewImage(compressed);
    } catch (err) {
      console.error('Failed to load image file:', err);
      setErrorMessage('حدث خطأ أثناء معالجة الصورة. يرجى اختيار صورة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApply = () => {
    onSave(previewImage);
  };

  const handleRemove = () => {
    setPreviewImage(undefined);
    onSave(undefined);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-200 w-full max-w-lg mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {title || (type === 'avatar' ? 'تعديل الصورة الشخصية' : 'تعديل صورة الغلاف')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {type === 'avatar'
              ? 'اختر صورة من معرض الصور وملفات جهازك (هاتف، حاسوب، تابلت)'
              : 'اختر صورة من جهازك أو اختر من الخلفيات الجاهزة'}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs for Cover (Upload vs Presets) */}
      {type === 'cover' && (
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>من ملفات الجهاز والمعرض</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'presets'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>خلفيات جاهزة</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Presets View (Cover only) */}
      {type === 'cover' && activeTab === 'presets' ? (
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
            {COVER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setPreviewImage(preset.value)}
                className={`h-16 rounded-xl relative p-2 text-right flex flex-col justify-end transition border-2 ${
                  previewImage === preset.value
                    ? 'border-emerald-600 scale-[1.02] shadow-md ring-2 ring-emerald-400/50'
                    : 'border-transparent hover:scale-95'
                }`}
                style={{ background: preset.value }}
              >
                <span className="text-[11px] font-bold text-white drop-shadow-md">
                  {preset.name}
                </span>
                {previewImage === preset.value && (
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-white text-emerald-700 rounded-full flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Preview banner for presets */}
          {previewImage && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1.5">معاينة الغلاف المحدد:</p>
              <div
                className="w-full h-24 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-xs"
                style={{ background: previewImage }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Upload from device/gallery View */
        <div className="mb-4">
          {/* Hidden File Input - accept images only, no capture attribute */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            onChange={handleFileUpload}
          />

          {previewImage ? (
            <div className="flex flex-col items-center">
              {type === 'avatar' ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500 shadow-md bg-slate-100 flex items-center justify-center">
                    <img
                      src={previewImage}
                      alt="معاينة الصورة الشخصية"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">معاينة الصورة قبل الحفظ</span>
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full h-32 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md relative">
                    {previewImage.startsWith('linear-gradient') ? (
                      <div className="w-full h-full" style={{ background: previewImage }} />
                    ) : (
                      <img
                        src={previewImage}
                        alt="معاينة الغلاف"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <span className="block text-center text-xs text-slate-500 font-medium mt-1">
                    معاينة الغلاف قبل الحفظ
                  </span>
                </div>
              )}

              {/* Actions for current preview */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1.5 border border-emerald-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تغيير واختيار صورة أخرى</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(undefined)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1.5 border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إزالة الصورة</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State: Dropzone / Click to choose */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]'
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 bg-slate-50/50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <Upload className="w-7 h-7" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {isProcessing ? 'جارٍ معالجة الصورة...' : 'انقر لاختيار صورة من جهازك'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  أو اسحب ملف الصورة وأفلته هنا مباشرة
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-200 w-full">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-emerald-600" />
                  <span>معرض الهاتف والتابلت</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Laptop className="w-3 h-3 text-emerald-600" />
                  <span>ملفات الحاسوب</span>
                </span>
                <span>•</span>
                <span>JPG, PNG, WebP</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          {currentValue && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف نهائي</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              إلغاء
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            disabled={isProcessing}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>حفظ وتطبيق</span>
          </button>
        </div>
      </div>
    </div>
  );
};
