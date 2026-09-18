import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DayOfWeek, WeeklyScheduleItem } from '../../types';
import {
  CalendarDays,
  Clock,
  BookOpen,
  User,
  GraduationCap,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

const COLOR_MAP: Record<string, { bg: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-50 text-emerald-900 border-emerald-300', badge: 'bg-emerald-600 text-white' },
  blue: { bg: 'bg-blue-50 text-blue-900 border-blue-300', badge: 'bg-blue-600 text-white' },
  indigo: { bg: 'bg-indigo-50 text-indigo-900 border-indigo-300', badge: 'bg-indigo-600 text-white' },
  amber: { bg: 'bg-amber-50 text-amber-900 border-amber-300', badge: 'bg-amber-600 text-white' },
  purple: { bg: 'bg-purple-50 text-purple-900 border-purple-300', badge: 'bg-purple-600 text-white' },
  rose: { bg: 'bg-rose-50 text-rose-900 border-rose-300', badge: 'bg-rose-600 text-white' },
  teal: { bg: 'bg-teal-50 text-teal-900 border-teal-300', badge: 'bg-teal-600 text-white' },
};

export const StudentWeeklySchedule: React.FC = () => {
  const { weeklySchedule, classes, currentUser } = useApp();

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map JS getDay() to Arabic DayOfWeek
  const getTodayArabic = (): DayOfWeek => {
    const dayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    const mapping: DayOfWeek[] = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return mapping[dayIndex] || 'الأحد';
  };

  const todayArabic = getTodayArabic();

  // Find Student's Class info
  const studentClass = classes.find((c) => c.id === currentUser?.classId);
  const className = studentClass ? studentClass.name : 'الصف الأول الثانوي';
  const sectionName = currentUser?.sectionId || 'شعبة أ';

  // Strictly filter schedule for the current student's class and section only
  const studentSchedule = useMemo(() => {
    return weeklySchedule.filter((item) => {
      // Must match student's class
      if (currentUser?.classId && item.classId !== currentUser.classId) {
        return false;
      }
      // Must match student's section if specified
      if (currentUser?.sectionId && item.sectionId !== currentUser.sectionId) {
        return false;
      }

      if (selectedDayFilter !== 'all' && item.day !== selectedDayFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubj = item.subjectName.toLowerCase().includes(q);
        const matchTeacher = item.teacherName.toLowerCase().includes(q);
        const matchLesson = item.lessonTitle?.toLowerCase().includes(q) || false;
        if (!matchSubj && !matchTeacher && !matchLesson) return false;
      }

      return true;
    });
  }, [weeklySchedule, currentUser, selectedDayFilter, searchQuery]);

  // Group by Day
  const scheduleByDay = useMemo(() => {
    const map: Record<DayOfWeek, WeeklyScheduleItem[]> = {
      'الأحد': [],
      'الاثنين': [],
      'الثلاثاء': [],
      'الأربعاء': [],
      'الخميس': [],
      'الجمعة': [],
      'السبت': [],
    };

    studentSchedule.forEach((item) => {
      if (map[item.day]) {
        map[item.day].push(item);
      }
    });

    // Sort by start time
    Object.keys(map).forEach((dayKey) => {
      map[dayKey as DayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return map;
  }, [studentSchedule]);

  const getColorTheme = (colorName?: string) => {
    return COLOR_MAP[colorName || 'emerald'] || COLOR_MAP.emerald;
  };

  const totalClassesCount = studentSchedule.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">البرنامج الأسبوعي الخاص بك</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {className} • {sectionName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              مواعيد الحصص الدراسية والمواد وأسماء المعلمين الخاصة بصفك وشعبتك طوال أيام الأسبوع.
            </p>
          </div>
        </div>

        {/* Today Indicator */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-900">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold">اليوم: {todayArabic}</div>
            <div className="text-[11px] text-emerald-700">
              {scheduleByDay[todayArabic]?.length || 0} حصص مقررة اليوم
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المادة أو المعلم..."
              className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Stats */}
          <div className="text-xs text-slate-500 font-medium">
            إجمالي الحصص المعروضة: <strong className="text-slate-800 font-bold">{totalClassesCount}</strong>
          </div>
        </div>

        {/* Day Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-500 ml-2 shrink-0">اختر اليوم:</span>
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedDayFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            كل الأسبوع
          </button>
          {DAYS_OF_WEEK.map((day) => {
            const count = weeklySchedule.filter(
              (s) =>
                s.day === day &&
                (!currentUser?.classId || s.classId === currentUser.classId) &&
                (!currentUser?.sectionId || s.sectionId === currentUser.sectionId)
            ).length;
            const isSelected = selectedDayFilter === day;
            const isToday = day === todayArabic;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDayFilter(day)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : isToday
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{day}</span>
                {isToday && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timetable Display */}
      <div className="space-y-6">
        {DAYS_OF_WEEK.map((day) => {
          if (selectedDayFilter !== 'all' && selectedDayFilter !== day) return null;

          const dayItems = scheduleByDay[day];
          const isToday = day === todayArabic;

          return (
            <div
              key={day}
              className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition-all ${
                isToday ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              {/* Day Header */}
              <div
                className={`px-5 py-3.5 border-b flex items-center justify-between ${
                  isToday ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isToday ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {day.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">يوم {day}</h2>
                      {isToday && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                          اليوم الحالي
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {dayItems.length === 0 ? 'لا توجد حصص في هذا اليوم' : `${dayItems.length} حصص مقررة`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Day Cards Grid */}
              {dayItems.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-slate-500">لا توجد حصص مجدولة لصفك في يوم {day}.</p>
                </div>
              ) : (
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayItems.map((item, idx) => {
                    const theme = getColorTheme(item.color);
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-4 transition-all hover:shadow-md ${theme.bg}`}
                      >
                        {/* Time & Class Number */}
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-black/10">
                          <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span>{item.startTime} - {item.endTime}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${theme.badge}`}>
                            الحصة {idx + 1}
                          </span>
                        </div>

                        {/* Subject */}
                        <div className="mb-3">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                            <span>{item.subjectName}</span>
                          </h3>
                          {item.lessonTitle && (
                            <p className="text-xs text-slate-700 mt-1 font-medium bg-white/70 px-2 py-1 rounded-md">
                              موضوع الدرس: {item.lessonTitle}
                            </p>
                          )}
                        </div>

                        {/* Teacher & Location */}
                        <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>المعلم: <strong className="text-slate-900 font-bold">{item.teacherName}</strong></span>
                          </div>
                          {item.roomOrLink && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>المكان: {item.roomOrLink}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
