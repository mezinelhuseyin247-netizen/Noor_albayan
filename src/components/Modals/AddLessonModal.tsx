import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Video, ExternalLink, Plus, Trash2, FileText } from 'lucide-react';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({ isOpen, onClose }) => {
  const { classes, subjects, addLesson } = useApp();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'subj-1');
  const [classId, setClassId] = useState(classes[0]?.id || 'class-1');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // External links repeater
  const [links, setLinks] = useState<{ title: string; url: string }[]>([
    { title: 'شرح إضافي تفاعلي', url: 'https://ien.edu.sa' },
  ]);

  if (!isOpen) return null;

  const handleAddLinkRow = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const handleRemoveLinkRow = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleUpdateLink = (index: number, field: 'title' | 'url', val: string) => {
    const updated = [...links];
    updated[index][field] = val;
    setLinks(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const validLinks = links.filter((l) => l.title.trim() && l.url.trim());

    addLesson({
      title: title.trim(),
      subjectId,
      classId,
      summary: summary.trim() || undefined,
      content: content.trim(),
      videoUrl: videoUrl.trim() || undefined,
      externalLinks: validLinks.length > 0 ? validLinks : undefined,
      attachments: [
        {
          id: `att-${Date.now()}`,
          name: `مذكرة_${title.slice(0, 15)}.pdf`,
          url: '#',
          size: '1.8 MB',
          type: 'pdf',
        },
      ],
    });

    setTitle('');
    setSummary('');
    setContent('');
    setVideoUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">كتابة ونشر درس تعليمي جديد</h3>
              <p className="text-[11px] text-slate-500">إضافة الشرح، الفيديوهات، والروابط الإثرائية المساعدة</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">عنوان الدرس *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: البلاغة العربية: علم البيان والتشبيه وأركانه"
              className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden font-semibold"
              required
            />
          </div>

          {/* Subject & Class */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المادة الدراسية *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-medium"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الصف الموجه له *</label>
              {classes.length > 0 ? (
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-medium"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.stage})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2 border border-amber-200 bg-amber-50 rounded-xl text-xs text-amber-800">
                  لا توجد صفوف بعد. اختر وأنشئ صفاً من الصفوف الجاهزة (من الأول إلى الثاني عشر) في قسم إدارة الصفوف.
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملخص موجز للدرس</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="خلاصة سريعة تظهر في بطاقة الدرس..."
              className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Full Content */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">محتوى الشرح بالتفصيل *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="اكتب تفاصيل الدرس والقواعد والشواهد هنا..."
              className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden leading-relaxed font-sans"
              required
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">رابط فيديو شارح (YouTube / Drive)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-mono text-[11px]"
            />
          </div>

          {/* External Links Repeater */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>إضافة روابط تعليمية خارجية إثرائية:</span>
              </span>
              <button
                type="button"
                onClick={handleAddLinkRow}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ رابط آخر</span>
              </button>
            </div>

            {links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => handleUpdateLink(idx, 'title', e.target.value)}
                  placeholder="عنوان الرابط (مثال: بنك أسئلة الوزارة)"
                  className="flex-1 px-2.5 py-1.5 bg-white border rounded-lg border-slate-300 focus:border-blue-500 outline-hidden text-xs"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-2.5 py-1.5 bg-white border rounded-lg border-slate-300 focus:border-blue-500 outline-hidden text-xs font-mono"
                />
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLinkRow(idx)}
                    className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
            >
              نشر الدرس للطلاب
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
