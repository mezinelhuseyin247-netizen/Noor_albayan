import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Assignment, AssignmentSubmission } from '../../types';
import {
  FileCheck2,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Check,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  ZoomIn,
  MessageSquare,
  Award,
  Users,
  ExternalLink as LinkIcon,
  UserCheck,
  Download,
  FileText,
} from 'lucide-react';

interface AssignmentsTeacherProps {
  onOpenAddAssignment: () => void;
  selectedSubmissionId?: string | null;
  onClearSelectedSubmission?: () => void;
}

export const AssignmentsTeacher: React.FC<AssignmentsTeacherProps> = ({
  onOpenAddAssignment,
  selectedSubmissionId,
  onClearSelectedSubmission,
}) => {
  const {
    assignments,
    submissions,
    classes,
    subjects,
    students,
    gradeSubmission,
    deleteAssignment,
    publishAssignment,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>('assignments');
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState<string>('all');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<'all' | 'submitted' | 'graded'>('all');

  // Track Student Engagement Roster Modal
  const [viewingRosterAssignment, setViewingRosterAssignment] = useState<Assignment | null>(null);

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(() => {
    if (selectedSubmissionId) {
      return submissions.find((s) => s.id === selectedSubmissionId) || null;
    }
    return null;
  });

  const [gradeScore, setGradeScore] = useState<number>(100);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sync if prop changed
  React.useEffect(() => {
    if (selectedSubmissionId) {
      const sub = submissions.find((s) => s.id === selectedSubmissionId);
      if (sub) {
        setGradingSubmission(sub);
        setGradeScore(sub.score || 100);
        setGradeFeedback(sub.teacherFeedback || '');
      }
    }
  }, [selectedSubmissionId, submissions]);

  const handleOpenGradingModal = (sub: AssignmentSubmission) => {
    setGradingSubmission(sub);
    setGradeScore(sub.score !== undefined ? sub.score : 100);
    setGradeFeedback(sub.teacherFeedback || 'حل ممتاز ومتقن! بارك الله في جهودك.');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    gradeSubmission(gradingSubmission.id, Number(gradeScore), gradeFeedback.trim());
    setGradingSubmission(null);
    if (onClearSelectedSubmission) onClearSelectedSubmission();
    showToast('تم حفظ الدرجة وإرسال النتيجة والملاحظات إلى حساب الطالب بنجاح');
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchAssign = selectedAssignmentFilter === 'all' || sub.assignmentId === selectedAssignmentFilter;
    const matchStatus = submissionStatusFilter === 'all' || sub.status === submissionStatusFilter;
    return matchAssign && matchStatus;
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
              <h2 className="text-lg font-bold text-slate-900">الواجبات والتصحيح الإلكتروني</h2>
              <p className="text-xs text-slate-500">
                إنشاء الواجبات المنزلية، متابعة تسليمات الطلاب، فحص الصور والحلول، ورصد الدرجات من 100
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddAssignment}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إنشاء واجب جديد</span>
          </button>
        </div>
      </div>

      {/* Main Tabs (الواجبات المنشورة vs تسليمات الطلاب والتصحيح) */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'assignments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>الواجبات المنشورة ({assignments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'submissions' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>استوديو التصحيح ({submissions.length})</span>
          {submissions.filter((s) => s.status === 'submitted').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* View 1: Published Assignments */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              لم يتم إنشاء أي واجبات حتى الآن. اضغط "+ إنشاء واجب جديد" للبدء.
            </div>
          ) : (
            assignments.map((assign) => {
              const subj = subjects.find((s) => s.id === assign.subjectId);
              const cls = classes.find((c) => c.id === assign.classId);
              const assignSubs = submissions.filter((s) => s.assignmentId === assign.id);
              const pendingCount = assignSubs.filter((s) => s.status === 'submitted').length;
              const openedCount = assign.openedBy?.length || 0;

              // Calculate total target students for this assignment
              const targetStudents = students.filter((s) => {
                const matchClass = !assign.classId || s.classId === assign.classId;
                const matchSec = !assign.sectionId || s.sectionId === assign.sectionId;
                return matchClass && matchSec;
              });

              return (
                <div
                  key={assign.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {subj?.name || 'مقرر'}
                        </span>
                        {assign.status === 'draft' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                            مسودة
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            منشور
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        الدرجة القصوى: {assign.maxScore}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">{assign.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {assign.description}
                    </p>

                    {/* External Link badge if exists */}
                    {assign.externalLink && (
                      <div className="mb-3 p-2 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
                        <span className="font-semibold truncate">🔗 {assign.externalLinkTitle || 'رابط خارجي للواجب'}</span>
                        <a
                          href={assign.externalLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 shrink-0 cursor-pointer"
                        >
                          فتح الرابط
                        </a>
                      </div>
                    )}

                    {/* Attached Images */}
                    {assign.images && assign.images.length > 0 && (
                      <div className="mb-3 p-2 bg-amber-50/60 rounded-xl border border-amber-200/80">
                        <div className="text-[11px] font-bold text-amber-900 mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                          <span>الصور المرفقة ({assign.images.length}):</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {assign.images.map((img) => (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setPreviewImage(img.url)}
                              className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-amber-200 bg-white hover:opacity-80 transition-opacity cursor-pointer"
                              title="تكبير الصورة"
                            >
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attached Files */}
                    {assign.files && assign.files.length > 0 && (
                      <div className="mb-3 p-2 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-1">
                        <div className="text-[11px] font-bold text-blue-950 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>الملفات المرفقة ({assign.files.length}):</span>
                        </div>
                        {assign.files.map((file) => (
                          <a
                            key={file.id}
                            href={file.url}
                            download={file.name}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-blue-100 text-[11px] hover:border-blue-300 transition-colors"
                          >
                            <span className="truncate font-semibold text-slate-700">{file.name}</span>
                            <Download className="w-3 h-3 text-blue-600 shrink-0 mr-1" />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">الصف والشعبة:</span>
                        <span className="font-bold text-slate-800">
                          {cls?.name} {assign.sectionId ? `(${assign.sectionId})` : '(جميع الشعب)'}
                        </span>
                      </div>

                      {assign.startDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">تاريخ الإتاحة / البدء:</span>
                          <span className="font-medium text-slate-700 font-sans">
                            {assign.startDate} {assign.startTime ? `الساعة ${assign.startTime}` : ''}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">موعد الإغلاق والتسليم:</span>
                        <span className="font-bold text-rose-600 flex items-center gap-1 font-sans">
                          <Clock className="w-3 h-3" />
                          <span>{assign.dueDate} الساعة {assign.dueTime}</span>
                        </span>
                      </div>
                    </div>

                    {/* Student Engagement Mini Tracker */}
                    <div className="mt-3 p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span title="عدد الطلاب الذين فتحوا الواجب" className="flex items-center gap-1 text-slate-700 font-bold">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>فتح: {openedCount}/{targetStudents.length}</span>
                        </span>
                        <span title="عدد الطلاب الذين سلموا الواجب" className="flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>سلّم: {assignSubs.length}/{targetStudents.length}</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingRosterAssignment(assign)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3 h-3" />
                        <span>كشف الطلاب</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      <span>التسليمات: <strong>{assignSubs.length}</strong></span>
                      {pendingCount > 0 && (
                        <span className="text-amber-600 font-bold mr-2">({pendingCount} بانتظار التصحيح)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {assign.status === 'draft' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await publishAssignment(assign.id);
                            showToast('تم النشر بنجاح');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          title="نشر الواجب فوراً للطلاب المحددين"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>نشر الواجب</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAssignmentFilter(assign.id);
                          setActiveTab('submissions');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>تصحيح الحلول</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('هل تريد حذف هذا الواجب وجميع التسليمات المرتبطة به؟')) {
                            deleteAssignment(assign.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="حذف الواجب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View 2: Submissions & Grading Studio */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Submissions Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedAssignmentFilter}
                onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-bold outline-hidden"
              >
                <option value="all">جميع الواجبات ({submissions.length} تسليم)</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setSubmissionStatusFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                  submissionStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                الكل ({submissions.length})
              </button>
              <button
                onClick={() => setSubmissionStatusFilter('submitted')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                  submissionStatusFilter === 'submitted'
                    ? 'bg-white text-amber-800 shadow-2xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                بانتظار التصحيح ({submissions.filter((s) => s.status === 'submitted').length})
              </button>
              <button
                onClick={() => setSubmissionStatusFilter('graded')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                  submissionStatusFilter === 'graded'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                تم التصحيح ({submissions.filter((s) => s.status === 'graded').length})
              </button>
            </div>
          </div>

          {/* Submissions Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {filteredSubmissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                لا توجد تسليمات متوافقة مع الفلاتر المحددة حاليًا
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => {
                  const assign = assignments.find((a) => a.id === sub.assignmentId);
                  const isPending = sub.status === 'submitted';

                  return (
                    <div
                      key={sub.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {sub.studentName.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{sub.studentName}</span>
                            {isPending ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                بانتظار تصحيح المعلم
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <Award className="w-3 h-3 text-emerald-600" />
                                <span>الدرجة: {sub.score} / 100</span>
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-semibold text-slate-700 mt-1">
                            الواجب: {assign?.title || 'واجب دراسي'}
                          </div>

                          {/* Student Text Solution Snippet */}
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <strong>إجابة الطالب:</strong> {sub.solutionText}
                          </p>

                          <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                            <span>تاريخ التسليم: {new Date(sub.submittedAt).toLocaleString('ar-SA')}</span>
                            {sub.solutionImageUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(sub.solutionImageUrl!)}
                                className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>عرض صورة الحل المرفقة</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Grade Button */}
                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenGradingModal(sub)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isPending
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <Sliders className="w-4 h-4" />
                          <span>{isPending ? 'تصحيح ورصد الدرجة' : 'تعديل الدرجة والملاحظات'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Full Grading Studio & Image Lightbox */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  تصحيح ورصد درجة الطالب: {gradingSubmission.studentName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setGradingSubmission(null);
                  if (onClearSelectedSubmission) onClearSelectedSubmission();
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Student's Submission Content */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-1">نص إجابة الطالب:</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {gradingSubmission.solutionText || 'لا توجد إجابة نصية.'}
                </p>
              </div>

              {/* Uploaded Handwritten Solution Images */}
              {((gradingSubmission.solutionImages && gradingSubmission.solutionImages.length > 0) || gradingSubmission.solutionImageUrl) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>صور أوراق الإجابة المرفوعة من الطالب ({gradingSubmission.solutionImages?.length || 1} صور):</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(gradingSubmission.solutionImages && gradingSubmission.solutionImages.length > 0
                      ? gradingSubmission.solutionImages
                      : [{ id: 'sub-img-1', name: 'ورقة الإجابة', url: gradingSubmission.solutionImageUrl! }]
                    ).map((img, idx) => (
                      <div
                        key={img.id || idx}
                        onClick={() => setPreviewImage(img.url)}
                        className="border border-slate-200 rounded-xl overflow-hidden cursor-zoom-in group relative bg-slate-100 p-1 hover:shadow-md transition-all"
                      >
                        <div className="aspect-4/3 rounded-lg overflow-hidden bg-white mb-1 flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 rounded-xl">
                          <ZoomIn className="w-4 h-4" />
                          <span>تكبير</span>
                        </div>
                        <span className="text-[10px] text-slate-600 truncate block px-1 text-center font-medium">
                          ورقة {idx + 1}: {img.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Solution Files by Student */}
              {gradingSubmission.solutionFiles && gradingSubmission.solutionFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>الملفات المرفوعة للحل من الطالب ({gradingSubmission.solutionFiles.length}):</span>
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {gradingSubmission.solutionFiles.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        download={file.name}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-200 hover:border-blue-400 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                          {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1 shrink-0 mr-2">
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل/فتح</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Grading Form */}
              <form onSubmit={handleSaveGrade} className="space-y-4 pt-3 border-t border-slate-100 text-xs">
                {/* Score Input & Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-slate-800 text-xs">الدرجة المستحقة من (100):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-20 px-3 py-1.5 text-center text-sm font-black text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl outline-hidden"
                        required
                      />
                      <span className="font-bold text-slate-500">/ 100</span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-1.5 mt-2">
                    {[100, 95, 90, 85, 80, 70, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGradeScore(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          gradeScore === preset
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teacher Feedback */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ملاحظات وتوجيهات المعلم للطالب:</span>
                  </label>
                  <textarea
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    rows={3}
                    placeholder="اكتب ملاحظاتك على الإجابة أو نقاط القوة والتصحيح..."
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ الدرجة وإرسال النتيجة للطالب</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGradingSubmission(null);
                      if (onClearSelectedSubmission) onClearSelectedSubmission();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Student Roster Engagement Tracker (من فتح / من سلّم / الدرجات) */}
      {viewingRosterAssignment && (() => {
        const assign = viewingRosterAssignment;
        const targetStudents = students.filter((s) => {
          const matchClass = !assign.classId || s.classId === assign.classId;
          const matchSec = !assign.sectionId || s.sectionId === assign.sectionId;
          return matchClass && matchSec;
        });

        const assignSubs = submissions.filter((s) => s.assignmentId === assign.id);
        const subMap = new Map<string, AssignmentSubmission>();
        assignSubs.forEach((s) => subMap.set(s.studentId, s));

        const openedList = assign.openedBy || [];

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      كشف تفاعل الطلاب ومتابعة الواجب
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      الواجب: {assign.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingRosterAssignment(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-center">
                  <div className="text-xs text-blue-700 font-bold">فتحوا الواجب 👁️</div>
                  <div className="text-base font-black text-blue-900 mt-0.5">
                    {openedList.length} <span className="text-[10px] font-normal">من {targetStudents.length}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 text-center">
                  <div className="text-xs text-emerald-700 font-bold">سلّموا الحل 📥</div>
                  <div className="text-base font-black text-emerald-900 mt-0.5">
                    {assignSubs.length} <span className="text-[10px] font-normal">من {targetStudents.length}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-100 text-center">
                  <div className="text-xs text-amber-700 font-bold">بانتظار التسليم ⏳</div>
                  <div className="text-base font-black text-amber-900 mt-0.5">
                    {Math.max(0, targetStudents.length - assignSubs.length)}
                  </div>
                </div>
              </div>

              {/* Students List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {targetStudents.map((st) => {
                  const sub = subMap.get(st.id);
                  const hasOpened = openedList.includes(st.id) || !!sub;
                  const isSubmitted = !!sub;
                  const isGraded = sub?.status === 'graded';

                  return (
                    <div
                      key={st.id}
                      className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{st.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({st.sectionId || 'شعبة أ'})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>اسم المستخدم: <code>{st.username}</code></span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges & Action */}
                      <div className="flex items-center gap-2">
                        {isGraded ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                            <Award className="w-3 h-3 text-emerald-600" />
                            <span>الدرجة: {sub?.score} / 100</span>
                          </span>
                        ) : isSubmitted ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-amber-600" />
                            <span>تم التسليم (بانتظار التصحيح)</span>
                          </span>
                        ) : hasOpened ? (
                          <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-[11px] flex items-center gap-1 border border-blue-200">
                            <Eye className="w-3 h-3 text-blue-500" />
                            <span>فتح الواجب (لم يسلّم بعد)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 font-medium text-[11px]">
                            لم يفتح الواجب بعد
                          </span>
                        )}

                        {sub && (
                          <button
                            type="button"
                            onClick={() => {
                              setViewingRosterAssignment(null);
                              handleOpenGradingModal(sub);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            {isGraded ? 'تعديل الدرجة' : 'تصحيح الحل'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingRosterAssignment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إغلاق الكشف
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Zoomable Lightbox for Solution Image */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 left-2 p-2 bg-white/20 text-white hover:bg-white/40 rounded-full cursor-pointer z-10"
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="معاينة الحل"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
