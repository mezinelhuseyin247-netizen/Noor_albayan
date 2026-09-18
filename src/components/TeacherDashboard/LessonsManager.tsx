import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, Lesson, ExternalLink } from '../../types';
import {
  BookOpen,
  Plus,
  Video,
  FileText,
  ExternalLink as LinkIcon,
  Trash2,
  Edit3,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Link,
  Upload,
} from 'lucide-react';

interface LessonsManagerProps {
  onOpenAddLesson: () => void;
}

export const LessonsManager: React.FC<LessonsManagerProps> = ({ onOpenAddLesson }) => {
  const { subjects, lessons, classes, addSubject, deleteLesson } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  // New Subject Modal state
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjClassId, setNewSubjClassId] = useState(classes[0]?.id || 'class-1');
  const [newSubjDesc, setNewSubjDesc] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('emerald');

  const filteredLessons = lessons.filter((l) => {
    if (selectedSubjectId === 'all') return true;
    return l.subjectId === selectedSubjectId;
  });

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    addSubject({
      name: newSubjName.trim(),
      classId: newSubjClassId,
      icon: 'BookOpen',
      color: newSubjColor,
      description: newSubjDesc.trim() || 'مقرر دراسي متكامل',
      teacherName: 'أ. إبراهيم المنصوري',
    });

    setNewSubjName('');
    setNewSubjDesc('');
    setShowAddSubjectModal(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">المواد الدراسية والدروس التعليمية</h2>
              <p className="text-xs text-slate-500">
                إضافة المواد والمقررات، كتابة الدروس ونشر المذكرات والروابط الإثرائية والفيديوهات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddSubjectModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ مادة جديدة</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddLesson}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ كتابة درس جديد</span>
          </button>
        </div>
      </div>

      {/* Subjects Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedSubjectId === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          جميع المواد ({lessons.length} درس)
        </button>

        {subjects.map((subj) => {
          const count = lessons.filter((l) => l.subjectId === subj.id).length;
          const isSelected = selectedSubjectId === subj.id;

          return (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectId(subj.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{subj.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lessons List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredLessons.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            لا توجد دروس مضافة في هذه المادة بعد. انقر على "+ كتابة درس جديد" لإضافة أول درس.
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const subj = subjects.find((s) => s.id === lesson.subjectId);
            const cls = classes.find((c) => c.id === lesson.classId);

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Subject & Class Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {subj?.name || 'مقرر عام'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(lesson.createdAt).toLocaleDateString('ar-SA')}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug mt-1 mb-2">
                    {lesson.title}
                  </h3>

                  {lesson.summary && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {lesson.summary}
                    </p>
                  )}

                  {/* Attached Meta Chips */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                    {lesson.videoUrl && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                        <Video className="w-3 h-3" />
                        <span>فيديو شارح</span>
                      </span>
                    )}

                    {lesson.externalLinks && lesson.externalLinks.length > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        <LinkIcon className="w-3 h-3" />
                        <span>{lesson.externalLinks.length} روابط إثرائية</span>
                      </span>
                    )}

                    {lesson.attachments && lesson.attachments.length > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                        <FileText className="w-3 h-3" />
                        <span>{lesson.attachments.length} مذكرات PDF</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    الصف: <strong>{cls?.name}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewLesson(lesson)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة الدرس</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
                          deleteLesson(lesson.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="حذف الدرس"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Subject */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
              إضافة مادة دراسية جديدة
            </h3>

            <form onSubmit={handleCreateSubject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المادة</label>
                <input
                  type="text"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="مثال: لغتي الخالدة / الفيزياء / الكيمياء"
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الصف المخصص للمادة</label>
                <select
                  value={newSubjClassId}
                  onChange={(e) => setNewSubjClassId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.stage})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف مختصر للمنهج</label>
                <textarea
                  value={newSubjDesc}
                  onChange={(e) => setNewSubjDesc(e.target.value)}
                  placeholder="أهداف المنهج والوحدات المقررة..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                >
                  حفظ المادة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preview Lesson Detail */}
      {previewLesson && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {subjects.find((s) => s.id === previewLesson.subjectId)?.name}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">{previewLesson.title}</h2>
              </div>
              <button
                onClick={() => setPreviewLesson(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Lesson Summary */}
            {previewLesson.summary && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 font-medium mb-5 leading-relaxed">
                <strong>خلاصة الدرس:</strong> {previewLesson.summary}
              </div>
            )}

            {/* Rich Content Markdown/Text Display */}
            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-loose whitespace-pre-line bg-slate-50/60 p-5 rounded-2xl border border-slate-100 mb-6">
              {previewLesson.content}
            </div>

            {/* External Links Section */}
            {previewLesson.externalLinks && previewLesson.externalLinks.length > 0 && (
              <div className="mb-6 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  <span>الروابط التعليمية الخارجية المرفقة:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {previewLesson.externalLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center justify-between text-xs group"
                    >
                      <span className="font-semibold text-slate-800 line-clamp-1">{link.title}</span>
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Files */}
            {previewLesson.attachments && previewLesson.attachments.length > 0 && (
              <div className="mb-6 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>المذكرات والملفات المرفقة للتحميل:</span>
                </h4>
                <div className="space-y-2">
                  {previewLesson.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-amber-50/30 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-slate-900">{file.name}</span>
                        {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
                      </div>
                      <span className="text-xs text-amber-800 font-bold">جاهز للتحميل</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
