import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WeeklyScheduleItem, DayOfWeek } from '../../types';
import {
  CalendarDays,
  Plus,
  Clock,
  BookOpen,
  User,
  GraduationCap,
  Building2,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckCircle2,
  X,
  MapPin,
  Calendar,
  Sparkles,
  Layers,
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

const COLOR_OPTIONS = [
  { id: 'emerald', name: 'أخضر زمردي', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  { id: 'blue', name: 'أزرق سماوي', bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
  { id: 'indigo', name: 'نيلي ملكي', bg: 'bg-indigo-50 text-indigo-800 border-indigo-300', dot: 'bg-indigo-500' },
  { id: 'amber', name: 'كهرماني ذهبي', bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  { id: 'purple', name: 'بنفسجي أنيق', bg: 'bg-purple-50 text-purple-800 border-purple-300', dot: 'bg-purple-500' },
  { id: 'rose', name: 'وردي لطيف', bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  { id: 'teal', name: 'تيل بحري', bg: 'bg-teal-50 text-teal-800 border-teal-300', dot: 'bg-teal-500' },
];

export const WeeklyScheduleManager: React.FC = () => {
  const {
    weeklySchedule,
    classes,
    subjects,
    currentUser,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
  } = useApp();

  // Filter States
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WeeklyScheduleItem | null>(null);

  // Form State
  const [formDay, setFormDay] = useState<DayOfWeek>('الأحد');
  const [formStartTime, setFormStartTime] = useState<string>('08:00');
  const [formEndTime, setFormEndTime] = useState<string>('08:45');
  const [formClassId, setFormClassId] = useState<string>(classes[0]?.id || 'class-1');
  const [formSectionId, setFormSectionId] = useState<string>(classes[0]?.sections[0] || 'شعبة أ');
  const [formSubjectId, setFormSubjectId] = useState<string>(subjects[0]?.id || 'subj-1');
  const [formLessonTitle, setFormLessonTitle] = useState<string>('');
  const [formTeacherName, setFormTeacherName] = useState<string>(currentUser?.name || 'أ. إبراهيم المنصوري');
  const [formRoomOrLink, setFormRoomOrLink] = useState<string>('قاعة ١٠١ - المبنى الرئيسي');
  const [formColor, setFormColor] = useState<string>('emerald');

  // Available sections for chosen class in form
  const currentFormClass = classes.find((c) => c.id === formClassId);
  const availableSections = currentFormClass?.sections || ['شعبة أ', 'شعبة ب'];

  const openAddModal = (presetDay?: DayOfWeek) => {
    setEditingItem(null);
    setFormDay(presetDay || 'الأحد');
    setFormStartTime('08:00');
    setFormEndTime('08:45');
    setFormClassId(classes[0]?.id || 'class-1');
    setFormSectionId(classes[0]?.sections[0] || 'شعبة أ');
    setFormSubjectId(subjects[0]?.id || 'subj-1');
    setFormLessonTitle('');
    setFormTeacherName(currentUser?.name || 'أ. إبراهيم المنصوري');
    setFormRoomOrLink('قاعة ١٠١');
    setFormColor('emerald');
    setIsModalOpen(true);
  };

  const openEditModal = (item: WeeklyScheduleItem) => {
    setEditingItem(item);
    setFormDay(item.day);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormClassId(item.classId);
    setFormSectionId(item.sectionId);
    setFormSubjectId(item.subjectId);
    setFormLessonTitle(item.lessonTitle || '');
    setFormTeacherName(item.teacherName);
    setFormRoomOrLink(item.roomOrLink || '');
    setFormColor(item.color || 'emerald');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSubj = subjects.find((s) => s.id === formSubjectId);
    const subjectName = selectedSubj ? selectedSubj.name : 'مادة دراسية';

    if (editingItem) {
      updateScheduleItem(editingItem.id, {
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        classId: formClassId,
        sectionId: formSectionId,
        subjectId: formSubjectId,
        subjectName,
        lessonTitle: formLessonTitle.trim() || undefined,
        teacherName: formTeacherName.trim(),
        roomOrLink: formRoomOrLink.trim() || undefined,
        color: formColor,
      });
    } else {
      addScheduleItem({
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        classId: formClassId,
        sectionId: formSectionId,
        subjectId: formSubjectId,
        subjectName,
        lessonTitle: formLessonTitle.trim() || undefined,
        teacherName: formTeacherName.trim(),
        roomOrLink: formRoomOrLink.trim() || undefined,
        color: formColor,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف حصة "${name}" من الجدول؟`)) {
      deleteScheduleItem(id);
    }
  };

  // Filtered Schedule
  const filteredSchedule = useMemo(() => {
    return weeklySchedule.filter((item) => {
      if (selectedDayFilter !== 'all' && item.day !== selectedDayFilter) return false;
      if (selectedClassFilter !== 'all' && item.classId !== selectedClassFilter) return false;
      if (selectedSectionFilter !== 'all' && item.sectionId !== selectedSectionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubj = item.subjectName.toLowerCase().includes(q);
        const matchTeacher = item.teacherName.toLowerCase().includes(q);
        const matchLesson = item.lessonTitle?.toLowerCase().includes(q) || false;
        const matchRoom = item.roomOrLink?.toLowerCase().includes(q) || false;
        if (!matchSubj && !matchTeacher && !matchLesson && !matchRoom) return false;
      }
      return true;
    });
  }, [weeklySchedule, selectedDayFilter, selectedClassFilter, selectedSectionFilter, searchQuery]);

  // Group by Day for ordered schedule presentation
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

    filteredSchedule.forEach((item) => {
      if (map[item.day]) {
        map[item.day].push(item);
      }
    });

    // Sort items within each day by start time
    Object.keys(map).forEach((dayKey) => {
      map[dayKey as DayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return map;
  }, [filteredSchedule]);

  const getColorClasses = (colorName?: string) => {
    const found = COLOR_OPTIONS.find((c) => c.id === colorName);
    return found ? found.bg : 'bg-emerald-50 text-emerald-800 border-emerald-300';
  };

  const getClassName = (classId: string) => {
    const c = classes.find((cl) => cl.id === classId);
    return c ? c.name : classId;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">البرنامج الأسبوعي للحصص</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {weeklySchedule.length} حصة مجدولة
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              إدارة جدول الحصص الأسبوعي لجميع الصفوف والشعب، وتحديد أوقات البداية والنهاية والمواد والمعلمين بدقة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حصة جديدة</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالمادة، المعلم، أو القاعة..."
              className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Day Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">جميع أيام الأسبوع</option>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  يوم {d}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">جميع الصفوف الدراسية</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Layers className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">جميع الشعب</option>
              <option value="شعبة أ">شعبة أ</option>
              <option value="شعبة ب">شعبة ب</option>
              <option value="شعبة ج">شعبة ج</option>
            </select>
          </div>
        </div>

        {/* Quick Day Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-500 ml-2 shrink-0">التنقل السريع بالأيام:</span>
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
            const count = weeklySchedule.filter((s) => s.day === day).length;
            const isSelected = selectedDayFilter === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDayFilter(day)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{day}</span>
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

      {/* Main Weekly Schedule Display (Grouped by Days) */}
      <div className="space-y-6">
        {DAYS_OF_WEEK.map((day) => {
          // If filtering by specific day, skip others
          if (selectedDayFilter !== 'all' && selectedDayFilter !== day) return null;

          const dayItems = scheduleByDay[day];

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Day Header Banner */}
              <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {day.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">يوم {day}</h2>
                    <span className="text-xs text-slate-500">
                      {dayItems.length === 0 ? 'لا توجد حصص مسجلة' : `${dayItems.length} حصص مجدولة`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openAddModal(day)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة حصة لـ {day}</span>
                </button>
              </div>

              {/* Day Content */}
              {dayItems.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-slate-500">لا توجد حصص في هذا اليوم وفقًا للتصفية الحالية.</p>
                  <button
                    onClick={() => openAddModal(day)}
                    className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                  >
                    انقر هنا لإضافة أول حصة ليوم {day}
                  </button>
                </div>
              ) : (
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`relative rounded-xl border p-4 transition-all hover:shadow-md ${getColorClasses(
                        item.color
                      )}`}
                    >
                      {/* Top Row: Time & Order Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-black/10">
                        <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span>{item.startTime} - {item.endTime}</span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/80 shadow-2xs">
                          الحصة {idx + 1}
                        </span>
                      </div>

                      {/* Subject Name & Topic */}
                      <div className="mb-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                          <span>{item.subjectName}</span>
                        </h3>
                        {item.lessonTitle && (
                          <p className="text-xs text-slate-700 mt-1 font-medium bg-white/60 px-2 py-1 rounded-md">
                            الدرس: {item.lessonTitle}
                          </p>
                        )}
                      </div>

                      {/* Details: Class, Section, Teacher, Room */}
                      <div className="space-y-1 text-xs text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{getClassName(item.classId)} ({item.sectionId})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>المعلم: {item.teacherName}</span>
                        </div>
                        {item.roomOrLink && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>الموقع: {item.roomOrLink}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-2.5 border-t border-black/10 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          title="تعديل الحصة"
                        >
                          <Edit2 className="w-3 h-3 text-blue-600" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.subjectName)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white/90 hover:bg-red-50 text-red-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          title="حذف الحصة"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-linear-to-r from-emerald-700 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {editingItem ? 'تعديل حصة في البرنامج الأسبوعي' : 'إضافة حصة جديدة للبرنامج الأسبوعي'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Day Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر اليوم <span className="text-red-500">*</span>
                </label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      يوم {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    وقت بداية الحصة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    وقت نهاية الحصة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Class & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الصف الدراسي <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => {
                      const newClassId = e.target.value;
                      setFormClassId(newClassId);
                      const cls = classes.find((c) => c.id === newClassId);
                      if (cls && cls.sections.length > 0) {
                        setFormSectionId(cls.sections[0]);
                      }
                    }}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الشعبة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSectionId}
                    onChange={(e) => setFormSectionId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {availableSections.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المادة الدراسية <span className="text-red-500">*</span>
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code || s.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Topic (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان الدرس أو موضوع الحصة (اختياري)
                </label>
                <input
                  type="text"
                  value={formLessonTitle}
                  onChange={(e) => setFormLessonTitle(e.target.value)}
                  placeholder="مثال: أسلوب الاستثناء وتطبيقات الإعراب"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Teacher Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المعلم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  required
                  placeholder="مثال: أ. إبراهيم المنصوري"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Location or Room / Online link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  القاعة الدراسية أو رابط الحصة
                </label>
                <input
                  type="text"
                  value={formRoomOrLink}
                  onChange={(e) => setFormRoomOrLink(e.target.value)}
                  placeholder="مثال: قاعة ١٠١ - المبنى الرئيسي أو رابط البث"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  لون بطاقة الحصة
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormColor(c.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        formColor === c.id
                          ? 'border-slate-800 bg-slate-900 text-white font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? 'حفظ التعديلات' : 'إضافة الحصة للجدول'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
