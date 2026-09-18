import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Award,
  CheckCircle2,
  Clock,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { Exam, ExamSubmission, ClassRoom, Subject, User } from '../../types';

interface ExamResultsPdfReportProps {
  exam: Exam;
  classes: ClassRoom[];
  subjects: Subject[];
  students: User[];
  submissions: ExamSubmission[];
  teacherName: string;
  onClose: () => void;
}

export const ExamResultsPdfReport: React.FC<ExamResultsPdfReportProps> = ({
  exam,
  classes,
  subjects,
  students,
  submissions,
  teacherName,
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const currentClass = classes.find((c) => c.id === exam.classId);
  const currentSubject = subjects.find((s) => s.id === exam.subjectId);

  // Target students for this exam
  const targetedStudents = students.filter((s) => {
    if (!s.isActive) return false;
    const matchesClass = s.classId === exam.classId;
    const matchesSection =
      !exam.sectionId || exam.sectionId === 'الكل' || s.sectionId === exam.sectionId;
    return matchesClass && matchesSection;
  });

  // Calculate stats
  const totalStudentsCount = targetedStudents.length;
  const examSubmissions = submissions.filter((s) => s.examId === exam.id);
  const submittedCount = examSubmissions.length;
  const notSubmittedCount = Math.max(0, totalStudentsCount - submittedCount);

  // Graded submissions with score
  const gradedSubs = examSubmissions.filter((s) => typeof s.score === 'number');
  const totalScores = gradedSubs.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const averageScore = gradedSubs.length > 0 ? (totalScores / gradedSubs.length).toFixed(1) : '0';
  const averagePercentage =
    gradedSubs.length > 0 && exam.maxScore > 0
      ? ((Number(averageScore) / exam.maxScore) * 100).toFixed(1)
      : '0';

  // Prepare table data sorted by score (descending)
  const studentRows = targetedStudents.map((st) => {
    const sub = examSubmissions.find((s) => s.studentId === st.id);
    const score = sub?.score;
    const hasSubmitted = !!sub;
    const isGraded = typeof score === 'number';
    const percentage = isGraded && exam.maxScore > 0 ? Math.round((score / exam.maxScore) * 100) : null;

    let appreciation = 'لم يسلّم';
    let badgeColor = 'text-slate-500 bg-slate-100';
    if (isGraded && percentage !== null) {
      if (percentage >= 90) {
        appreciation = 'ممتاز (A+)';
        badgeColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
      } else if (percentage >= 80) {
        appreciation = 'جيد جداً (B)';
        badgeColor = 'text-teal-800 bg-teal-100 border-teal-300';
      } else if (percentage >= 70) {
        appreciation = 'جيد (C)';
        badgeColor = 'text-blue-800 bg-blue-100 border-blue-300';
      } else if (percentage >= 60) {
        appreciation = 'مقبول (D)';
        badgeColor = 'text-amber-800 bg-amber-100 border-amber-300';
      } else {
        appreciation = 'دون المستوى (F)';
        badgeColor = 'text-rose-800 bg-rose-100 border-rose-300';
      }
    } else if (hasSubmitted) {
      appreciation = 'قيد التصحيح';
      badgeColor = 'text-sky-800 bg-sky-100 border-sky-300';
    }

    return {
      studentId: st.id,
      name: st.name,
      section: st.sectionId || 'غير محدد',
      hasSubmitted,
      submittedAt: sub?.submittedAt,
      isGraded,
      score,
      percentage,
      teacherNotes: sub?.teacherNotes || '',
      appreciation,
      badgeColor,
    };
  });

  // Sort: Graded highest score first, then submitted, then unsubmitted
  studentRows.sort((a, b) => {
    if (a.isGraded && b.isGraded) {
      return (b.score || 0) - (a.score || 0);
    }
    if (a.isGraded && !b.isGraded) return -1;
    if (!a.isGraded && b.isGraded) return 1;
    if (a.hasSubmitted && !b.hasSubmitted) return -1;
    if (!a.hasSubmitted && b.hasSubmitted) return 1;
    return a.name.localeCompare(b.name, 'ar');
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtmlPdf = () => {
    if (!reportRef.current) return;
    const contentHtml = reportRef.current.innerHTML;

    const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير نتائج امتحان - ${exam.title} - منصة نور البيان</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    body {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      direction: rtl;
      background: #ffffff;
      color: #0f172a;
      margin: 0;
      padding: 24px;
    }
    @media print {
      body { padding: 0; }
      @page { size: A4; margin: 12mm; }
    }
    .report-card {
      max-width: 900px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      text-align: right;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 700;
      color: #0f172a;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #059669;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
    }
    .stat-val {
      font-size: 20px;
      font-weight: 800;
      color: #047857;
    }
    .stat-lbl {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="report-card">
    ${contentHtml}
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_نتائج_${exam.title.replace(/\s+/g, '_')}_نور_البيان.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
      dir="rtl"
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-exam-report, #printable-exam-report * {
            visibility: visible;
          }
          #printable-exam-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10mm;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">إنشاء تقرير نتائج الامتحان (PDF)</h3>
              <p className="text-slate-400 text-xs">
                منصة نور البيان التعليمية • قابل للطباعة والحفظ الفوري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة كـ PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtmlPdf}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
              title="تنزيل نسخة تقرير جاهزة للطباعة كـ PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>حفظ الملف</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-slate-50 flex-1">
          <div
            id="printable-exam-report"
            ref={reportRef}
            className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-sm max-w-3xl mx-auto text-slate-900"
          >
            {/* 1. Official Header */}
            <div className="border-b-2 border-emerald-700 pb-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                    ن
                  </div>
                  <div>
                    <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
                      منصة <span className="text-emerald-700">نور البيان</span> التعليمية
                    </h1>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      نظام إدارة الاختبارات والتقييم الأكاديمي الشامل
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-left text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                  <div>
                    تاريخ التقرير:{' '}
                    <strong className="text-slate-800">
                      {new Date().toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div>
                    المعلم المشرف: <strong className="text-emerald-800">{teacherName}</strong>
                  </div>
                </div>
              </div>

              {/* Title of Document */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] mb-1">
                    تقرير درجات رسمي
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    تقرير نتائج امتحان: {exam.title}
                  </h2>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {currentClass?.name || 'الصف الدراسي'} • الشعبة:{' '}
                  <strong className="text-slate-800">{exam.sectionId || 'الكل'}</strong> • المادة:{' '}
                  <strong className="text-slate-800">{currentSubject?.name || 'المادة الدراسية'}</strong>
                </div>
              </div>
            </div>

            {/* 2. Exam Context Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-xs">
              <div>
                <span className="text-slate-500 block">تاريخ الامتحان:</span>
                <strong className="font-bold text-slate-800">{exam.date}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">وقت الامتحان:</span>
                <strong className="font-bold text-slate-800">{exam.startTime || 'غير محدد'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">الدرجة النهائية:</span>
                <strong className="font-bold text-emerald-800 text-sm">
                  {exam.maxScore} درجة
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">مدة الامتحان:</span>
                <strong className="font-bold text-slate-800">
                  {exam.durationMinutes ? `${exam.durationMinutes} دقيقة` : 'غير محددة'}
                </strong>
              </div>
            </div>

            {/* 3. Statistical Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-800">
                  {averageScore}
                  <span className="text-xs text-emerald-600 font-normal"> / {exam.maxScore}</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 mt-1">متوسط الدرجات</div>
                <div className="text-[10px] text-emerald-600 font-medium">
                  نسبة: {averagePercentage}%
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-blue-800">
                  {submittedCount}
                  <span className="text-xs text-blue-600 font-normal"> / {totalStudentsCount}</span>
                </div>
                <div className="text-[11px] font-bold text-blue-700 mt-1">أرسلوا الإجابة</div>
                <div className="text-[10px] text-blue-600 font-medium">
                  {totalStudentsCount > 0
                    ? `${Math.round((submittedCount / totalStudentsCount) * 100)}% مشاركة`
                    : 'لا يوجد طلاب'}
                </div>
              </div>

              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-rose-800">
                  {notSubmittedCount}
                </div>
                <div className="text-[11px] font-bold text-rose-700 mt-1">لم يرسلوا الإجابة</div>
                <div className="text-[10px] text-rose-600 font-medium">بانتظار التسليم</div>
              </div>

              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-purple-800">
                  {gradedSubs.length}
                </div>
                <div className="text-[11px] font-bold text-purple-700 mt-1">تم تصحيحهم</div>
                <div className="text-[10px] text-purple-600 font-medium">
                  {submittedCount - gradedSubs.length > 0
                    ? `${submittedCount - gradedSubs.length} قيد المراجعة`
                    : 'اكتمل التصحيح'}
                </div>
              </div>
            </div>

            {/* 4. Student Results Table (Ordered by Grade) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xs text-slate-800">
                  قائمة نتائج الطلاب مرتبة حسب الدرجة والتحصيل:
                </h3>
                <span className="text-[11px] text-slate-500">
                  إجمالي الطلاب: {targetedStudents.length}
                </span>
              </div>

              {studentRows.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-300 rounded-xl text-xs text-slate-500">
                  لا يوجد طلاب مسجلون في هذا الصف والشعبة حالياً.
                </div>
              ) : (
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-2.5 text-center w-10">#</th>
                        <th className="p-2.5">اسم الطالب</th>
                        <th className="p-2.5">الشعبة</th>
                        <th className="p-2.5 text-center">حالة التسليم</th>
                        <th className="p-2.5 text-center">الدرجة</th>
                        <th className="p-2.5 text-center">النسبة %</th>
                        <th className="p-2.5 text-center">التقدير</th>
                        <th className="p-2.5">ملاحظات المعلم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {studentRows.map((row, index) => (
                        <tr
                          key={row.studentId}
                          className={index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}
                        >
                          <td className="p-2.5 text-center font-bold text-slate-500">
                            {index + 1}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">{row.name}</td>
                          <td className="p-2.5 text-slate-600 font-medium">{row.section}</td>
                          <td className="p-2.5 text-center">
                            {row.hasSubmitted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                تم الإرسال
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock className="w-3 h-3 text-slate-400" />
                                لم يرسل
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-black text-slate-900 text-sm">
                            {row.isGraded ? (
                              <span className="text-emerald-800">
                                {row.score}{' '}
                                <span className="text-[10px] text-slate-400 font-normal">
                                  /{exam.maxScore}
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-700">
                            {row.percentage !== null ? `${row.percentage}%` : '-'}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${row.badgeColor}`}
                            >
                              {row.appreciation}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px] max-w-[160px] truncate">
                            {row.teacherNotes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 5. Official Signatures and Footer */}
            <div className="border-t-2 border-slate-200 pt-6 mt-8 flex justify-between items-end text-xs text-slate-700">
              <div className="text-center w-44">
                <div className="font-bold text-slate-800 mb-8">توقيع معلم المادة</div>
                <div className="border-b border-dashed border-slate-400 pb-1 font-semibold text-emerald-800">
                  أ. {teacherName}
                </div>
              </div>

              <div className="text-center w-40">
                <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-emerald-600/60 flex flex-col items-center justify-center text-[10px] text-emerald-800 font-bold p-1">
                  <span>ختم الاعتماد</span>
                  <span className="text-[8px] text-slate-500 font-normal">منصة نور البيان</span>
                </div>
              </div>

              <div className="text-center w-44">
                <div className="font-bold text-slate-800 mb-8">إدارة المدرسة والتقييم</div>
                <div className="border-b border-dashed border-slate-400 pb-1 font-semibold text-slate-700">
                  تم الاعتماد والمراجعة
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-[10px] text-slate-400">
              تم إصدار هذا التقرير تلقائياً عبر منصة نور البيان التعليمية © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
