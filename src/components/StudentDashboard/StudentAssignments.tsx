import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Assignment, AssignmentSubmission } from '../../types';
import {
  FileCheck2,
  Clock,
  Calendar,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Award,
  Send,
  X,
  FileText,
  Plus,
  Trash2,
  Download,
  Check,
} from 'lucide-react';

interface StudentAssignmentsProps {
  initialSolveId?: string | null;
  onClearInitialSolveId?: () => void;
}

export const StudentAssignments: React.FC<StudentAssignmentsProps> = ({
  initialSolveId,
  onClearInitialSolveId,
}) => {
  const {
    currentUser,
    assignments,
    submissions,
    subjects,
    submitAssignment,
    recordAssignmentOpen,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'graded'>('pending');

  // Solving Modal State
  const [solvingAssignment, setSolvingAssignment] = useState<Assignment | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [solutionImages, setSolutionImages] = useState<{ id: string; name: string; url: string }[]>([]);
  const [solutionFiles, setSolutionFiles] = useState<{ id: string; name: string; url: string; size?: string; type?: string }[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File & Image Inputs Refs (No camera, device storage only)
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // Global Fullscreen Image Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // View Graded Detail Modal
  const [viewingSubmission, setViewingSubmission] = useState<{
    sub: AssignmentSubmission;
    assign: Assignment;
  } | null>(null);

  // View Submitted (Pending grading) Detail Modal
  const [viewingPendingSubmission, setViewingPendingSubmission] = useState<{
    sub: AssignmentSubmission;
    assign: Assignment;
  } | null>(null);

  // Filter student assignments (only published ones matching student class/section)
  const studentAssignments = assignments.filter((a) => {
    if (!currentUser) return false;
    const matchesClass = !a.classId || a.classId === 'all' || a.classId === currentUser.classId;
    const matchesSection =
      !a.sectionId ||
      a.sectionId === 'all' ||
      a.sectionId === 'الكل' ||
      !currentUser.sectionId ||
      a.sectionId === currentUser.sectionId;
    const isPublished = a.status !== 'draft';
    return matchesClass && matchesSection && isPublished;
  });

  const mySubmissions = submissions.filter((s) => s.studentId === currentUser?.id);
  const mySubmissionMap = new Map<string, AssignmentSubmission>();
  mySubmissions.forEach((s) => mySubmissionMap.set(s.assignmentId, s));

  // If passed an initial solve assignment ID
  React.useEffect(() => {
    if (initialSolveId) {
      const assign = assignments.find((a) => a.id === initialSolveId);
      if (assign) {
        handleOpenSolve(assign);
      }
    }
  }, [initialSolveId, assignments]);

  const handleOpenSolve = (assign: Assignment) => {
    setSolvingAssignment(assign);
    setSubmitError(null);
    const existing = mySubmissionMap.get(assign.id);
    if (existing) {
      setSolutionText(existing.solutionText || '');
      if (Array.isArray(existing.solutionImages) && existing.solutionImages.length > 0) {
        setSolutionImages(existing.solutionImages);
      } else if (existing.solutionImageUrl) {
        setSolutionImages([{ id: 'img-legacy', name: 'ورقة الإجابة', url: existing.solutionImageUrl }]);
      } else {
        setSolutionImages([]);
      }
      if (Array.isArray(existing.solutionFiles)) {
        setSolutionFiles(existing.solutionFiles);
      } else {
        setSolutionFiles([]);
      }
    } else {
      setSolutionText('');
      setSolutionImages([]);
      setSolutionFiles([]);
    }
    // Record assignment open activity
    recordAssignmentOpen(assign.id);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // رفع صور الحل من معرض أو ملفات الجهاز (لا توجد كاميرا)
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSubmitError(null);
    const newImagesList: { id: string; name: string; url: string }[] = [];

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        newImagesList.push({
          id: `sol-img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url: result,
        });
        if (newImagesList.length === files.length) {
          setSolutionImages((prev) => [...prev, ...newImagesList]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  // رفع ملفات الحل (PDF, Word, etc.) من الجهاز
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSubmitError(null);
    const newFilesList: { id: string; name: string; url: string; size?: string; type?: string }[] = [];

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        newFilesList.push({
          id: `sol-file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url: result,
          size: formatFileSize(file.size),
          type: file.type,
        });
        if (newFilesList.length === files.length) {
          setSolutionFiles((prev) => [...prev, ...newFilesList]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (filesInputRef.current) filesInputRef.current.value = '';
  };

  const removeSolutionImage = (id: string) => {
    setSolutionImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeSolutionFile = (id: string) => {
    setSolutionFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // إرسال الحل مباشرة وحفظه سحابياً
  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solvingAssignment) return;

    if (!solutionText.trim() && solutionImages.length === 0 && solutionFiles.length === 0) {
      setSubmitError('يرجى كتابة نص الحل، أو رفع صورة للحل من معرض الجهاز، أو رفع ملف.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitAssignment(
        solvingAssignment.id,
        solutionText.trim(),
        solutionImages[0]?.url || undefined,
        solutionImages,
        solutionFiles
      );

      setIsSubmitting(false);
      setSolvingAssignment(null);
      if (onClearInitialSolveId) onClearInitialSolveId();
      setActiveTab('submitted');
      showToast('تم إرسال حل الواجب بنجاح وحفظه في النظام');
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err?.message || 'حدث خطأ أثناء إرسال الحل. يرجى المحاولة مرة أخرى.');
    }
  };

  // Group assignments into pending, submitted, and graded
  const pendingAssignments = studentAssignments.filter((a) => {
    const sub = mySubmissionMap.get(a.id);
    return !sub;
  });

  const submittedAssignments = studentAssignments.filter((a) => {
    const sub = mySubmissionMap.get(a.id);
    return sub && sub.status === 'submitted';
  });

  const gradedAssignments = studentAssignments.filter((a) => {
    const sub = mySubmissionMap.get(a.id);
    return sub && sub.status === 'graded';
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">واجباتي المدرسية</h2>
              <p className="text-xs text-slate-500">
                مشاهدة وصف الواجب، فتح الملفات والصور المرفقة من المعلم، ورفع صور وملفات الحل من الجهاز
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-lg">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-white text-amber-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>مطلوب حلها</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
            {pendingAssignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('submitted')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'submitted'
              ? 'bg-white text-emerald-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>تم الإرسال</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {submittedAssignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('graded')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'graded'
              ? 'bg-white text-blue-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>تم تصحيحها</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
            {gradedAssignments.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Pending Assignments */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pendingAssignments.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span className="font-bold text-slate-700 block">رائع! لا توجد واجبات معلقة للحل</span>
              <span>لقد قمت بإرسال كافة الواجبات المطلوبة.</span>
            </div>
          ) : (
            pendingAssignments.map((assign) => {
              const subj = subjects.find((s) => s.id === assign.subjectId);

              return (
                <div
                  key={assign.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {subj?.name || 'مادة دراسية'}
                      </span>
                      <span className="text-xs font-bold text-slate-600">الدرجة: {assign.maxScore || 100}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{assign.title}</h3>
                    
                    {/* وصف الواجب */}
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed mb-3 border border-slate-100 whitespace-pre-line">
                      {assign.description}
                    </div>

                    {/* أوراق العمل والصور المرفقة من المعلم */}
                    {((assign.images && assign.images.length > 0) || assign.referenceImageUrl) && (
                      <div className="mb-3 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
                        <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-amber-900">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                            <span>الصور وأوراق العمل المرفقة من المعلم:</span>
                          </span>
                          <span className="text-[10px] text-amber-700">
                            {assign.images && assign.images.length > 0 ? `${assign.images.length} صور` : 'صورة واحدة'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {(assign.images && assign.images.length > 0
                            ? assign.images
                            : [{ id: 'ref-1', name: 'ورقة عمل', url: assign.referenceImageUrl! }]
                          ).map((img, idx) => (
                            <button
                              key={img.id || idx}
                              type="button"
                              onClick={() => setPreviewImage(img.url)}
                              className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-amber-200 bg-white hover:opacity-90 transition-opacity cursor-pointer group"
                              title="انقر لتكبير الصورة"
                            >
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* الملفات المرفقة من المعلم */}
                    {assign.files && assign.files.length > 0 && (
                      <div className="mb-3 p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-1.5">
                        <div className="text-[11px] font-bold text-blue-950 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>الملفات المرفقة من المعلم ({assign.files.length}):</span>
                        </div>
                        <div className="space-y-1">
                          {assign.files.map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              download={file.name}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-2 rounded-lg bg-white border border-blue-100 hover:border-blue-300 text-xs transition-colors"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                                {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
                              </div>
                              <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1 shrink-0 mr-2">
                                <Download className="w-3 h-3" />
                                <span>فتح/تحميل</span>
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* مواعيد البدء والانتهاء */}
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs space-y-1">
                      {assign.startDate && (
                        <div className="flex items-center justify-between text-slate-600 font-medium">
                          <span>تاريخ ووقت البدء:</span>
                          <span className="font-sans text-slate-800">
                            {assign.startDate} {assign.startTime ? `الساعة ${assign.startTime}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-amber-950 font-semibold">
                        <span>تاريخ ووقت الانتهاء:</span>
                        <span className="font-bold flex items-center gap-1 text-rose-700 font-sans">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{assign.dueDate} الساعة {assign.dueTime}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenSolve(assign)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>حل الواجب ورفع الحل</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Submitted Assignments (تم الإرسال) */}
      {activeTab === 'submitted' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {submittedAssignments.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              لا توجد واجبات قيد انتظار التصحيح
            </div>
          ) : (
            submittedAssignments.map((assign) => {
              const sub = mySubmissionMap.get(assign.id)!;
              const subj = subjects.find((s) => s.id === assign.subjectId);
              const imgCount = sub.solutionImages?.length || (sub.solutionImageUrl ? 1 : 0);
              const fileCount = sub.solutionFiles?.length || 0;

              return (
                <div
                  key={assign.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {subj?.name || 'مادة دراسية'}
                      </span>
                      {/* تظهر حالة الواجب «تم الإرسال» */}
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>تم الإرسال</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-2">{assign.title}</h3>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5">
                      {sub.solutionText && (
                        <div>
                          <strong>نص الحل:</strong> {sub.solutionText}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        {imgCount > 0 && (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{imgCount} صور مرفقة</span>
                          </span>
                        )}
                        {fileCount > 0 && (
                          <span className="flex items-center gap-1 text-blue-700 font-semibold">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{fileCount} ملفات مرفقة</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                        تاريخ الإرسال: {new Date(sub.submittedAt).toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </div>

                  {/* لا يستطيع الطالب حذف إرسال الواجب بعد إرساله */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      بانتظار تصحيح ورصد الدرجة من المعلم
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewingPendingSubmission({ sub, assign })}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض الحل المسلّم</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Graded Assignments */}
      {activeTab === 'graded' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {gradedAssignments.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              لم يقم المعلم بتصحيح أي واجب حتى الآن
            </div>
          ) : (
            gradedAssignments.map((assign) => {
              const sub = mySubmissionMap.get(assign.id)!;
              const subj = subjects.find((s) => s.id === assign.subjectId);

              return (
                <div
                  key={assign.id}
                  className="bg-white rounded-2xl border border-emerald-200 shadow-2xs p-5 flex flex-col justify-between bg-linear-to-b from-white to-emerald-50/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {subj?.name}
                      </span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                        الدرجة: {sub.score} / {assign.maxScore || 100} ⭐
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-2">{assign.title}</h3>

                    {sub.teacherFeedback && (
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-slate-700 mt-2">
                        <strong className="text-emerald-950 block mb-1">ملاحظات المعلم:</strong>
                        <p className="leading-relaxed">{sub.teacherFeedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      تاريخ التصحيح: {sub.gradedAt ? new Date(sub.gradedAt).toLocaleDateString('ar-SA') : 'مؤخرًا'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewingSubmission({ sub, assign })}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض تفاصيل الإجابة</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal: Solve Assignment with Handwritten Photo & File Upload */}
      {solvingAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  حل وتسليم الواجب
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{solvingAssignment.title}</h3>
              </div>
              <button
                onClick={() => setSolvingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Assignment Description & Reference Files/Images Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3 mb-5">
              <div>
                <strong className="text-slate-900 block mb-1">وصف الواجب:</strong>
                <p className="leading-relaxed whitespace-pre-line text-slate-800">{solvingAssignment.description}</p>
              </div>

              {/* أوراق العمل والصور المرفقة من المعلم */}
              {((solvingAssignment.images && solvingAssignment.images.length > 0) || solvingAssignment.referenceImageUrl) && (
                <div className="pt-2 border-t border-slate-200/60">
                  <strong className="text-slate-900 block mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>الصور المرفقة من المعلم (انقر لتكبير الصورة):</span>
                  </strong>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(solvingAssignment.images && solvingAssignment.images.length > 0
                      ? solvingAssignment.images
                      : [{ id: 'ref-1', name: 'ورقة الواجب', url: solvingAssignment.referenceImageUrl! }]
                    ).map((img, idx) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setPreviewImage(img.url)}
                        className="relative rounded-xl border border-amber-200 overflow-hidden bg-white p-1 hover:shadow-md transition-all cursor-pointer text-right group"
                      >
                        <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-1">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 truncate block px-1">
                          صورة {idx + 1}: {img.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* الملفات المرفقة من المعلم */}
              {solvingAssignment.files && solvingAssignment.files.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60">
                  <strong className="text-slate-900 block mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>الملفات المرفقة من المعلم ({solvingAssignment.files.length}):</span>
                  </strong>
                  <div className="space-y-1.5">
                    {solvingAssignment.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        download={file.name}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                          {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1 shrink-0">
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل/فتح</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-rose-600 font-bold flex items-center gap-1 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>موعد الانتهاء: {solvingAssignment.dueDate} الساعة {solvingAssignment.dueTime}</span>
              </div>
            </div>

            {/* Error message */}
            {submitError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Solve Form */}
            <form onSubmit={handleSubmitSolution} className="space-y-4 text-xs">
              {/* حل الواجب على الورقة أو الدفتر ورفع صورة الحل من المعرض أو رفع ملف */}
              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/80">
                <p className="font-bold text-emerald-950 text-xs mb-1">
                  ✏️ حل الواجب على الورقة أو الدفتر:
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  قم بحل الواجب في كراستك أو دفترك، ثم التقط صور الحل وارفعها من معرض الصور، أو ارفع ملف الحل مباشرة. يمكنك رفع أكثر من صورة أو ملف عند الحاجة.
                </p>
              </div>

              {/* 1. رفع صورة للحل من معرض الجهاز (يمكن رفع أكثر من صورة) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>رفع صورة للحل من معرض الجهاز:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => imagesInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>اختيار صور من المعرض</span>
                  </button>
                </div>

                {/* Strictly file input from device gallery/files, NO camera */}
                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesUpload}
                  className="hidden"
                />

                {solutionImages.length === 0 ? (
                  <div
                    onClick={() => imagesInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
                  >
                    <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                    <span className="font-bold text-slate-800 text-xs">انقر لاختيار صور الحل من معرض الجهاز</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">يمكنك اختيار أكثر من صورة معاً من معرض الجهاز</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {solutionImages.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative group rounded-xl border border-emerald-200 bg-white p-1.5 shadow-2xs flex flex-col"
                      >
                        <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-1">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewImage(img.url)}
                              className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white cursor-pointer"
                              title="تكبير ومعاينة الصورة"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSolutionImage(img.id)}
                              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                              title="إزالة الصورة"
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
                )}
              </div>

              {/* 2. رفع ملف إذا أراد (يمكن رفع أكثر من ملف) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>رفع ملف للحل (اختياري - PDF أو مستند):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => filesInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة ملف من الجهاز</span>
                  </button>
                </div>

                <input
                  ref={filesInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  multiple
                  onChange={handleFilesUpload}
                  className="hidden"
                />

                {solutionFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {solutionFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 rounded-xl border border-blue-200 bg-blue-50/40 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                          {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSolutionFile(file.id)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="حذف الملف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. نص أو ملاحظات إضافية */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  إجابة أو ملاحظات نصية إضافية (اختياري):
                </label>
                <textarea
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  rows={2}
                  placeholder="اكتب أي ملاحظات أو توضيحات على الحل للمعلم..."
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden leading-relaxed"
                />
              </div>

              {/* زر «إرسال» */}
              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSolvingAssignment(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'جارٍ الإرسال والحفظ...' : 'إرسال'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Submitted Solution (Before Grading) */}
      {viewingPendingSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1 w-fit">
                  <Check className="w-3.5 h-3.5" />
                  <span>تم الإرسال</span>
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {viewingPendingSubmission.assign.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingPendingSubmission(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {viewingPendingSubmission.sub.solutionText && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="block font-bold text-slate-900 mb-1">النص المسلّم:</strong>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {viewingPendingSubmission.sub.solutionText}
                  </p>
                </div>
              )}

              {/* Solution Images */}
              {((viewingPendingSubmission.sub.solutionImages && viewingPendingSubmission.sub.solutionImages.length > 0) || viewingPendingSubmission.sub.solutionImageUrl) && (
                <div>
                  <strong className="block font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>صور الحل المسلّمة:</span>
                  </strong>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(viewingPendingSubmission.sub.solutionImages && viewingPendingSubmission.sub.solutionImages.length > 0
                      ? viewingPendingSubmission.sub.solutionImages
                      : [{ id: 'sub-legacy', name: 'ورقة الحل', url: viewingPendingSubmission.sub.solutionImageUrl! }]
                    ).map((img, idx) => (
                      <div
                        key={img.id || idx}
                        onClick={() => setPreviewImage(img.url)}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 p-1 cursor-pointer hover:shadow-md transition-all group"
                      >
                        <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-200 mb-1">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 truncate block px-1 text-center">
                          صورة {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solution Files */}
              {viewingPendingSubmission.sub.solutionFiles && viewingPendingSubmission.sub.solutionFiles.length > 0 && (
                <div>
                  <strong className="block font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>الملفات المسلّمة:</span>
                  </strong>
                  <div className="space-y-1.5">
                    {viewingPendingSubmission.sub.solutionFiles.map((f) => (
                      <a
                        key={f.id}
                        href={f.url}
                        download={f.name}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{f.name}</span>
                          {f.size && <span className="text-[10px] text-slate-400">({f.size})</span>}
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1 shrink-0 mr-2">
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingPendingSubmission(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Graded Detail */}
      {viewingSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  الدرجة المرصودة: {viewingSubmission.sub.score} / {viewingSubmission.assign.maxScore || 100} ⭐
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {viewingSubmission.assign.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingSubmission(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {viewingSubmission.sub.teacherFeedback && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                  <strong className="block font-bold mb-1 text-emerald-900 text-sm">
                    ملاحظات وتوجيهات المعلم:
                  </strong>
                  <p className="leading-relaxed">{viewingSubmission.sub.teacherFeedback}</p>
                </div>
              )}

              {viewingSubmission.sub.solutionText && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="block font-bold text-slate-900 mb-1">إجابتك المسلمة:</strong>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {viewingSubmission.sub.solutionText}
                  </p>
                </div>
              )}

              {/* Solution Images */}
              {((viewingSubmission.sub.solutionImages && viewingSubmission.sub.solutionImages.length > 0) || viewingSubmission.sub.solutionImageUrl) && (
                <div>
                  <strong className="block font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>صور أوراق الإجابة المسلّمة:</span>
                  </strong>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(viewingSubmission.sub.solutionImages && viewingSubmission.sub.solutionImages.length > 0
                      ? viewingSubmission.sub.solutionImages
                      : [{ id: 'sub-legacy', name: 'ورقة الإجابة', url: viewingSubmission.sub.solutionImageUrl! }]
                    ).map((img, idx) => (
                      <div
                        key={img.id || idx}
                        onClick={() => setPreviewImage(img.url)}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 p-1 cursor-pointer hover:shadow-md transition-all group"
                      >
                        <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-200 mb-1">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 truncate block px-1 text-center">
                          ورقة {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solution Files */}
              {viewingSubmission.sub.solutionFiles && viewingSubmission.sub.solutionFiles.length > 0 && (
                <div>
                  <strong className="block font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>الملفات المسلّمة:</span>
                  </strong>
                  <div className="space-y-1.5">
                    {viewingSubmission.sub.solutionFiles.map((f) => (
                      <a
                        key={f.id}
                        href={f.url}
                        download={f.name}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{f.name}</span>
                          {f.size && <span className="text-[10px] text-slate-400">({f.size})</span>}
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1 shrink-0 mr-2">
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingSubmission(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="معاينة الصورة"
              className="max-h-[85vh] max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
