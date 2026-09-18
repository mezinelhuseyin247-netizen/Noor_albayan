import React from 'react';
import { useApp } from '../../context/AppContext';
import { LiveLesson } from '../../types';
import {
  Video,
  Calendar,
  Clock,
  ArrowUpRight,
  Radio,
  CheckCircle2,
  Users,
  Sparkles,
} from 'lucide-react';

export const StudentLiveSessions: React.FC = () => {
  const { currentUser, liveLessons, subjects, classes, logActivity } = useApp();

  const handleJoinLive = (live: LiveLesson) => {
    logActivity('join_live', `انضم إلى حصة البث المباشر: ${live.title}`, live.id);
    window.open(live.meetingUrl, '_blank');
  };

  // Filter lessons for the student's class (or all classes if not assigned or for all)
  const studentLiveLessons = liveLessons.filter((l) => {
    if (!currentUser?.classId) return true;
    return !l.classId || l.classId === currentUser.classId || l.classId === 'all';
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">الدروس المباشرة والبث التفاعلي</h2>
            <p className="text-xs text-slate-500">
              انضم إلى الحصص الافتراضية عبر Google Meet و Zoom للتفاعل المباشر مع معلمك وزملائك
            </p>
          </div>
        </div>
      </div>

      {/* Live Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {studentLiveLessons.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            لا توجد دروس مباشرة مجدولة لصفك حاليًا
          </div>
        ) : (
          studentLiveLessons.map((live) => {
            const subj = subjects.find((s) => s.id === live.subjectId);
            const isLiveNow = live.status === 'live';

            return (
              <div
                key={live.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  isLiveNow
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 shadow-2xs hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        live.platform === 'google_meet'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {live.platform === 'google_meet' ? 'Google Meet' : 'Zoom'}
                    </span>

                    {isLiveNow && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>البث جارٍ الآن!</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">{live.title}</h3>
                  {live.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {live.description}
                    </p>
                  )}

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">المقرر والمعلم:</span>
                      <span className="font-bold text-slate-800">
                        {subj?.name} ({live.teacherName})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">الموعد والوقت:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{live.date} • {live.time}</span>
                      </span>
                    </div>

                    {/* Direct Meeting Link display */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">رابط الدخول المباشر:</span>
                      <a
                        href={live.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] font-bold text-teal-600 hover:text-teal-700 underline truncate max-w-[200px]"
                        dir="ltr"
                      >
                        {live.meetingUrl}
                      </a>
                    </div>

                    {live.meetingId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">معرف الجلسة / كلمة السر:</span>
                        <span className="font-mono font-bold text-slate-800">{live.meetingId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">المدة: {live.durationMinutes} دقيقة</span>
                  <button
                    type="button"
                    onClick={() => handleJoinLive(live)}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <Video className="w-4 h-4" />
                    <span>انضمام إلى الحصة</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
