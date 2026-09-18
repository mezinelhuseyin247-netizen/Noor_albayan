import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentActivity } from '../../types';
import {
  Activity,
  Search,
  Filter,
  FileCheck2,
  BookOpen,
  LogIn,
  LogOut,
  Video,
  Eye,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { activities, students } = useApp();

  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities.filter((act) => {
    const matchStudent = selectedStudentFilter === 'all' || act.studentId === selectedStudentFilter;
    const matchType = selectedTypeFilter === 'all' || act.type === selectedTypeFilter;
    const matchSearch =
      act.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.details.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStudent && matchType && matchSearch;
  });

  const getActivityIcon = (type: StudentActivity['type']) => {
    switch (type) {
      case 'submit_assignment':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'open_assignment':
        return <Eye className="w-4 h-4 text-amber-600" />;
      case 'view_lesson':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'join_live':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'login':
        return <LogIn className="w-4 h-4 text-teal-600" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-slate-400" />;
      default:
        return <Activity className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getActivityBadge = (type: StudentActivity['type']) => {
    switch (type) {
      case 'submit_assignment':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">تسليم واجب</span>;
      case 'open_assignment':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">فتح واجب</span>;
      case 'view_lesson':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">مشاهدة درس</span>;
      case 'join_live':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">انضمام لبث</span>;
      case 'login':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">دخول للمنصة</span>;
      case 'logout':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">تسجيل خروج</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">نشاط</span>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">سجل نشاط وتفاعل الطلاب</h2>
              <p className="text-xs text-slate-500">
                متابعة دقيقة ولحظية لجميع تحركات الطلاب من فتح الواجبات وتسليمها والدخول للمنصة
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو النشاط..."
            className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Student Filter */}
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-hidden"
          >
            <option value="all">جميع الطلاب ({students.length})</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Activity Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-hidden"
          >
            <option value="all">جميع أنواع الأنشطة</option>
            <option value="submit_assignment">تسليم حل الواجبات</option>
            <option value="open_assignment">فتح صفحة الواجب</option>
            <option value="view_lesson">مشاهدة الدروس</option>
            <option value="login">تسجيل الدخول</option>
            <option value="logout">تسجيل الخروج</option>
          </select>
        </div>
      </div>

      {/* Activities Timeline Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">لا توجد أنشطة مسجلة وفق الفلتر الحالي</div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                  {getActivityIcon(act.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{act.studentName}</span>
                      {getActivityBadge(act.type)}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(act.timestamp).toLocaleString('ar-SA')}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
