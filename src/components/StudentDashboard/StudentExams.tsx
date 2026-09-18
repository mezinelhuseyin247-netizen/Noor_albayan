import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Send,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Exam, ExamSubmission } from '../../types';
import { PdfViewerModal } from '../Modals/PdfViewerModal';

export const StudentExams: React.FC = () => {
  const {
    currentUser,
    exams,
    examSubmissions,
    classes,
    subjects,
    recordExamOpen,
    submitExamAnswer,
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Submitting state
  const [answerImages, setAnswerImages] = useState<{ id: string; name: string; url: string }[]>(
    []
  );
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals for previewing
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [previewPdfModal, setPreviewPdfModal] = useState<{ name: string; url: string } | null>(
    null
  );

  // Filter exams strictly for this student's class & section (only published)
  const studentExams = exams.filter((exam) => {
    if (!currentUser) return false;
    // Match class
    const matchesClass = !exam.classId || exam.classId === 'all' || exam.classId === currentUser.classId;
    // Match section
    const matchesSection =
      !exam.sectionId ||
      exam.sectionId === 'الكل' ||
      exam.sectionId === 'all' ||
      !currentUser.sectionId ||
      exam.sectionId === currentUser.sectionId;
    // Only published
    const isPublished = exam.status !== 'draft';

    return matchesClass && matchesSection && isPublished;
  });

  const activeExam = selectedExamId
    ? studentExams.find((e) => e.id === selectedExamId) || studentExams[0]
    : studentExams[0];

  const currentSubmission = activeExam && currentUser
    ? examSubmissions.find(
        (s) => s.examId === activeExam.id && s.studentId === currentUser.id
      )
    : undefined;

  const handleSelectExam = (exam: Exam) => {
    setSelectedExamId(exam.id);
    setAnswerImages([]);
    setStudentNotes('');
    setErrorMsg('');
    setSubmitSuccessMsg(false);
    recordExamOpen(exam.id);
  };

  // Upload Answer Images (STRICTLY Files/Gallery - NO CAMERA)
  const handleAnswerImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg('');
    const newImages: { id: string; name: string; url: string }[] = [];

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        newImages.push({
          id: `ans-img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          url: result,
        });

        if (newImages.length === files.length) {
          setAnswerImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAnswerImage = (id: string) => {
    setAnswerImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam) return;

    if (answerImages.length === 0) {
      setErrorMsg('يرجى اختيار ورفع صورة واحدة على الأقل من كراسة أو أوراق الإجابة');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      submitExamAnswer(activeExam.id, answerImages, studentNotes.trim());
      setSubmitSuccessMsg(true);
      setTimeout(() => setSubmitSuccessMsg(false), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال الإجابة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">جدول الامتحانات والاختبارات الدراسية</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              عرض الاختبارات المقررة لصفك وشعبتك، حل الأسئلة، ورفع أوراق الإجابة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
            {classes.find((c) => c.id === currentUser?.classId)?.name || 'صفك الدراسي'}
            {currentUser?.sectionId ? ` • شعبة ${currentUser.sectionId}` : ''}
          </span>
        </div>
      </div>

      {/* Main Content */}
      {studentExams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">لا توجد امتحانات مقررة حالياً</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            لم يقم المعلم بنشر أي امتحانات جديدة لصفك وشعبتك حتى الآن. عند نشر أي اختبار جديد ستتلقى
            إشعاراً فورياً وسيظهر هنا مباشرة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Exam Navigation Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 px-1">
              الامتحانات المتاحة ({studentExams.length})
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-0.5">
              {studentExams.map((exam) => {
                const isSelected = activeExam?.id === exam.id;
                const subj = subjects.find((s) => s.id === exam.subjectId);
                const sub = examSubmissions.find(
                  (s) => s.examId === exam.id && s.studentId === currentUser?.id
                );

                return (
                  <div
                    key={exam.id}
                    onClick={() => handleSelectExam(exam)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-right ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{exam.title}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] shrink-0">
                        {exam.maxScore} درجة
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                      <span className="font-semibold text-emerald-800">{subj?.name || 'المادة'}</span>
                      <span>•</span>
                      <span>{exam.date}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {sub?.status === 'graded' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          تم التصحيح ({sub.score}/{exam.maxScore})
                        </span>
                      ) : sub?.status === 'submitted' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          تم إرسال الحل (قيد التصحيح)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          بانتظار تسليم الحل
                        </span>
                      )}

                      <span className="text-slate-400 text-[10px]">
                        {exam.durationMinutes ? `${exam.durationMinutes} دقيقة` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Exam Workspace (8 cols) */}
          {activeExam && (
            <div className="lg:col-span-8 space-y-5">
              {/* Exam Card Overview */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                        {subjects.find((s) => s.id === activeExam.subjectId)?.name || 'المادة'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                        شعبة: {activeExam.sectionId || 'الكل'}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900">{activeExam.title}</h2>
                  </div>

                  <div className="text-left bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl shrink-0">
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      الدرجة النهائية
                    </span>
                    <strong className="text-emerald-900 font-black text-base">
                      {activeExam.maxScore} درجة
                    </strong>
                  </div>
                </div>

                {/* Exam Date & Duration Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200/70 p-3 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">تاريخ الامتحان:</span>
                    <strong className="font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {activeExam.date}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">وقت الامتحان:</span>
                    <strong className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {activeExam.startTime || 'غير محدد'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">المدة المحددة:</span>
                    <strong className="font-bold text-slate-800">
                      {activeExam.durationMinutes || 60} دقيقة
                    </strong>
                  </div>
                </div>

                {/* Instructions */}
                {activeExam.instructions && (
                  <div className="text-xs">
                    <span className="font-bold text-slate-700 block mb-1">تعليمات وتوجيهات المعلم:</span>
                    <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl text-slate-700 leading-relaxed font-medium">
                      {activeExam.instructions}
                    </div>
                  </div>
                )}

                {/* Question Files (PDF & Images) */}
                <div className="pt-2">
                  <span className="font-bold text-xs text-slate-800 block mb-2">
                    ورقة وأسئلة الامتحان:
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* PDF Questions file */}
                    {activeExam.pdfFile && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPdfModal({
                            name: activeExam.pdfFile!.name,
                            url: activeExam.pdfFile!.url,
                          })
                        }
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
                        id="btn-student-open-pdf"
                        title="فتح ورقة أسئلة الامتحان كاملة بصيغة PDF بجميع صفحاتها"
                      >
                        <FileText className="w-4 h-4" />
                        <span>فتح ورقة الامتحان (PDF)</span>
                      </button>
                    )}

                    {/* Question Images */}
                    {activeExam.images && activeExam.images.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {activeExam.images.map((img, idx) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setPreviewImageModal(img.url)}
                            className="px-3.5 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                            <span>عرض صفحة أسئلة #{idx + 1} (تكبير)</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Graded Result Display */}
              {currentSubmission?.status === 'graded' && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500 shadow-md">
                  <div className="flex items-center justify-between gap-4 border-b border-emerald-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                        <Award className="w-7 h-7 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-700 block">
                          نتيجة التصحيح النهائية
                        </span>
                        <h3 className="text-lg font-black text-slate-900">
                          درجتك في الامتحان: {currentSubmission.score} من {activeExam.maxScore}
                        </h3>
                      </div>
                    </div>

                    <div className="text-left bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        النسبة المئوية
                      </span>
                      <strong className="text-xl font-black text-emerald-800">
                        {currentSubmission.percentage}%
                      </strong>
                    </div>
                  </div>

                  {currentSubmission.teacherNotes && (
                    <div className="mt-4 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs">
                      <strong className="font-bold text-emerald-950 block mb-1">
                        ملاحظات وتوجيهات المعلم:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">
                        {currentSubmission.teacherNotes}
                      </p>
                    </div>
                  )}

                  {/* Show student submitted answers */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      أوراق الإجابة التي قمت بتسليمها ({currentSubmission.answerImages.length} صورة):
                    </span>
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                      {currentSubmission.answerImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          onClick={() => setPreviewImageModal(img.url)}
                          className="cursor-pointer border border-slate-300 rounded-xl overflow-hidden w-20 h-20 shrink-0 relative group bg-white shadow-xs"
                        >
                          <img
                            src={img.url}
                            alt={`ورقة إجابة ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition">
                            تكبير
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Already Submitted (Awaiting Grading) Display */}
              {currentSubmission && currentSubmission.status === 'submitted' && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        تم استلام إجاباتك بنجاح
                      </h3>
                      <p className="text-xs text-slate-500">
                        الامتحان قيد المراجعة والتصحيح من قبل معلم المادة، ستظهر درجتك فور اعتمادها.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      أوراق الحل المرفوعة ({currentSubmission.answerImages.length} صورة):
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {currentSubmission.answerImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          onClick={() => setPreviewImageModal(img.url)}
                          className="cursor-pointer border border-slate-300 rounded-xl overflow-hidden w-20 h-20 shrink-0 relative group bg-white shadow-xs"
                        >
                          <img
                            src={img.url}
                            alt={`ورقة ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold">
                            تكبير
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Solution Upload Form (Only if not graded or student wishes to submit) */}
              {(!currentSubmission || currentSubmission.status !== 'graded') && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      {currentSubmission ? 'تحديث أو إعادة تسليم الإجابة' : 'تسليم إجابة الامتحان'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      قم بحل الأسئلة على ورقة خارجية، ثم ارفع صور صفحات الحل من جهازك
                    </p>
                  </div>

                  {submitSuccessMsg && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم تسليم إجابة الامتحان بنجاح للمعلم!</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitAnswer} className="space-y-4">
                    {/* IMPORTANT CAMERA RESTRICTION: Gallery/Files only */}
                    <div className="p-4 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/30 text-center space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                        <FolderOpen className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="font-bold text-xs text-slate-800">
                          رفع صور كراسة أو أوراق الإجابة من ملفات الجهاز
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          اختر الصور من ألبوم الصور أو مدير الملفات في هاتفك أو حاسوبك (يمكن اختيار أكثر من صورة معاً)
                        </p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          معرض الصور والملفات فقط (بدون فتح الكاميرا)
                        </span>
                      </div>

                      {/* File input WITHOUT capture attribute, strictly for gallery/files */}
                      <input
                        type="file"
                        id="student-exam-images-input"
                        onChange={handleAnswerImagesUpload}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        multiple
                        className="hidden"
                      />

                      <div>
                        <label
                          htmlFor="student-exam-images-input"
                          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
                        >
                          <Upload className="w-4 h-4" />
                          <span>اختيار صور الإجابة من المعرض / الملفات</span>
                        </label>
                      </div>
                    </div>

                    {/* Uploaded Answer Images Preview Grid */}
                    {answerImages.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">
                            الصور المختارة ({answerImages.length}):
                          </span>
                          <span className="text-[11px] text-slate-500">
                            انقر على أي صورة لمعاينتها بالحجم الكامل
                          </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                          {answerImages.map((img, idx) => (
                            <div
                              key={img.id}
                              className="relative group rounded-xl overflow-hidden border border-slate-300 bg-white aspect-4/3 shadow-xs"
                            >
                              <img
                                src={img.url}
                                alt={img.name}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => setPreviewImageModal(img.url)}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImageModal(img.url)}
                                  className="p-1 rounded bg-white text-slate-900 hover:bg-slate-100"
                                  title="معاينة وتكبير"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeAnswerImage(img.id)}
                                  className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                                  title="حذف هذه الصورة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                                صفحة #{idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Student Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ملاحظات اختيارية للمعلم مع ورقة الإجابة:
                      </label>
                      <textarea
                        rows={2}
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        placeholder="إذا كان لديك أي استفسار أو توضيح للمعلم بخصوص الحل..."
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || answerImages.length === 0}
                        className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>إرسال وتسليم أوراق الامتحان للمعلم</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImageModal}
              alt="معاينة الصورة"
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

      {/* High-Definition Multi-Page PDF Questions Viewer */}
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
