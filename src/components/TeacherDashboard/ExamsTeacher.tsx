import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  BookOpen,
  Building2,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  Award,
  ChevronDown,
  Layers,
  Search,
  Filter,
  Image as ImageIcon,
  Check,
  Send,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Exam, ExamSubmission, User } from '../../types';
import { CreateExamModal } from '../Modals/CreateExamModal';
import { ExamResultsPdfReport } from './ExamResultsPdfReport';
import { PdfViewerModal } from '../Modals/PdfViewerModal';

export const ExamsTeacher: React.FC = () => {
  const {
    exams,
    examSubmissions,
    classes,
    subjects,
    students,
    currentUser,
    deleteExam,
    gradeExamSubmission,
    publishExam,
    showToast,
  } = useApp();

  // Modals and selection state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [pdfReportExam, setPdfReportExam] = useState<Exam | null>(null);

  // Filters
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active submission preview / grading
  const [gradingSubmission, setGradingSubmission] = useState<ExamSubmission | null>(null);
  const [gradeScoreInput, setGradeScoreInput] = useState<string>('');
  const [gradeNotesInput, setGradeNotesInput] = useState<string>('');
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [previewPdfModal, setPreviewPdfModal] = useState<{ name: string; url: string } | null>(
    null
  );

  // Filtered exams list
  const filteredExams = exams.filter((exam) => {
    if (filterClassId !== 'all' && exam.classId !== filterClassId) return false;
    if (filterSubjectId !== 'all' && exam.subjectId !== filterSubjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = exam.title.toLowerCase().includes(q);
      const subj = subjects.find((s) => s.id === exam.subjectId)?.name.toLowerCase() || '';
      if (!matchesTitle && !subj.includes(q)) return false;
    }
    return true;
  });

  const activeExam = selectedExamId
    ? exams.find((e) => e.id === selectedExamId) || filteredExams[0]
    : filteredExams[0];

  const activeExamSubmissions = activeExam
    ? examSubmissions.filter((s) => s.examId === activeExam.id)
    : [];

  const activeExamTargetStudents = activeExam
    ? students.filter((st) => {
        if (!st.isActive) return false;
        const matchesClass = st.classId === activeExam.classId;
        const matchesSection =
          !activeExam.sectionId || activeExam.sectionId === 'الكل' || st.sectionId === activeExam.sectionId;
        return matchesClass && matchesSection;
      })
    : [];

  const submittedStudentIds = new Set(activeExamSubmissions.map((s) => s.studentId));
  const unsubmittedStudents = activeExamTargetStudents.filter(
    (st) => !submittedStudentIds.has(st.id)
  );

  const handleDeleteExam = (exam: Exam) => {
    if (
      window.confirm(
        `هل أنت متأكد من حذف الامتحان: "${exam.title}"؟ سيتم أيضاً حذف تسليمات الطلاب المرتبطة به.`
      )
    ) {
      deleteExam(exam.id);
      if (selectedExamId === exam.id) {
        setSelectedExamId(null);
      }
    }
  };

  const handleOpenGrading = (sub: ExamSubmission) => {
    setGradingSubmission(sub);
    setGradeScoreInput(sub.score !== undefined ? String(sub.score) : '');
    setGradeNotesInput(sub.teacherNotes || '');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const scoreNum = Number(gradeScoreInput);
    if (isNaN(scoreNum) || scoreNum < 0) {
      showToast('يرجى إدخال درجة صحيحة');
      return;
    }

    gradeExamSubmission(gradingSubmission.id, scoreNum, gradeNotesInput.trim());
    setGradingSubmission(null);
    showToast('تم حفظ ورصد درجة الامتحان بنجاح');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">إدارة الامتحانات والاختبارات</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                إنشاء الاختبارات، رفع ملفات الأسئلة (PDF وصور)، ومتابعة وتصحيح إجابات الطلاب
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingExam(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء امتحان جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الامتحان أو المادة..."
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Class filter */}
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="all">جميع الصفوف الدراسية</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Subject filter */}
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="all">جميع المواد</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area: Exams List & Details */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">لا توجد امتحانات مضافة بعد</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            قسم الامتحانات يبدأ فارغاً بدون أي امتحانات تجريبية. يمكنك الآن إنشاء أول امتحان وتحديد
            الصف والشعبة ورفع ملف الأسئلة (PDF أو صور).
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingExam(null);
              setShowCreateModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء أول امتحان الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Right Column: Exams Navigation List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 px-1 flex items-center justify-between">
              <span>قائمة الامتحانات ({filteredExams.length})</span>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-0.5">
              {filteredExams.map((exam) => {
                const isSelected = activeExam?.id === exam.id;
                const currentClass = classes.find((c) => c.id === exam.classId);
                const currentSubject = subjects.find((s) => s.id === exam.subjectId);
                const examSubs = examSubmissions.filter((s) => s.examId === exam.id);

                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-right relative ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{exam.title}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        {exam.status === 'draft' ? (
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[9px] border border-amber-200">
                              مسودة
                            </span>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await publishExam(exam.id);
                                showToast('تم النشر بنجاح');
                              }}
                              className="px-2 py-0.5 rounded-md bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                              title="نشر الامتحان فوراً للطلاب المحددين"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>نشر</span>
                            </button>
                          </div>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[9px] border border-emerald-200 flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                            منشور
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {exam.maxScore} درجة
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                      <span>{currentSubject?.name || 'مادة عامة'}</span>
                      <span>•</span>
                      <span>{currentClass?.name || 'صف'}</span>
                      {exam.sectionId && exam.sectionId !== 'الكل' && (
                        <span>(شعبة {exam.sectionId})</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exam.date}
                      </span>

                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                        {examSubs.length} تسليمات
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Left Column: Active Exam Dashboard & Submissions (8 cols) */}
          {activeExam && (
            <div className="lg:col-span-8 space-y-5">
              {/* Exam Overview Header Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                        {subjects.find((s) => s.id === activeExam.subjectId)?.name || 'المادة'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                        {classes.find((c) => c.id === activeExam.classId)?.name || 'الصف'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                        الشعبة: {activeExam.sectionId || 'الكل'}
                      </span>
                      {activeExam.status === 'draft' ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300">
                          مسودة
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          منشور للطلاب
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-extrabold text-slate-900">{activeExam.title}</h2>
                  </div>

                  {/* Actions (Report, Edit, Delete, Publish) */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {activeExam.status === 'draft' && (
                      <button
                        type="button"
                        id="publish-active-exam-btn"
                        onClick={async () => {
                          await publishExam(activeExam.id);
                          showToast('تم النشر بنجاح');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                        title="نشر هذا الامتحان الآن ليظهر للطلاب مباشرة"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>نشر الامتحان</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setPdfReportExam(activeExam)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      title="إنشاء تقرير نتائج PDF احترافي ومنظم"
                    >
                      <Award className="w-4 h-4 text-emerald-200" />
                      <span>إنشاء تقرير نتائج PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingExam(activeExam);
                        setShowCreateModal(true);
                      }}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                      title="تعديل الامتحان"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteExam(activeExam)}
                      className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                      title="حذف الامتحان"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exam Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">موعد وتاريخ الامتحان:</span>
                    <strong className="font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {activeExam.date} ({activeExam.startTime})
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">مدة الامتحان:</span>
                    <strong className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {activeExam.durationMinutes || 60} دقيقة
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">الدرجة النهائية:</span>
                    <strong className="font-black text-emerald-800 text-sm">
                      {activeExam.maxScore} درجة
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">إحصائية التسليم:</span>
                    <strong className="font-bold text-slate-800">
                      {activeExamSubmissions.length} من أصل {activeExamTargetStudents.length} طلاب
                    </strong>
                  </div>
                </div>

                {/* Instructions */}
                {activeExam.instructions && (
                  <div className="pt-3 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">تعليمات الامتحان:</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                      {activeExam.instructions}
                    </p>
                  </div>
                )}

                {/* Attached Files (PDF & Images) */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    الملفات المرفقة للامتحان:
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    {activeExam.pdfFile && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPdfModal({
                            name: activeExam.pdfFile!.name,
                            url: activeExam.pdfFile!.url,
                          })
                        }
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
                        id="btn-teacher-open-pdf"
                        title="فتح ورقة أسئلة الامتحان بصيغة PDF كاملة بجميع صفحاتها"
                      >
                        <FileText className="w-4 h-4" />
                        <span>فتح ورقة أسئلة الامتحان (PDF)</span>
                      </button>
                    )}

                    {activeExam.images && activeExam.images.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {activeExam.images.map((img, idx) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setPreviewImageModal(img.url)}
                            className="px-3 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                            <span>صورة أسئلة #{idx + 1}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {!activeExam.pdfFile &&
                      (!activeExam.images || activeExam.images.length === 0) && (
                        <span className="text-xs text-slate-400">لا توجد ملفات مرفقة</span>
                      )}
                  </div>
                </div>
              </div>

              {/* Submissions Management Section */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      تسليمات الطلاب وإجابات الامتحان
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      عرض أوراق الإجابة المصورة، تصحيح الامتحان ورصد الدرجات والملاحظات
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      {activeExamSubmissions.length} تم التسليم
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold">
                      {unsubmittedStudents.length} بانتظار التسليم
                    </span>
                  </div>
                </div>

                {/* Submissions Table / Cards */}
                {activeExamSubmissions.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-500">
                    <p className="font-semibold text-slate-700 mb-1">
                      لم يقم أي طالب بتسليم إجاباته بعد
                    </p>
                    <p className="text-slate-400">
                      عندما يقوم الطالب بحل الامتحان ورفع صور أوراق الحل من حسابه، ستظهر هنا فوراً
                      لتتمكن من تصحيحها.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeExamSubmissions.map((sub) => {
                      const studentObj = students.find((s) => s.id === sub.studentId);
                      const isGraded = typeof sub.score === 'number';

                      return (
                        <div
                          key={sub.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0 overflow-hidden">
                              {sub.studentAvatar ? (
                                <img
                                  src={sub.studentAvatar}
                                  alt={sub.studentName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                sub.studentName.charAt(0)
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">
                                  {sub.studentName}
                                </h4>
                                <span className="text-[11px] text-slate-500">
                                  شعبة {studentObj?.sectionId || sub.sectionId || 'عام'}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                <span>
                                  تاريخ الإرسال:{' '}
                                  {new Date(sub.submittedAt).toLocaleTimeString('ar-EG', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: 'numeric',
                                    month: 'numeric',
                                  })}
                                </span>
                                <span>•</span>
                                <span className="font-semibold text-emerald-800">
                                  {sub.answerImages.length} صور مرفقة لكراسة الإجابة
                                </span>
                              </p>

                              {sub.studentNotes && (
                                <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-2">
                                  <strong className="text-slate-700">ملاحظة الطالب:</strong>{' '}
                                  {sub.studentNotes}
                                </p>
                              )}

                              {/* Student Answer Images Thumbnails */}
                              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                {sub.answerImages.map((img, i) => (
                                  <button
                                    key={img.id || i}
                                    type="button"
                                    onClick={() => setPreviewImageModal(img.url)}
                                    className="relative group rounded-lg overflow-hidden border border-slate-300 w-12 h-12 shrink-0 bg-white"
                                  >
                                    <img
                                      src={img.url}
                                      alt={`إجابة ورقة ${i + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                                      <Eye className="w-3.5 h-3.5" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Grade info and button */}
                          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                            {isGraded ? (
                              <div className="text-left bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                                <span className="text-[10px] text-emerald-700 font-bold block">
                                  الدرجة المرصودة:
                                </span>
                                <strong className="text-emerald-900 font-black text-sm">
                                  {sub.score}{' '}
                                  <span className="text-xs font-medium text-emerald-700">
                                    /{activeExam.maxScore}
                                  </span>
                                </strong>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                                بانتظار التصحيح
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenGrading(sub)}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{isGraded ? 'تعديل الدرجة' : 'تصحيح ورصد الدرجة'}</span>
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
        </div>
      )}

      {/* Create / Edit Exam Modal */}
      {showCreateModal && (
        <CreateExamModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingExam(null);
          }}
          initialExam={editingExam}
        />
      )}

      {/* Grading Modal */}
      {gradingSubmission && activeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 text-white p-4 px-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">تصحيح إجابة: {gradingSubmission.studentName}</h3>
                <p className="text-xs text-slate-400">امتحان: {activeExam.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-5 space-y-4">
              {/* Review uploaded answers */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  أوراق الإجابة المرفوعة ({gradingSubmission.answerImages.length} صورة):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {gradingSubmission.answerImages.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      onClick={() => setPreviewImageModal(img.url)}
                      className="cursor-pointer border border-slate-300 rounded-xl overflow-hidden w-20 h-20 shrink-0 relative group bg-white"
                    >
                      <img
                        src={img.url}
                        alt={`إجابة ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold">
                        تكبير
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الدرجة المستحقة (من {activeExam.maxScore}) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={activeExam.maxScore}
                    step="0.5"
                    value={gradeScoreInput}
                    onChange={(e) => setGradeScoreInput(e.target.value)}
                    placeholder="مثال: 95"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                  <span className="text-sm font-bold text-slate-500">/ {activeExam.maxScore}</span>
                </div>
              </div>

              {/* Feedback Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات المعلم والتغذية الراجعة للطالب
                </label>
                <textarea
                  rows={3}
                  value={gradeNotesInput}
                  onChange={(e) => setGradeNotesInput(e.target.value)}
                  placeholder="مثال: إجابة ممتازة وتنسيق رائع للخطوات، أحسنت يا بطل!"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد الدرجة وإرسال النتيجة للطالب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Results Report Modal */}
      {pdfReportExam && (
        <ExamResultsPdfReport
          exam={pdfReportExam}
          classes={classes}
          subjects={subjects}
          students={students}
          submissions={examSubmissions}
          teacherName={currentUser?.name || 'المعلم المشرف'}
          onClose={() => setPdfReportExam(null)}
        />
      )}

      {/* Fullscreen Image Preview */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImageModal}
              alt="معاينة كراسة الإجابة أو ورقة الامتحان"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <button
              type="button"
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-3 -left-3 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Multi-Page High-Definition PDF Questions Viewer */}
      {previewPdfModal && (
        <PdfViewerModal
          isOpen={Boolean(previewPdfModal)}
          onClose={() => setPreviewPdfModal(null)}
          title={previewPdfModal.name}
          pdfUrl={previewPdfModal.url}
          fileName={previewPdfModal.name}
        />
      )}
    </div>
  );
};
