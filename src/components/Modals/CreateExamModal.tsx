import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  AlertCircle,
  Calendar,
  Clock,
  BookOpen,
  Building2,
  Award,
  Layers,
  HelpCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Exam } from '../../types';
import { PdfViewerModal } from './PdfViewerModal';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExam?: Exam | null;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  onClose,
  initialExam,
}) => {
  const { classes, subjects, createExam, updateExam, showToast } = useApp();

  const isEditing = !!initialExam;

  // Form states
  const [title, setTitle] = useState(initialExam?.title || '');
  const [classId, setClassId] = useState(initialExam?.classId || (classes[0]?.id ?? 'all'));
  const [sectionId, setSectionId] = useState(initialExam?.sectionId || 'الكل');
  const [subjectId, setSubjectId] = useState(initialExam?.subjectId || (subjects[0]?.id ?? 'subj-noor'));
  const [date, setDate] = useState(
    initialExam?.date || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(initialExam?.startTime || '09:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialExam?.durationMinutes || 60
  );
  const [maxScore, setMaxScore] = useState<number>(initialExam?.maxScore || 100);
  const [instructions, setInstructions] = useState(initialExam?.instructions || '');

  // Files
  const [pdfFile, setPdfFile] = useState<Exam['pdfFile'] | undefined>(initialExam?.pdfFile);
  const [images, setImages] = useState<{ id: string; name: string; url: string }[]>(
    initialExam?.images || []
  );

  // File preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentClass = classes.find((c) => c.id === classId);
  const availableSections = currentClass?.sections || [];
  const filteredSubjects = subjects.filter((s) => !s.classId || s.classId === classId);

  // Handle PDF Upload with direct Cloud Storage persistence
  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('يرجى اختيار ملف بصيغة PDF فقط');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('حجم ملف الـ PDF يجب ألا يتجاوز 50 ميجابايت');
      return;
    }

    setError('');
    setIsUploadingPdf(true);

    try {
      // Read original binary file
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload directly to server cloud storage
      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileData: base64,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل حفظ ملف الـ PDF في التخزين السحابي');
      }

      setPdfFile({
        name: data.name || file.name,
        url: data.url, // Permanent cloud stream url /api/files/...
        size: data.size || `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    } catch (err: any) {
      console.error('Error uploading PDF:', err);
      setError(err?.message || 'تعذر حفظ ملف الـ PDF في التخزين السحابي');
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // Handle Multiple Exam Images Upload (From Device Gallery/Files)
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    const newImagesList: { id: string; name: string; url: string }[] = [];

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        newImagesList.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          url: result,
        });
        if (newImagesList.length === files.length) {
          setImages((prev) => [...prev, ...newImagesList]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('يرجى كتابة اسم الامتحان');
      return;
    }

    if (!date) {
      setError('يرجى تحديد تاريخ الامتحان');
      return;
    }

    if (!startTime) {
      setError('يرجى تحديد وقت بدء الامتحان');
      return;
    }

    if (!pdfFile && images.length === 0 && !instructions.trim()) {
      setError('يرجى إرفاق ملف أسئلة الامتحان (PDF) أو صور الأسئلة، أو كتابة نص الأسئلة في حقل التعليمات والأسئلة');
      return;
    }

    setIsSubmitting(true);

    try {
      const examPayload = {
        title: title.trim(),
        classId: classId || 'all',
        sectionId: sectionId || 'الكل',
        subjectId: subjectId || 'subj-noor',
        date,
        startTime,
        durationMinutes: Number(durationMinutes) || 60,
        maxScore: Number(maxScore) || 100,
        instructions: instructions.trim(),
        pdfFile,
        images,
        status: 'published' as const,
      };

      let result;
      if (isEditing && initialExam) {
        result = await updateExam(initialExam.id, examPayload);
      } else {
        result = await createExam(examPayload);
      }

      if (result && result.success === false) {
        setError(result.error || 'حدث خطأ أثناء نشر الامتحان وحفظه سحابياً');
        setIsSubmitting(false);
        return;
      }

      // Direct, immediate publish success with short message: «تم النشر بنجاح»
      showToast('تم النشر بنجاح');
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء حفظ ونشر الامتحان');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 backdrop-blur-sm border border-white/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                {isEditing ? 'تعديل بيانات الامتحان' : 'إنشاء امتحان جديد للطلاب'}
              </h2>
              <p className="text-emerald-100/80 text-xs">
                إضافة أسئلة الامتحان، الملفات المرفقة، وتحديد الصف والشعبة المستهدفة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Exam Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم الامتحان *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              placeholder="مثال: الاختبار الفصلي الأول لمادة لغتي الخالدة"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden text-slate-800 text-sm font-medium"
              required
            />
          </div>

          {/* 2. Target Class & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الصف الدراسي المستهدف *
              </label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId('الكل');
                }}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              >
                <option value="all">جميع الصفوف الدراسية (نشر عام)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.stage})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الشعبة المستهدفة *
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              >
                <option value="الكل">جميع شُعب الصف (نشر عام)</option>
                {availableSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec} فقط
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المادة الدراسية *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              >
                {subjects.length > 0 ? (
                  subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="subj-noor">نور البيان في تعليم القراءة</option>
                    <option value="subj-arabic">اللغة العربية</option>
                    <option value="subj-quran">القرآن الكريم والتجويد</option>
                    <option value="subj-islamic">التربية الإسلامية</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 3. Timing and Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاريخ الامتحان *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                وقت البدء *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المدة (دقيقة)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الدرجة القصوى
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden text-center text-emerald-800"
                />
              </div>
            </div>
          </div>

          {/* 4. Instructions / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              تعليمات وتوجيهات الامتحان للطلاب
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="مثال: يرجى كتابة الإجابات بخط واضح على ورقة خارجية، ثم تصوير صفحات الحل ورفعها من ألبوم الصور قبل انتهاء الوقت..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* 5. PDF Upload Area */}
          <div className="p-3.5 border border-emerald-200 bg-emerald-50/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                ملف أسئلة الامتحان (PDF):
              </span>
              {pdfFile && (
                <button
                  type="button"
                  onClick={() => setPdfFile(undefined)}
                  className="text-rose-600 hover:text-rose-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  حذف الملف
                </button>
              )}
            </div>

            {isUploadingPdf ? (
              <div className="flex items-center gap-2.5 p-3 bg-white border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                <span>جاري رفع وحفظ ملف الـ PDF في التخزين السحابي الأصلي...</span>
              </div>
            ) : pdfFile ? (
              <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-300 rounded-xl">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs shrink-0">
                    PDF
                  </div>
                  <div className="truncate text-right">
                    <p className="font-bold text-xs text-slate-800 truncate">{pdfFile.name}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-slate-500">{pdfFile.size || 'ملف PDF'}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        ✓ محفوظ سحابياً
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPdfPreview(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    id="btn-modal-preview-pdf"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>فتح وعرض PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    تغيير
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handlePdfChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50/70 transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>انقر لاختيار ورفع ملف أسئلة الامتحان (PDF)</span>
                </button>
                <p className="text-[10px] text-slate-500 mt-1 text-center">
                  يمكن للطلاب فتح وقراءة وتحميل ملف الـ PDF مباشرة داخل التطبيق
                </p>
              </div>
            )}
          </div>

          {/* 6. Multiple Images Upload Area */}
          <div className="p-3.5 border border-slate-200 bg-slate-50 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-600" />
                صور ورقة الامتحان (يمكن رفع أكثر من صورة من الجهاز):
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {images.length} صورة مرفقة
              </span>
            </div>

            <input
              type="file"
              ref={imagesInputRef}
              onChange={handleImagesChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <button
              type="button"
              onClick={() => imagesInputRef.current?.click()}
              className="w-full py-2.5 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl bg-white text-slate-700 hover:bg-slate-100/80 transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>+ رفع صور لورقة الامتحان من ملفات الجهاز (اختيار متعدد)</span>
            </button>

            {/* Thumbnail Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden border border-slate-300 bg-white aspect-4/3"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreviewImage(img.url)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(img.url)}
                        className="p-1 rounded-md bg-white/90 text-slate-900 hover:bg-white transition cursor-pointer"
                        title="معاينة الصورة"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              id="publish-exam-btn"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-50 text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'حفظ ونشر التعديلات' : 'نشر الامتحان'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="معاينة ورقة الامتحان"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -left-3 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* High-fidelity Multi-page PDF Viewer Modal */}
      {showPdfPreview && pdfFile && (
        <PdfViewerModal
          isOpen={showPdfPreview}
          onClose={() => setShowPdfPreview(false)}
          title={pdfFile.name}
          pdfUrl={pdfFile.url}
          fileName={pdfFile.name}
        />
      )}
    </div>
  );
};
