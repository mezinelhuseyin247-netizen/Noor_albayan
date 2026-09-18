import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Video, Calendar, Clock, Link, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface AddLiveLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddLiveLessonModal: React.FC<AddLiveLessonModalProps> = ({ isOpen, onClose }) => {
  const { classes, subjects, currentUser, createLiveLesson } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'subj-1');
  const [classId, setClassId] = useState(classes[0]?.id || 'class-1');
  const [platform, setPlatform] = useState<'google_meet' | 'zoom' | 'teams'>('google_meet');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/abc-defg-hij');
  const [meetingId, setMeetingId] = useState('123-456-789');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('17:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlatformChange = (p: 'google_meet' | 'zoom' | 'teams') => {
    setPlatform(p);
    if (p === 'google_meet') {
      const code = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
      setMeetingUrl(`https://meet.google.com/${code}`);
      setMeetingId(code);
    } else if (p === 'zoom') {
      const id = Math.floor(100000000 + Math.random() * 900000000);
      setMeetingUrl(`https://zoom.us/j/${id}`);
      setMeetingId(`${id}`);
    } else {
      setMeetingUrl('https://teams.microsoft.com/l/meetup-join/...');
      setMeetingId('teams-meeting');
    }
  };

  const handlePublishDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !meetingUrl.trim() || isPublishing) return;

    setIsPublishing(true);

    try {
      const result = await createLiveLesson({
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId,
        classId,
        platform,
        meetingUrl: meetingUrl.trim(),
        meetingId: meetingId.trim() || undefined,
        date,
        time,
        durationMinutes: Number(durationMinutes) || 45,
        teacherName: currentUser?.name || 'المعلم',
        teacherId: currentUser?.id || 'teacher-1',
        status: 'upcoming',
      });

      if (result.success) {
        setSuccessMessage('تم نشر الدرس الأونلاين بنجاح');
        setTimeout(() => {
          setTitle('');
          setDescription('');
          setSuccessMessage(null);
          setIsPublishing(false);
          onClose();
        }, 1200);
      } else {
        alert(result.error || 'حدث خطأ أثناء نشر الدرس');
        setIsPublishing(false);
      }
    } catch (err) {
      console.error(err);
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">جدولة حصة بث مباشر جديدة</h3>
              <p className="text-[11px] text-slate-500">إعداد رابط اللقاء التفاعلي وتحديد موعد الجلسة</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Short Success Message Toast */}
        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-150">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handlePublishDirect} className="space-y-3.5 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">عنوان الحصة المباشرة *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مراجعة شاملة ليلة الاختبار مع حل النماذج"
              className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden font-semibold"
              required
            />
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">منصة الاجتماع *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePlatformChange('google_meet')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  platform === 'google_meet'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <span>Google Meet</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlatformChange('zoom')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  platform === 'zoom'
                    ? 'bg-blue-50 text-blue-800 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <span>Zoom Meeting</span>
              </button>
            </div>
          </div>

          {/* Meeting Link URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">رابط الاجتماع المباشر (Meeting Link) *</label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-teal-500 outline-hidden font-mono text-[11px]"
              required
            />
          </div>

          {/* Subject & Class */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المادة *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-teal-500 outline-hidden"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الصف المستهدف *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-teal-500 outline-hidden"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">التاريخ *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 border rounded-xl border-slate-300 focus:border-teal-500 outline-hidden font-sans"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الوقت *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-2 border rounded-xl border-slate-300 focus:border-teal-500 outline-hidden font-sans"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المدة (دقيقة)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 border rounded-xl border-slate-300 focus:border-teal-500 outline-hidden font-bold text-center"
                min={15}
                max={180}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">محاور الحصة أو ملاحظات للطلاب</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="اكتب التجهيزات المطلوبة أو موضوع الحصة..."
              className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-teal-500 outline-hidden leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="submit"
              disabled={isPublishing || !!successMessage}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer shadow-md shadow-teal-600/20 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري النشر والحفظ السحابي...</span>
                </>
              ) : successMessage ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم النشر بنجاح</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>نشر الدرس الأونلاين</span>
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isPublishing}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
