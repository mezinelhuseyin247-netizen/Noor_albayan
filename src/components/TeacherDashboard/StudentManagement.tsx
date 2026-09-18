import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  KeyRound,
  Copy,
  Check,
  Power,
  Edit2,
  Trash2,
  Phone,
  BookOpen,
  Eye,
  Sparkles,
  ShieldAlert,
  AlertCircle,
  Activity,
  Printer,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { UserProfileModal } from '../Modals/UserProfileModal';

interface StudentManagementProps {
  onOpenAddStudent: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ onOpenAddStudent }) => {
  const {
    students,
    classes,
    toggleStudentStatus,
    resetStudentPassword,
    updateStudent,
    deleteStudent,
    activities,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'online' | 'offline' | 'disabled'>('all');
  
  // Modals state
  const [credentialsStudent, setCredentialsStudent] = useState<User | null>(null);
  const [activityStudent, setActivityStudent] = useState<User | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<User | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery));

    const matchClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;

    let matchStatus = true;
    if (selectedStatusFilter === 'online') matchStatus = s.isOnline && s.isActive;
    if (selectedStatusFilter === 'offline') matchStatus = !s.isOnline && s.isActive;
    if (selectedStatusFilter === 'disabled') matchStatus = !s.isActive;

    return matchSearch && matchClass && matchStatus;
  });

  const handleCopyCredentials = (s: User) => {
    const text = `📌 بيانات الدخول لمنصة نور البيان:\n👤 اسم الطالب: ${s.name}\n🔑 اسم المستخدم: ${s.username}\n🔒 كلمة المرور: ${s.password || '123'}\n🌐 الرابط: ${window.location.origin}\n(يعمل من الهاتف، الآيباد، أو الكمبيوتر)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteStudent(studentToDelete.id);
      if (res.success) {
        setStudentToDelete(null);
      } else {
        setDeleteError(res.error || 'تعذر حذف حساب الطالب');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'حدث خطأ أثناء محاولة حذف الطالب');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">إدارة حسابات الطلاب والشعب</h2>
              <p className="text-xs text-slate-500">
                إضافة الطلاب، تحديد الصور والأغلفة، توزيع الشعب، ومتابعة النشاط السحابي
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddStudent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ إنشاء حساب طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو اسم المستخدم أو الهاتف..."
            className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:border-emerald-500 outline-hidden"
          >
            <option value="all">جميع الصفوف الدراسية</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              الكل ({students.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('online')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedStatusFilter === 'online' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              متصل ({students.filter((s) => s.isOnline && s.isActive).length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('disabled')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedStatusFilter === 'disabled' ? 'bg-white text-red-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              معطل ({students.filter((s) => !s.isActive).length})
            </button>
          </div>
        </div>
      </div>

      {/* Students Table or Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {students.length === 0 ? (
          <div className="py-16 px-4 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">لا يوجد طلاب مسجلون بعد</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ابدأ بإضافة طلابك وتزويدهم ببيانات الدخول للبدء في استخدام المنصة من أي هاتف أو كمبيوتر.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAddStudent}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة أول طالب الآن</span>
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            لا يوجد طلاب مطابقون لمعايير البحث الحالية
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600">
                  <th className="py-3.5 px-4">صورة وبيانات الطالب</th>
                  <th className="py-3.5 px-4">اسم المستخدم</th>
                  <th className="py-3.5 px-4">الصف والشعبة</th>
                  <th className="py-3.5 px-4">حالة الاتصال</th>
                  <th className="py-3.5 px-4">حالة الحساب</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات والبطاقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredStudents.map((student) => {
                  const studentClass = classes.find((c) => c.id === student.classId);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !student.isActive ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Name and Real Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileStudent(student)}
                            className="relative group cursor-pointer"
                            title="تعديل صورة وغلاف الطالب"
                          >
                            <div
                              className={`w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-white text-sm shadow-xs border ${
                                student.isActive ? 'border-emerald-500/40 bg-emerald-600' : 'border-slate-300 bg-slate-400'
                              }`}
                            >
                              {student.avatar && (student.avatar.startsWith('data:') || student.avatar.startsWith('http')) ? (
                                <img
                                  src={student.avatar}
                                  alt={student.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                student.name.charAt(0)
                              )}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                student.isOnline && student.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                              title={student.isOnline ? 'متصل الآن' : 'غير متصل'}
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                          </button>

                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedProfileStudent(student)}
                              className="font-bold text-slate-900 hover:text-emerald-700 text-right cursor-pointer"
                            >
                              {student.name}
                            </button>
                            {student.phone && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                <span>{student.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4">
                        <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-[11px] font-mono font-bold">
                          {student.username}
                        </code>
                      </td>

                      {/* Class & Section */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{studentClass?.name || 'غير محدد'}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200 mt-0.5 inline-block">
                          {student.sectionId || 'شعبة أ'}
                        </span>
                      </td>

                      {/* Online Presence */}
                      <td className="py-3 px-4">
                        {student.isOnline && student.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>متصل الآن</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px]">
                            <span>غير متصل</span>
                          </span>
                        )}
                      </td>

                      {/* Account Active State (Enabled / Disabled) */}
                      <td className="py-3 px-4">
                        {student.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>مفعل</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-bold">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>معطل مؤقتًا</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Credentials Card Button */}
                          <button
                            type="button"
                            onClick={() => setCredentialsStudent(student)}
                            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="بطاقة بيانات الدخول (لإعطائها للطالب)"
                          >
                            <KeyRound className="w-4 h-4 text-amber-600" />
                          </button>

                          {/* Profile & Photo Editor */}
                          <button
                            type="button"
                            onClick={() => setSelectedProfileStudent(student)}
                            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="تعديل الملف الشخصي والصورة والغلاف"
                          >
                            <ImageIcon className="w-4 h-4 text-emerald-600" />
                          </button>

                          {/* Toggle Active/Disabled Account */}
                          <button
                            type="button"
                            onClick={() => toggleStudentStatus(student.id)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              student.isActive
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={student.isActive ? 'تعطيل حساب الطالب' : 'إعادة تفعيل حساب الطالب'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Activity History */}
                          <button
                            type="button"
                            onClick={() => setActivityStudent(student)}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="سجل نشاط الطالب"
                          >
                            <Activity className="w-4 h-4" />
                          </button>

                          {/* Delete Student Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setStudentToDelete(student);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
                            title="حذف الطالب من النظام (صلاحية المعلم)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>حذف الطالب</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Student Profile, Avatar & Cover Editor */}
      {selectedProfileStudent && (
        <UserProfileModal
          user={selectedProfileStudent}
          isOpen={Boolean(selectedProfileStudent)}
          onClose={() => setSelectedProfileStudent(null)}
        />
      )}

      {/* Modal: Student Credentials Card for Handover */}
      {credentialsStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>بطاقة بيانات دخول الطالب للمنصة</span>
              </div>
              <button
                onClick={() => setCredentialsStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Card */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 p-5 rounded-2xl border border-emerald-200/80 text-right space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900">منصة نور البيان التعليمية</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold">
                  بطاقة طالب
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base border border-emerald-300">
                    {credentialsStudent.avatar ? (
                      <img src={credentialsStudent.avatar} alt={credentialsStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      credentialsStudent.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">اسم الطالب:</span>
                    <span className="text-sm font-bold text-slate-900">{credentialsStudent.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">اسم المستخدم:</span>
                    <span className="text-xs font-mono font-bold text-slate-900 select-all">
                      {credentialsStudent.username}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">كلمة المرور:</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 select-all">
                      {credentialsStudent.password || '123'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600">
                  الصف: <strong>{classes.find(c => c.id === credentialsStudent.classId)?.name || 'غير محدد'}</strong> • الشعبة: <strong>{credentialsStudent.sectionId || 'شعبة أ'}</strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopyCredentials(credentialsStudent)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ البيانات لإرسالها للطالب'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCredentialsStudent(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Student Activity Audit Trail */}
      {activityStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">سجل نشاط الطالب: {activityStudent.name}</h3>
                  <p className="text-[11px] text-slate-500">تتبع حركات الطالب من فتح واجبات، حلول، وتسجيل الدخول</p>
                </div>
              </div>
              <button
                onClick={() => setActivityStudent(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {activities.filter((a) => a.studentId === activityStudent.id).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">لا يوجد سجل نشاط مسجل لهذا الطالب بعد</div>
              ) : (
                activities
                  .filter((a) => a.studentId === activityStudent.id)
                  .map((act) => (
                    <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
                        <span className="font-bold text-indigo-900">{act.details}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.timestamp).toLocaleString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActivityStudent(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Student Confirmation */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-rose-100 flex flex-col animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              تأكيد حذف حساب الطالب نهائياً
            </h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              هل أنت متأكد من رغبتك في حذف الطالب <span className="font-bold text-slate-800">«{studentToDelete.name}»</span>؟
            </p>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>اسم المستخدم:</span>
                <span className="font-mono font-bold text-slate-800">{studentToDelete.username}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الفصل / الشعبة:</span>
                <span className="font-semibold text-slate-800">
                  {classes.find((c) => c.id === studentToDelete.classId)?.name || 'غير محدد'} - {studentToDelete.sectionId || 'شعبة أ'}
                </span>
              </div>
              {studentToDelete.phone && (
                <div className="flex justify-between text-slate-600">
                  <span>رقم الهاتف:</span>
                  <span className="font-mono text-slate-800">{studentToDelete.phone}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl mb-4 text-[11px] text-rose-800 leading-relaxed">
              ⚠️ <span className="font-bold">تنبيه أمني هام:</span> سيتم حذف هذا الطالب وجميع تسليماته للواجبات والامتحانات وسجلاته نهائياً من قاعدة البيانات السحابية، ولن يتمكن من تسجيل الدخول بعد الآن.
            </div>

            {deleteError && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-xl mb-4 text-xs text-red-700 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-200 cursor-pointer disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>جاري الحذف من السيرفر...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>تأكيد الحذف النهائي</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setStudentToDelete(null);
                  setDeleteError(null);
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
