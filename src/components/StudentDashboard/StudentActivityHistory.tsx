import React from 'react';
import { useApp } from '../../context/AppContext';
import { StudentActivity } from '../../types';
import {
  Activity,
  FileCheck2,
  BookOpen,
  LogIn,
  Video,
  Eye,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const StudentActivityHistory: React.FC = () => {
  const { activities, currentUser } = useApp();

  const myActivities = activities.filter((a) => a.studentId === currentUser?.id);

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
      default:
        return <Activity className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">سجل نشاطي وتفاعلي التعليمي</h2>
            <p className="text-xs text-slate-500">
              سجل تفصيلي لجميع الأنشطة التي قمت بها (حل وتسليم الواجبات، تصفح الدروس، دخول المنصة)
            </p>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
        {myActivities.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">لا توجد أنشطة مسجلة لحسابك حتى الآن</div>
        ) : (
          <div className="space-y-4">
            {myActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                  {getActivityIcon(act.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <span className="font-bold text-slate-900 text-xs">{act.details}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(act.timestamp).toLocaleString('ar-SA')}</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    تم الحفظ والمزامنة تلقائيًا في سجل متابعة المعلم
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
