import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  BookOpen,
  FileCheck2,
  Video,
  Clock,
  PlusCircle,
  Sparkles,
  ArrowUpRight,
  CheckCircle,
  Eye,
  Calendar,
  CalendarDays,
  AlertCircle,
  Activity,
  Layers,
  Image as ImageIcon,
  Award,
} from 'lucide-react';
import { OpenBookArabicIcon } from '../Common/OpenBookArabicLogo';
import { UserProfileModal } from '../Modals/UserProfileModal';

interface TeacherOverviewProps {
  setActiveTab: (tab: string) => void;
  onOpenAddStudent: () => void;
  onOpenAddLesson: () => void;
  onOpenAddAssignment: () => void;
  onOpenAddLive: () => void;
  onOpenGrading: (submissionId: string) => void;
}

export const TeacherOverview: React.FC<TeacherOverviewProps> = ({
  setActiveTab,
  onOpenAddStudent,
  onOpenAddLesson,
  onOpenAddAssignment,
  onOpenAddLive,
  onOpenGrading,
}) => {
  const {
    currentUser,
    students,
    classes,
    subjects,
    lessons,
    assignments,
    submissions,
    exams,
    examSubmissions,
    liveLessons,
    activities,
  } = useApp();

  const [showProfileModal, setShowProfileModal] = useState(false);

  const onlineStudents = students.filter((s) => s.isOnline && s.isActive);
  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted');
  const upcomingLive = liveLessons.filter((l) => l.status === 'upcoming' || l.status === 'live');

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Banner with Teacher Profile & Cover Photo */}
      <div className="rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative bg-white">
        {/* Cover Background */}
        <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 flex items-center justify-center">
          {currentUser?.coverPhoto ? (
            currentUser.coverPhoto.startsWith('linear-gradient') ? (
              <div className="w-full h-full" style={{ background: currentUser.coverPhoto }} />
            ) : (
              <img
                src={currentUser.coverPhoto}
                alt="غلاف المعلم"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
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
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-3xl">
                {currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http')) ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentUser?.name.charAt(0) || 'م'
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
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1">
                <OpenBookArabicIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>لوحة المعلم والمشرف</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser?.name || 'المعلم المشرف'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser?.notes || currentUser?.bio || 'مرحباً بك في منصة نور البيان التعليمية'}
              </p>
            </div>
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('schedule')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <span>البرنامج الأسبوعي</span>
            </button>
            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة طالب</span>
            </button>
            <button
              onClick={onOpenAddAssignment}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-95"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>نشر واجب</span>
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>إدارة الامتحانات</span>
            </button>
            <button
              onClick={onOpenAddLive}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>بث مباشر</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students & Online */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{onlineStudents.length} متصل الآن</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{students.length}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">إجمالي الطلاب المسجلين</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 group-hover:text-emerald-700 font-bold">
            <span>إدارة حسابات الطلاب والشعب</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Classes & Sections */}
        <div
          onClick={() => setActiveTab('classes')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {classes.reduce((acc, c) => acc + c.sections.length, 0)} شعبة دراسية
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{classes.length}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">الصفوف الدراسية النشطة</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 group-hover:text-blue-700 font-bold">
            <span>إدارة الصفوف وتوزيع الطلاب</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Assignments to Grade */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            {pendingSubmissions.length > 0 ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>{pendingSubmissions.length} بحاجة للتصحيح</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {assignments.length === 0 ? 'لا توجد واجبات' : 'تم تصحيح الكل'}
              </span>
            )}
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{assignments.length}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">إجمالي الواجبات المنشورة</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 group-hover:text-amber-700 font-bold">
            <span>تصحيح الإجابات ورصد الدرجات</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Upcoming Live & Lessons */}
        <div
          onClick={() => setActiveTab('live')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Meet / Zoom
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">{upcomingLive.length}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">جلسات بث مباشر مجدولة</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 group-hover:text-purple-700 font-bold">
            <span>إطلاق الحصص الافتراضية</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Content: Pending Submissions & Live Student Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Submissions Awaiting Teacher's Grade */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submissions Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">الواجبات المسلّمة حديثًا</h3>
                  <p className="text-[11px] text-slate-500">راجع حلول الطلاب وصور الإجابة ورصد الدرجات من 100</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('assignments')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                عرض كل الواجبات
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <p>لا توجد تسليمات حتى الآن</p>
                <button
                  type="button"
                  onClick={onOpenAddAssignment}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 transition"
                >
                  + إضافة واجب جديد للطلاب
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {submissions.slice(0, 4).map((sub) => {
                  const assign = assignments.find((a) => a.id === sub.assignmentId);
                  const isPending = sub.status === 'submitted';

                  return (
                    <div key={sub.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {sub.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{sub.studentName}</span>
                            {isPending ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                بانتظار التصحيح
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>تم التصحيح: {sub.score}/100</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 mt-1 line-clamp-1">
                            {assign?.title || 'واجب'}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>وقت التسليم: {new Date(sub.submittedAt).toLocaleDateString('ar-SA')}</span>
                            {sub.solutionImageUrl && (
                              <span className="text-blue-600 font-semibold">• يتضمن صورة مرفقة للحل</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onOpenGrading(sub.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isPending
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isPending ? 'تصحيح ورصد الدرجة' : 'عرض التفاصيل'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Live Sessions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">الدروس المباشرة القادمة</h3>
                  <p className="text-[11px] text-slate-500">جلسات Google Meet و Zoom المجدولة مع الطلاب</p>
                </div>
              </div>
              <button
                onClick={onOpenAddLive}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
              >
                + جدولة جلسة
              </button>
            </div>

            {liveLessons.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">لا توجد دروس مباشرة مجدولة</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {liveLessons.map((live) => (
                  <div
                    key={live.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            live.platform === 'google_meet'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {live.platform === 'google_meet' ? 'Google Meet' : 'Zoom'}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{live.date} • {live.time}</span>
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{live.title}</h4>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">{live.durationMinutes} دقيقة</span>
                      <a
                        href={live.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors flex items-center gap-1"
                      >
                        <span>فتح الرابط</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Student Activity Stream & Presence */}
        <div className="space-y-6">
          {/* Online Students List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-bold text-slate-900">الطلاب المتواجدون الآن</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {onlineStudents.length} متصل
              </span>
            </div>

            {students.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                لم يتم إضافة طلاب بعد
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                {students.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {s.avatar ? (
                            <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            s.name.charAt(0)
                          )}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            s.isOnline && s.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{s.name}</span>
                          {!s.isActive && (
                            <span className="text-[9px] px-1 bg-red-100 text-red-700 rounded-sm">معطل</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{s.sectionId || 'شعبة أ'}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.isOnline && s.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.isOnline && s.isActive ? 'متصل الآن' : 'غير متصل'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveTab('students')}
              className="w-full mt-3 py-2 text-center text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
            >
              عرض وتعديل قائمة الطلاب الكاملة
            </button>
          </div>

          {/* Real-time Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">سجل نشاط الطلاب المباشر</h3>
                  <p className="text-[11px] text-slate-500">رصد لحظي لتسليم الواجبات وفتح الدروس</p>
                </div>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                لا يوجد نشاط مسجل حتى الآن
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:right-3.5 before:w-0.5 before:bg-slate-100">
                {activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="relative flex items-start gap-3 text-xs pr-1">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-indigo-500 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                      •
                    </div>
                    <div className="flex-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{act.studentName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{act.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveTab('activities')}
              className="w-full mt-3 py-2 text-center text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              عرض السجل الكامل لجميع الأنشطة
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Profile & Cover Modal */}
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
