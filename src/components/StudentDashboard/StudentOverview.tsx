import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  Video,
  Clock,
  Sparkles,
  Award,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CalendarDays,
  ExternalLink,
  ChevronLeft,
  Image as ImageIcon,
} from 'lucide-react';
import { OpenBookArabicIcon } from '../Common/OpenBookArabicLogo';
import { UserProfileModal } from '../Modals/UserProfileModal';

interface StudentOverviewProps {
  setActiveTab: (tab: string) => void;
  onOpenSolveAssignment: (assignmentId: string) => void;
}

export const StudentOverview: React.FC<StudentOverviewProps> = ({
  setActiveTab,
  onOpenSolveAssignment,
}) => {
  const { currentUser, classes, subjects, lessons, assignments, submissions, liveLessons, exams, examSubmissions } = useApp();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const studentClass = classes.find((c) => c.id === currentUser?.classId);
  const studentAssignments = assignments.filter((a) => {
    if (!currentUser) return false;
    const matchesClass = !a.classId || a.classId === 'all' || a.classId === currentUser.classId;
    const matchesSection = !a.sectionId || a.sectionId === 'all' || a.sectionId === 'الكل' || !currentUser.sectionId || a.sectionId === currentUser.sectionId;
    return matchesClass && matchesSection && a.status !== 'draft';
  });
  const studentExams = exams.filter((e) => {
    if (!currentUser) return false;
    const matchesClass = !e.classId || e.classId === 'all' || e.classId === currentUser.classId;
    const matchesSection = !e.sectionId || e.sectionId === 'all' || e.sectionId === 'الكل' || !currentUser.sectionId || e.sectionId === currentUser.sectionId;
    return matchesClass && matchesSection && e.status !== 'draft';
  });

  // Submissions by this student
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser?.id);
  const mySubmittedIds = new Set(mySubmissions.map((s) => s.assignmentId));

  // Pending assignments to solve
  const pendingAssignments = studentAssignments.filter((a) => !mySubmittedIds.has(a.id));
  const gradedSubmissions = mySubmissions.filter((s) => s.status === 'graded');

  // Upcoming Live Session
  const nextLiveSession = liveLessons.find((l) => l.status === 'upcoming' || l.status === 'live');

  return (
    <div className="space-y-6" dir="rtl">
      {/* Student Profile & Cover Banner */}
      <div className="rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative bg-white">
        {/* Cover Background */}
        <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 flex items-center justify-center">
          {currentUser?.coverPhoto ? (
            currentUser.coverPhoto.startsWith('linear-gradient') ? (
              <div className="w-full h-full" style={{ background: currentUser.coverPhoto }} />
            ) : (
              <img
                src={currentUser.coverPhoto}
                alt="غلاف الطالب"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Edit Profile / Cover Button */}
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white text-xs font-semibold flex items-center gap-1.5 transition backdrop-blur-sm border border-white/20 shadow cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>تعديل الغلاف والصورة</span>
          </button>
        </div>

        {/* Profile Details Header */}
        <div className="p-6 sm:p-8 pt-0 -mt-14 sm:-mt-16 relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-teal-700 text-white flex items-center justify-center font-bold text-3xl">
                {currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http')) ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentUser?.name.charAt(0) || 'ط'
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="absolute inset-0 bg-black/50 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                title="تعديل الصورة الشخصية من ملفات الجهاز"
              >
                <ImageIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-1 text-slate-800">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold mb-1">
                <OpenBookArabicIcon className="w-3.5 h-3.5 text-teal-700" />
                <span>حساب الطالب الشخصي</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser?.name || 'الطالب'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                الصف: <strong>{studentClass?.name || 'الصف الدراسي'}</strong> • {currentUser?.sectionId || 'شعبة أ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4 text-emerald-700" />
              <span>البرنامج الأسبوعي</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exams')}
              className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Award className="w-4 h-4 text-emerald-300" />
              <span>جدول الامتحانات ({studentExams.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <FileCheck2 className="w-4 h-4 text-amber-300" />
              <span>واجباتي</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Assignments */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            {pendingAssignments.length > 0 ? (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                مطلوب تسليمها
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                تم تسليم الكل
              </span>
            )}
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{pendingAssignments.length}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">واجبات بانتظار الحل</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span>الانتقال للتسليم وحل الواجب</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>

        {/* Graded & Average Score */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {gradedSubmissions.length} تم تصحيحه
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {gradedSubmissions.length > 0
                ? `${Math.round(
                    gradedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) /
                      gradedSubmissions.length
                  )} %`
                : '100%'}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">متوسط الدرجات المرصودة</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>مراجعة درجاتك وملاحظات المعلم</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>

        {/* Subjects & Lessons */}
        <div
          onClick={() => setActiveTab('lessons')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {subjects.length} مقررات
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{lessons.length}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">دروس تعليمية ومذكرات</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
            <span>تصفح الدروس والمذكرات</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>

        {/* Live Classes */}
        <div
          onClick={() => setActiveTab('live')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              بث حي
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{liveLessons.length}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">جلسات تفاعلية مجدولة</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-bold">
            <span>غرفة البث المباشر</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Assignments & Graded Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Tasks Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">الواجبات المطلوبة منك حاليًا</h3>
                  <p className="text-[11px] text-slate-500">قم بحل الواجب وإرفاق صورة الحل قبل انتهاء الوقت المحدد</p>
                </div>
              </div>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <span className="font-bold block text-sm">أحسنت! لا توجد واجبات معلقة حاليًا.</span>
                <span>{assignments.length === 0 ? 'لم يقم المعلم بنشر واجبات جديدة بعد.' : 'لقد قمت بتسليم جميع الواجبات المقررة.'}</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingAssignments.map((assign) => {
                  const subj = subjects.find((s) => s.id === assign.subjectId);

                  return (
                    <div key={assign.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            {subj?.name}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{assign.title}</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1 mt-1">{assign.description}</p>
                        <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>آخر موعد للتسليم: {assign.dueDate} الساعة {assign.dueTime}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenSolveAssignment(assign.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-end sm:self-center shrink-0"
                      >
                        حل وتسليم الواجب
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Graded Assignments Feed with Teacher Feedback */}
          {gradedSubmissions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">أحدث الواجبات المصححة ونتائجك</h3>
                  <p className="text-[11px] text-slate-500">درجاتك ورسائل المعلم الإرشادية</p>
                </div>
              </div>

              <div className="space-y-3">
                {gradedSubmissions.map((sub) => {
                  const assign = assignments.find((a) => a.id === sub.assignmentId);

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{assign?.title || 'واجب'}</span>
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                          الدرجة: {sub.score} / 100 ⭐
                        </span>
                      </div>

                      {sub.teacherFeedback && (
                        <div className="p-2.5 bg-white rounded-lg border border-emerald-100 text-slate-700 mt-2">
                          <strong className="text-emerald-900 block mb-0.5">ملاحظات المعلم:</strong>
                          <span>{sub.teacherFeedback}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Live Session Card & External Links */}
        <div className="space-y-6">
          {/* Upcoming Live Session Card */}
          {nextLiveSession ? (
            <div className="bg-linear-to-br from-teal-900 to-slate-900 rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {nextLiveSession.platform === 'google_meet' ? 'Google Meet' : 'Zoom'}
                </span>
                <span className="text-[11px] text-slate-300">
                  {nextLiveSession.date} • {nextLiveSession.time}
                </span>
              </div>

              <h4 className="text-sm font-bold mt-2 leading-snug">{nextLiveSession.title}</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">{nextLiveSession.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                <span className="text-[11px] text-teal-300 font-semibold">{nextLiveSession.teacherName}</span>
                <a
                  href={nextLiveSession.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <span>دخول الحصة المباشرة</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 text-center text-slate-400 text-xs py-8">
              <Video className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>لا توجد حصص مباشرة مجدولة حالياً</p>
            </div>
          )}
        </div>
      </div>

      {/* User Profile & Cover Modal */}
      {currentUser && (
        <UserProfileModal
          user={currentUser}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};
