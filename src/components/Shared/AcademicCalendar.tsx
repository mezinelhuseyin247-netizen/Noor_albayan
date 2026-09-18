import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Filter,
  Layers,
  BookOpen,
} from 'lucide-react';

interface AcademicCalendarProps {
  onOpenAddAssignment?: () => void;
  onOpenAddLive?: () => void;
  onOpenSolveAssignment?: (assignmentId: string) => void;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  onOpenAddAssignment,
  onOpenAddLive,
  onOpenSolveAssignment,
}) => {
  const { currentUser, assignments, liveLessons, submissions, subjects, classes } = useApp();
  const isTeacher = currentUser?.role === 'teacher';

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [filterType, setFilterType] = useState<'all' | 'assignments' | 'live'>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const monthNamesArabic = [
    'يناير (كانون الثاني)',
    'فبراير (شباط)',
    'مارس (آذار)',
    'أبريل (نيسان)',
    'مايو (أيار)',
    'يونيو (حزيران)',
    'يوليو (تموز)',
    'أغسطس (آب)',
    'سبتمبر (أيلول)',
    'أكتوبر (تشرين الأول)',
    'نوفمبر (تشرين الثاني)',
    'ديسمبر (كانون الأول)',
  ];

  const daysOfWeekArabic = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(1);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(1);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.getDate());
  };

  // Compile calendar events from assignments and liveLessons
  interface CalendarEvent {
    id: string;
    type: 'assignment' | 'live';
    title: string;
    subjectName: string;
    className: string;
    dateStr: string; // YYYY-MM-DD
    day: number;
    month: number;
    year: number;
    timeStr: string;
    details: any;
  }

  const events: CalendarEvent[] = [];

  // 1. Assignments (filtered by student class if student)
  assignments.forEach((asg) => {
    if (!isTeacher && currentUser?.classId && asg.classId !== currentUser.classId) {
      return;
    }
    if (selectedSubjectId !== 'all' && asg.subjectId !== selectedSubjectId) {
      return;
    }

    const d = new Date(asg.dueDate);
    if (!isNaN(d.getTime())) {
      events.push({
        id: `asg-${asg.id}`,
        type: 'assignment',
        title: asg.title,
        subjectName: subjects.find((s) => s.id === asg.subjectId)?.name || 'مادة دراسية',
        className: classes.find((c) => c.id === asg.classId)?.name || 'عام',
        dateStr: asg.dueDate,
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        timeStr: asg.dueTime || '23:59',
        details: asg,
      });
    }
  });

  // 2. Live Lessons
  liveLessons.forEach((live) => {
    if (!isTeacher && currentUser?.classId && live.classId !== currentUser.classId) {
      return;
    }
    if (selectedSubjectId !== 'all' && live.subjectId !== selectedSubjectId) {
      return;
    }

    const d = new Date(live.date);
    if (!isNaN(d.getTime())) {
      events.push({
        id: `live-${live.id}`,
        type: 'live',
        title: live.title,
        subjectName: subjects.find((s) => s.id === live.subjectId)?.name || 'مادة دراسية',
        className: classes.find((c) => c.id === live.classId)?.name || 'عام',
        dateStr: live.date,
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        timeStr: live.time || '17:00',
        details: live,
      });
    }
  });

  // Filter events for the current displayed month
  const monthEvents = events.filter(
    (ev) =>
      ev.year === currentYear &&
      ev.month === currentMonth &&
      (filterType === 'all' || (filterType === 'assignments' && ev.type === 'assignment') || (filterType === 'live' && ev.type === 'live'))
  );

  // Events on selected day
  const selectedDayEvents = monthEvents.filter((ev) => ev.day === selectedDay);

  const isToday = (dayNum: number) => {
    const today = new Date();
    return today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === dayNum;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 font-sans">التقويم الأكاديمي والمواعيد</h1>
          </div>
          <p className="text-xs text-slate-500">
            متابعة مواعيد تسليم الواجبات، حصص البث المباشر (Google Meet & Zoom)، والأنشطة المجدولة بدقة.
          </p>
        </div>

        {/* Actions for teacher */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {isTeacher && onOpenAddAssignment && (
            <button
              onClick={onOpenAddAssignment}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة واجب جديد</span>
            </button>
          )}

          {isTeacher && onOpenAddLive && (
            <button
              onClick={onOpenAddLive}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>جدولة بث مباشر</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Month Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Month controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 text-slate-600 transition-all cursor-pointer"
              title="الشهر التالي"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-4 py-1 font-bold text-sm text-slate-900 font-sans min-w-40 text-center">
              {monthNamesArabic[currentMonth]} {currentYear}
            </span>
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 text-slate-600 transition-all cursor-pointer"
              title="الشهر السابق"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            اليوم الحالي
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-hidden"
            >
              <option value="all">جميع المواد الدراسية</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Filter Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({monthEvents.length})
            </button>
            <button
              onClick={() => setFilterType('assignments')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                filterType === 'assignments' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>واجبات</span>
            </button>
            <button
              onClick={() => setFilterType('live')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                filterType === 'live' ? 'bg-white text-teal-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>بث مباشر</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Grid (Right) & Selected Day Event List (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Days Matrix (2 cols on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-bold text-slate-500">
            {daysOfWeekArabic.map((dayName, idx) => (
              <div key={idx} className="py-1.5 bg-slate-50 rounded-lg">
                {dayName}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots before month starts */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 p-1.5 bg-slate-50/40 rounded-xl border border-dashed border-slate-100" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dayEvs = monthEvents.filter((ev) => ev.day === dayNumber);
              const isSelected = selectedDay === dayNumber;
              const isCurrent = isToday(dayNumber);

              return (
                <div
                  key={`day-${dayNumber}`}
                  onClick={() => setSelectedDay(dayNumber)}
                  className={`min-h-24 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : isCurrent
                      ? 'bg-amber-50/30 border-amber-300 hover:border-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                        isCurrent
                          ? 'bg-amber-500 text-white'
                          : isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {dayEvs.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayEvs.length} {dayEvs.length === 1 ? 'حدث' : 'أحداث'}
                      </span>
                    )}
                  </div>

                  {/* Day Mini Badges */}
                  <div className="mt-1.5 space-y-1 overflow-hidden">
                    {dayEvs.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded-md font-semibold ${
                          ev.type === 'assignment'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-teal-100 text-teal-800 border border-teal-200'
                        }`}
                        title={`${ev.title} - ${ev.subjectName}`}
                      >
                        {ev.type === 'assignment' ? '📝 ' : '🎥 '}
                        {ev.title}
                      </div>
                    ))}
                    {dayEvs.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-500 text-center">
                        +{dayEvs.length - 2} المزيد
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda & Action Details (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase">تفاصيل اليوم المحدد</span>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedDay} {monthNamesArabic[currentMonth]} {currentYear}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {selectedDayEvents.length} مناسبات
              </span>
            </div>

            {/* List of items on selected day */}
            {selectedDayEvents.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-medium">لا توجد واجبات أو حصص مباشرة مسجلة في هذا اليوم.</p>
                {isTeacher && (
                  <p className="text-[11px] text-slate-400">يمكنك جدولة واجب أو حصة بث مباشر من الأزرار بالأعلى.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((ev) => {
                  const isAssignment = ev.type === 'assignment';
                  const asg = isAssignment ? ev.details : null;
                  const live = !isAssignment ? ev.details : null;

                  // If student, check if this assignment is solved
                  const studentSubmission =
                    !isTeacher && asg ? submissions.find((s) => s.assignmentId === asg.id && s.studentId === currentUser?.id) : null;

                  return (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isAssignment ? 'bg-emerald-50/40 border-emerald-200' : 'bg-teal-50/40 border-teal-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg ${
                              isAssignment ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {isAssignment ? <FileText className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                          </span>
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              {ev.subjectName} • {ev.className}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 mt-1">{ev.title}</h4>
                          </div>
                        </div>

                        <div className="text-left">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{ev.timeStr}</span>
                          </span>
                        </div>
                      </div>

                      {/* Assignment Action for Student */}
                      {!isTeacher && isAssignment && asg && (
                        <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between">
                          {studentSubmission ? (
                            <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                تم التسليم {studentSubmission.status === 'graded' ? `(الدرجة: ${studentSubmission.grade}/100)` : '(قيد التصحيح)'}
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenSolveAssignment && onOpenSolveAssignment(asg.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              حل وتسليم الواجب الآن
                            </button>
                          )}
                        </div>
                      )}

                      {/* Live Lesson Join Link */}
                      {!isAssignment && live && (
                        <div className="mt-3 pt-3 border-t border-teal-200/60 flex items-center justify-between">
                          <span className="text-xs text-teal-800 font-semibold">
                            المنصة: {live.platform === 'google_meet' ? 'Google Meet' : live.platform === 'zoom' ? 'Zoom' : 'لقاء مباشر'}
                          </span>
                          <a
                            href={live.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <span>دخول الحصة المباشرة</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Summary Card */}
          <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700 shadow-xs">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>إجمالي المواعيد لشهر {monthNamesArabic[currentMonth].split(' ')[0]}</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-[11px] mb-1">الواجبات المجدولة</div>
                <div className="text-xl font-bold text-emerald-400">
                  {monthEvents.filter((e) => e.type === 'assignment').length}
                </div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-[11px] mb-1">حصص البث المباشر</div>
                <div className="text-xl font-bold text-teal-400">
                  {monthEvents.filter((e) => e.type === 'live').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
