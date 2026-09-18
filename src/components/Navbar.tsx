import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Bell,
  LogOut,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Video,
  Calendar as CalendarIcon,
  CalendarDays,
  Activity,
  Image as ImageIcon,
  User as UserIcon,
  Award,
} from 'lucide-react';
import { OpenBookArabicIcon } from './Common/OpenBookArabicLogo';
import { UserProfileModal } from './Modals/UserProfileModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs?: { id: string; label: string; icon: any; count?: number }[];
  onOpenAddStudent?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, tabs: customTabs, onOpenAddStudent }) => {
  const {
    currentUser,
    users,
    students,
    assignments,
    submissions,
    exams,
    examSubmissions,
    liveLessons,
    logout,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isOnlineSynced,
    syncStatus,
    forceServerSync,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await forceServerSync();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Derive default tabs based on role if not passed
  const isTeacher = currentUser?.role === 'teacher';

  const pendingGradingCount = submissions.filter((s) => s.status === 'submitted').length;
  const pendingStudentAssignments = !isTeacher
    ? assignments.filter((a) => {
        const hasSubmitted = submissions.some(
          (s) => s.assignmentId === a.id && s.studentId === currentUser?.id
        );
        return !hasSubmitted && (!currentUser?.classId || a.classId === currentUser.classId);
      }).length
    : 0;

  const defaultTeacherTabs = [
    { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'schedule', label: 'البرنامج الأسبوعي', icon: CalendarDays },
    { id: 'students', label: 'الطلاب والنشاط', icon: Users, count: students.length },
    { id: 'classes', label: 'الصفوف والمواد', icon: Building2 },
    { id: 'lessons', label: 'الدروس التعليمية', icon: BookOpen },
    { id: 'assignments', label: 'الواجبات والتصحيح', icon: FileText, count: pendingGradingCount },
    { id: 'exams', label: 'الامتحانات', icon: Award, count: exams.length },
    { id: 'live', label: 'البث المباشر', icon: Video, count: liveLessons.length },
    { id: 'calendar', label: 'التقويم والمواعيد', icon: CalendarIcon },
    { id: 'activity', label: 'سجل النشاط', icon: Activity },
  ];

  const defaultStudentTabs = [
    { id: 'overview', label: 'لوحتي', icon: LayoutDashboard },
    { id: 'schedule', label: 'البرنامج الأسبوعي', icon: CalendarDays },
    { id: 'lessons', label: 'الدروس والمذكرات', icon: BookOpen },
    { id: 'assignments', label: 'واجباتي', icon: FileText, count: pendingStudentAssignments },
    { id: 'exams', label: 'الامتحانات', icon: Award },
    { id: 'live', label: 'البث المباشر', icon: Video, count: liveLessons.length },
    { id: 'calendar', label: 'التقويم والمواعيد', icon: CalendarIcon },
    { id: 'activity', label: 'سجل إنجازاتي', icon: Activity },
  ];

  const navTabs = customTabs || (isTeacher ? defaultTeacherTabs : defaultStudentTabs);

  // Filter notifications for current user
  const userNotifs = notifications.filter(
    n => n.userId === 'all' || n.userId === currentUser?.id || (currentUser?.role === 'teacher' && n.userId === 'teacher-1')
  );
  const unreadCount = userNotifs.filter(n => !n.read).length;

  const onlineStudentsCount = students.filter(s => s.isOnline && s.isActive).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" dir="rtl">
      {/* Top Notification Bar / Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-300">مزامنة سحابية أونلاين:</span>
            <span className="text-slate-200">
              {syncStatus === 'syncing' ? 'جاري المزامنة...' : 'متصل بالخادم السحابي'} • الطلاب النشطون الآن: <strong className="text-emerald-300 font-bold">{onlineStudentsCount}</strong> من أصل {students.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualSync}
              className="flex items-center gap-1 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer text-[11px]"
              title="تحديث ومزامنة فورية مع الخادم"
            >
              <RotateCcw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>مزامنة فورية</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="text-slate-400 text-[11px] hidden md:inline">يعمل عبر الهاتف، التابلت، والكمبيوتر</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 flex items-center justify-center text-amber-300 shadow-md shadow-emerald-900/20 ring-1 ring-emerald-400/40 shrink-0">
              <OpenBookArabicIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
                  نور <span className="text-emerald-700">البيان</span>
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  أ • ب • ت • ث
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">
                  {currentUser?.role === 'teacher' ? 'لوحة المعلم' : 'بوابة الطالب'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">المنصة التعليمية العربية الموحدة</p>
            </div>
          </div>

          {/* User Controls & Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="الإشعارات والتنبيهات"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div
                  className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">التنبيهات والإشعارات ({userNotifs.length})</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-emerald-600 hover:underline cursor-pointer"
                      >
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {userNotifs.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">لا توجد إشعارات جديدة</div>
                    ) : (
                      userNotifs.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.linkTab) setActiveTab(n.linkTab);
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">منذ قليل</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Profile Pill (clickable to edit avatar and cover) */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 sm:border-r sm:border-slate-200 sm:pr-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 transition group text-right cursor-pointer"
                  title="تعديل الملف الشخصي والصورة والغلاف"
                >
                  <div className="relative">
                    <div
                      className={`w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-white shadow-xs border border-emerald-400/40 ${
                        currentUser.role === 'teacher'
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                          : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                      }`}
                    >
                      {currentUser.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http')) ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        currentUser.name.charAt(0)
                      )}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        currentUser.isActive && currentUser.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                      title={currentUser.isOnline ? 'متصل الآن' : 'غير متصل'}
                    />
                  </div>

                  <div className="hidden md:block">
                    <div className="text-xs font-bold text-slate-800 leading-none group-hover:text-emerald-700 transition">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <span>{currentUser.role === 'teacher' ? 'معلم ومشرف' : `${currentUser.sectionId || 'طالب'}`}</span>
                      <ImageIcon className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="تسجيل الخروج (يبقى حسابك وتقدمك محفوظًا)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Navigation Toggle */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Horizontal Navigation Tabs */}
      <div className="hidden md:block border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-reverse space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                setShowProfileModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 mb-2 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>تعديل الصورة الشخصية والغلاف ({currentUser.name})</span>
            </button>
          )}

          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* User Profile & Cover Modal */}
      {currentUser && (
        <UserProfileModal
          user={currentUser}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </header>
  );
};
