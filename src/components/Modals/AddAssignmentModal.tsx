import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  Calendar,
  Clock,
  Image as ImageIcon,
  FileText,
  Plus,
  Trash2,
  Eye,
  X,
  Upload,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({ isOpen, onClose }) => {
  const { classes, subjects, createAssignment, addAssignment, showToast } = useApp();

  // 1. وصف الواجب
  const [description, setDescription] = useState('');

  // 2. إضافة صورة أو ملف للواجب
  const [images, setImages] = useState<{ id: string; name: string; url: string }[]>([]);
  const [files, setFiles] = useState<{ id: string; name: string; url: string; size?: string; type?: string }[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. تاريخ ووقت بدء الواجب
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');

  // 4. تاريخ ووقت انتهاء الواجب
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [dueTime, setDueTime] = useState('20:00');

  // الطلاب المحددين (الصف المستهدف والشعبة)
  const [classId, setClassId] = useState<string>('all');
  const [sectionId, setSectionId] = useState<string>('all');

  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentClass = classes.find((c) => c.id === classId);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // رفع الصور أو الملفات من ملفات أو استوديو الجهاز
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setErrorMessage('');
    const newImages: { id: string; name: string; url: string }[] = [];
    const newFiles: { id: string; name: string; url: string; size?: string; type?: string }[] = [];

    Array.from(selectedFiles).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        if (file.type.startsWith('image/')) {
          newImages.push({
            id: fileId,
            name: file.name,
            url: result,
          });
        } else {
          newFiles.push({
            id: fileId,
            name: file.name,
            url: result,
            size: formatFileSize(file.size),
            type: file.type,
          });
        }

        if (newImages.length + newFiles.length === selectedFiles.length) {
          if (newImages.length > 0) setImages((prev) => [...prev, ...newImages]);
          if (newFiles.length > 0) setFiles((prev) => [...prev, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // نشر الواجب مباشرة عند الضغط على الزر بدون نافذة تأكيد
  const handleDirectPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim() && images.length === 0 && files.length === 0) {
      setErrorMessage('يرجى كتابة وصف الواجب أو إرفاق صورة/ملف للواجب');
      return;
    }

    if (!dueDate || !dueTime) {
      setErrorMessage('يرجى تحديد تاريخ ووقت انتهاء الواجب');
      return;
    }

    setIsPublishing(true);

    try {
      // اشتقاق عنوان تلقائي واضح ومختصر من بداية الوصف
      const cleanDesc = description.trim();
      const derivedTitle = cleanDesc.length > 0
        ? cleanDesc.split('\n')[0].substring(0, 60).trim()
        : 'واجب دراسي منزلي';

      const defaultSubjectId = subjects[0]?.id || 'subj-noor';

      const publishFn = createAssignment || addAssignment;
      const result = await publishFn({
        title: derivedTitle,
        description: cleanDesc || 'يرجى الاطلاع على الصور والملفات المرفقة للواجب وحلها في الكراسة.',
        subjectId: defaultSubjectId,
        classId: classId || 'all',
        sectionId: sectionId === 'all' ? undefined : sectionId,
        startDate: startDate || undefined,
        startTime: startTime || undefined,
        dueDate,
        dueTime,
        maxScore: 100,
        images: images,
        files: files,
        referenceImageUrl: images[0]?.url || undefined,
        status: 'published',
      });

      if (result && result.success === false) {
        setErrorMessage(result.error || 'تعذر نشر الواجب سحابياً. يرجى المحاولة ثانية.');
        setIsPublishing(false);
        return;
      }

      showToast('تم نشر الواجب بنجاح للطلاب المحددين');
      // تفريغ الحقول وإغلاق النافذة
      setDescription('');
      setImages([]);
      setFiles([]);
      setIsPublishing(false);
      onClose();
    } catch (err: any) {
      console.error('Error publishing assignment:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء نشر الواجب');
      setIsPublishing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">نشر الواجب</h3>
              <p className="text-[11px] text-slate-500">نشر الواجب وحفظه سحابياً للطلاب المحددين مباشرة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleDirectPublish} className="space-y-4 text-xs">
          {/* 1. وصف الواجب */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-xs">
              1. وصف الواجب <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نص الواجب، الأسئلة المطلوبة، أو أرقام الصفحات والتمارين المراد حلها..."
              className="w-full px-3.5 py-2.5 border rounded-xl border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden leading-relaxed text-slate-800 font-medium text-xs resize-none"
              disabled={isPublishing}
              required={images.length === 0 && files.length === 0}
            />
          </div>

          {/* 2. إضافة صورة أو ملف للواجب (من استوديو أو ملفات الجهاز) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>2. إضافة صورة أو ملف للواجب</span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPublishing}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>اختيار من الجهاز</span>
              </button>
            </div>

            {/* Input file - Only from device storage/gallery, NO camera */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {images.length === 0 && files.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white rounded-xl p-4 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-7 h-7 text-amber-500 mx-auto mb-1.5 opacity-80" />
                <p className="font-semibold text-slate-700 text-xs">
                  انقر لاختيار صور ورقة العمل أو ملفات الواجب من الجهاز
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  من معرض الصور أو ملفات الجهاز (صور JPG/PNG أو ملفات PDF/Word)
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Images Preview Grid */}
                {images.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                      <span>الصور المرفقة ({images.length}):</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {images.map((img, idx) => (
                        <div
                          key={img.id}
                          className="relative group rounded-xl border border-slate-200 bg-white p-1 shadow-2xs flex flex-col"
                        >
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-1">
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewImage(img.url)}
                                className="p-1 rounded-md bg-white/90 text-slate-800 hover:bg-white cursor-pointer"
                                title="تكبير ومعاينة الصورة"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(img.id)}
                                className="p-1 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-600 truncate px-1" title={img.name}>
                            صورة {idx + 1}: {img.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files Preview List */}
                {files.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>الملفات المرفقة ({files.length}):</span>
                    </div>
                    <div className="space-y-1.5">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate" title={file.name}>
                              {file.name}
                            </span>
                            {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="حذف الملف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. تاريخ ووقت بدء الواجب */}
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-2">
            <label className="block font-bold text-amber-950 text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>3. تاريخ ووقت بدء الواجب</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="block text-[10px] font-semibold text-slate-600 mb-1">تاريخ البدء</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isPublishing}
                  className="w-full px-2.5 py-1.5 border rounded-lg border-slate-300 bg-white outline-hidden text-slate-800 font-medium"
                />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-600 mb-1">وقت البدء</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isPublishing}
                  className="w-full px-2.5 py-1.5 border rounded-lg border-slate-300 bg-white outline-hidden text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* 4. تاريخ ووقت انتهاء الواجب */}
          <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/60 space-y-2">
            <label className="block font-bold text-rose-950 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-700" />
              <span>4. تاريخ ووقت انتهاء الواجب <span className="text-red-500">*</span></span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="block text-[10px] font-semibold text-slate-600 mb-1">تاريخ الانتهاء</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isPublishing}
                  className="w-full px-2.5 py-1.5 border rounded-lg border-slate-300 bg-white outline-hidden font-bold text-slate-800"
                  required
                />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-600 mb-1">وقت الانتهاء</span>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  disabled={isPublishing}
                  className="w-full px-2.5 py-1.5 border rounded-lg border-slate-300 bg-white outline-hidden font-bold text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* الطلاب المحددين: الصف والشعبة */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>الصف المستهدف</span>
              </label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId('all');
                }}
                disabled={isPublishing}
                className="w-full px-2.5 py-1.5 border rounded-xl border-slate-300 bg-white outline-hidden font-medium text-slate-800"
              >
                <option value="all">جميع الصفوف (نشر عام)</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الشعبة</label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={isPublishing || classId === 'all'}
                className="w-full px-2.5 py-1.5 border rounded-xl border-slate-300 bg-white outline-hidden font-medium text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="all">جميع الشُعب</option>
                {currentClass?.sections?.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* زر «نشر الواجب» - يعمل مباشرة بدون نافذة تأكيد */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPublishing}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ النشر والحفظ...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>نشر الواجب</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/85 z-60 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] flex flex-col items-center">
            <img
              src={previewImage}
              alt="معاينة الصورة"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-white"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="mt-3 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق المعاينة ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
