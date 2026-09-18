import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LiveLesson } from '../../types';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  CheckCircle2,
  Trash2,
  Sparkles,
  Link,
  Radio,
  Play,
} from 'lucide-react';

interface LiveLessonsTeacherProps {
  onOpenAddLive: () => void;
}

export const LiveLessonsTeacher: React.FC<LiveLessonsTeacherProps> = ({ onOpenAddLive }) => {
  const { liveLessons, classes, subjects, updateLiveLessonStatus, deleteLiveLesson } = useApp();

  const handleStartLive = (live: LiveLesson) => {
    updateLiveLessonStatus(live.id, 'live');
    window.open(live.meetingUrl, '_blank');
  };

  const handleEndLive = (live: LiveLesson) => {
    updateLiveLessonStatus(live.id, 'completed');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">الدروس المباشرة والبث التفاعلي</h2>
              <p className="text-xs text-slate-500">
                جدولة وإدارة الحصص الافتراضية عبر Google Meet و Zoom وإرسال الروابط والمواعيد للطلاب
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddLive}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ نشر درس أونلاين جديد</span>
        </button>
      </div>

      {/* Live Sessions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {liveLessons.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            لا توجد دروس مباشرة مجدولة. انقر على "+ جدولة درس مباشر جديد" للبدء.
          </div>
        ) : (
          liveLessons.map((live) => {
            const subj = subjects.find((s) => s.id === live.subjectId);
            const cls = classes.find((c) => c.id === live.classId);
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
                  {/* Platform & Status Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          live.platform === 'google_meet'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {live.platform === 'google_meet' ? 'Google Meet' : 'Zoom Cloud Meetings'}
                      </span>

                      {isLiveNow && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>البث جارٍ الآن</span>
                        </span>
                      )}

                      {live.status === 'completed' && (
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          مكتمل
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {live.durationMinutes} دقيقة
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">{live.title}</h3>
                  {live.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {live.description}
                    </p>
                  )}

                  {/* Meeting Meta Box */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">المادة والصف:</span>
                      <span className="font-bold text-slate-800">
                        {subj?.name} • {cls?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">الموعد والتاريخ:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{live.date}</span>
                        <Clock className="w-3 h-3 text-slate-400 mr-1" />
                        <span>{live.time}</span>
                      </span>
                    </div>

                    {live.meetingId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">معرف الجلسة / الرمز:</span>
                        <span className="font-mono font-bold text-slate-700">{live.meetingId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meeting Link Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('هل تريد حذف هذه الجلسة المباشرة؟')) {
                        deleteLiveLesson(live.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="حذف الجلسة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {isLiveNow ? (
                      <>
                        <a
                          href={live.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <Video className="w-4 h-4" />
                          <span>دخول البث المباشر</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleEndLive(live)}
                          className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          إنهاء البث
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartLive(live)}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>بدء البث ودخول الرابط</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
