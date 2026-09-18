import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  Image as ImageIcon,
  Key,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Trash2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { User } from '../../types';
import { PREDEFINED_GRADES } from '../../data/gradeLevels';
import { PhotoCoverPicker } from '../Common/PhotoCoverPicker';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const { classes, addClass, addStudent } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [sectionId, setSectionId] = useState(classes[0]?.sections[0] || 'شعبة أ');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(undefined);

  // New class quick-create state if no classes exist
  const [isCreatingClassInline, setIsCreatingClassInline] = useState(classes.length === 0);
  const [selectedPresetGradeName, setSelectedPresetGradeName] = useState('الصف الأول');
  const [isCustomClassName, setIsCustomClassName] = useState(false);
  const [newClassName, setNewClassName] = useState('الصف الأول');
  const [newSectionName, setNewSectionName] = useState('شعبة أ');

  const [activePicker, setActivePicker] = useState<'avatar' | 'cover' | null>(null);
  const [error, setError] = useState('');
  const [createdStudent, setCreatedStudent] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentSelectedClass = classes.find((c) => c.id === classId) || classes[0];

  const handleClassChange = (selectedId: string) => {
    if (selectedId === '__NEW__') {
      setIsCreatingClassInline(true);
      return;
    }
    setClassId(selectedId);
    const cls = classes.find((c) => c.id === selectedId);
    if (cls && cls.sections.length > 0) {
      setSectionId(cls.sections[0]);
    }
  };

  const handlePresetGradeChange = (gradeName: string) => {
    if (gradeName === '__CUSTOM__') {
      setIsCustomClassName(true);
      setNewClassName('');
    } else {
      setIsCustomClassName(false);
      setSelectedPresetGradeName(gradeName);
      setNewClassName(gradeName);
    }
  };

  const generateAutoUsername = (inputName: string) => {
    setName(inputName);
    if (!username || username.startsWith('std_')) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setUsername(`std_${randomNum}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول الإلزامية (الاسم، اسم المستخدم، كلمة المرور)');
      return;
    }

    let finalClassId = classId;
    let finalSectionId = sectionId;

    // If teacher is creating a class or picking a preset
    if (isCreatingClassInline || classes.length === 0) {
      const targetClassName = (isCustomClassName ? newClassName : selectedPresetGradeName).trim();
      if (!targetClassName) {
        setError('يرجى تحديد أو كتابة اسم الصف الدراسي');
        return;
      }

      // Check if this class already exists
      const existing = classes.find((c) => c.name.trim() === targetClassName);
      if (existing) {
        finalClassId = existing.id;
        finalSectionId = newSectionName.trim() || existing.sections[0] || 'شعبة أ';
      } else {
        const preset = PREDEFINED_GRADES.find((g) => g.name === targetClassName);
        const createdClass = addClass({
          name: targetClassName,
          stage: preset?.stage || 'المرحلة الابتدائية',
          gradeNumber: preset?.gradeNumber || 1,
          sections: [newSectionName.trim() || 'شعبة أ', 'شعبة ب'],
          color: preset?.color || 'from-emerald-600 to-teal-700',
        });
        finalClassId = createdClass.id;
        finalSectionId = newSectionName.trim() || 'شعبة أ';
      }
    }

    const res = addStudent({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim(),
      classId: finalClassId || undefined,
      sectionId: finalSectionId || undefined,
      phone: phone.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      bio: bio.trim() || undefined,
      avatar,
      coverPhoto,
      isActive: true,
    });

    if (res.success && res.student) {
      setCreatedStudent(res.student);
    } else {
      setError(res.error || 'تعذر إنشاء الحساب، يرجى التأكد من اسم المستخدم.');
    }
  };

  const handleCopyCredentials = () => {
    if (!createdStudent) return;
    const text = `📌 بيانات الدخول لمنصة نور البيان التعليمية:\n👤 اسم الطالب: ${createdStudent.name}\n🔑 اسم المستخدم: ${createdStudent.username}\n🔒 كلمة المرور: ${createdStudent.password}\n🌐 رابط الدخول: ${window.location.origin}\n(يمكنك الدخول من الهاتف، الآيباد، أو الكمبيوتر في أي وقت)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCloseAll = () => {
    setName('');
    setUsername('');
    setPassword('123456');
    setPhone('');
    setParentPhone('');
    setNotes('');
    setBio('');
    setAvatar(undefined);
    setCoverPhoto(undefined);
    setError('');
    setCreatedStudent(null);
    setCopied(false);
    setActivePicker(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 mt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {createdStudent ? 'تم إنشاء حساب الطالب بنجاح' : 'إنشاء حساب طالب جديد'}
              </h3>
              <p className="text-xs text-slate-500">
                {createdStudent
                  ? 'تم حفظ الحساب في السحابة ويعمل عبر جميع الأجهزة'
                  : 'توليد حساب أونلاين حقيقي يعمل على الهاتف والكمبيوتر'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Active Image/Cover Picker Modal View */}
        {activePicker ? (
          <div className="animate-in fade-in zoom-in-95 duration-150">
            <PhotoCoverPicker
              type={activePicker}
              currentValue={activePicker === 'avatar' ? avatar : coverPhoto}
              onSave={(newVal) => {
                if (activePicker === 'avatar') setAvatar(newVal);
                if (activePicker === 'cover') setCoverPhoto(newVal);
                setActivePicker(null);
              }}
              onCancel={() => setActivePicker(null)}
              title={activePicker === 'avatar' ? 'إضافة صورة الطالب (كاميرا أو معرض)' : 'إضافة غلاف ملف الطالب'}
            />
          </div>
        ) : createdStudent ? (
          /* Success Card if created */
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>حساب الطالب جاهز ومحفوظ في السحابة أونلاين</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                يستطيع الطالب أو ولي أمره الآن تسجيل الدخول مباشرة من أي هاتف، آيباد أو كمبيوتر بهذه البيانات:
              </p>
            </div>

            {/* Student Card Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg border-2 border-emerald-400">
                  {createdStudent.avatar ? (
                    <img
                      src={createdStudent.avatar}
                      alt={createdStudent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    createdStudent.name.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{createdStudent.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">@{createdStudent.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">اسم المستخدم:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{createdStudent.username}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">كلمة المرور:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{createdStudent.password}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم نسخ بطاقة الدخول بنجاح!' : 'نسخ بيانات الدخول لإرسالها للطالب'}</span>
              </button>
              <button
                type="button"
                onClick={handleCloseAll}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Photo & Cover Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block font-bold text-slate-800 text-xs">
                الصورة الشخصية وغلاف الملف (اختياري)
              </label>

              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-white shadow-xs flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="صورة الطالب" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 text-emerald-700 font-bold text-2xl flex items-center justify-center">
                        {name ? name.charAt(0) : 'ط'}
                      </div>
                    )}
                  </div>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar(undefined)}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition shadow"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Photo Action Buttons */}
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => setActivePicker('avatar')}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{avatar ? 'تغيير صورة الطالب' : 'إضافة صورة الطالب (من ملفات الجهاز)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePicker('cover')}
                    className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{coverPhoto ? 'تم اختيار غلاف (تعديل)' : 'إضافة غلاف ملف الطالب (اختياري)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Student Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الاسم الثلاثي للطالب / الطالبة *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => generateAutoUsername(e.target.value)}
                placeholder="مثال: يوسف خالد الحربي"
                className="w-full px-3.5 py-2.5 border rounded-xl border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden font-medium text-slate-800"
                required
              />
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم المستخدم (Username) *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="youssef_2026"
                  className="w-full px-3.5 py-2.5 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-mono text-left text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">كلمة المرور *</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-mono text-left text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Class & Section Selection or Inline Creation */}
            {classes.length > 0 && !isCreatingClassInline ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">الصف الدراسي</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingClassInline(true)}
                      className="text-emerald-700 text-[11px] font-bold hover:underline"
                    >
                      + إضافة صف جديد (الصفوف 1 - 12)
                    </button>
                  </div>
                  <select
                    value={classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-medium bg-white text-slate-800"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشعبة</label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-medium bg-white text-slate-800"
                  >
                    {(currentSelectedClass?.sections || ['شعبة أ']).map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900 text-xs">تعيين الصف والشعبة لهذا الطالب:</span>
                  {classes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingClassInline(false)}
                      className="text-slate-500 text-[11px] hover:underline cursor-pointer"
                    >
                      اختيار من الصفوف الموجودة ({classes.length})
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    اختر الصف الدراسي من الخيارات الجاهزة (من الأول إلى الثاني عشر):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={isCustomClassName ? '__CUSTOM__' : selectedPresetGradeName}
                      onChange={(e) => handlePresetGradeChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white border-emerald-300 text-slate-800 text-xs font-bold"
                    >
                      <optgroup label="المرحلة الابتدائية">
                        {PREDEFINED_GRADES.filter((g) => g.stage === 'المرحلة الابتدائية').map((g) => (
                          <option key={g.name} value={g.name}>
                            {g.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="المرحلة المتوسطة">
                        {PREDEFINED_GRADES.filter((g) => g.stage === 'المرحلة المتوسطة').map((g) => (
                          <option key={g.name} value={g.name}>
                            {g.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="المرحلة الثانوية">
                        {PREDEFINED_GRADES.filter((g) => g.stage === 'المرحلة الثانوية').map((g) => (
                          <option key={g.name} value={g.name}>
                            {g.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="تخصيص">
                        <option value="__CUSTOM__">صف مخصص / كتابة يدوية...</option>
                      </optgroup>
                    </select>

                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="الشعبة (مثال: شعبة أ)"
                      className="w-full px-3 py-2 border rounded-xl bg-white border-emerald-300 text-slate-800 text-xs font-medium"
                      required
                    />
                  </div>

                  {isCustomClassName && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="أدخل اسم الصف الدراسي المخصص..."
                        className="w-full px-3 py-2 border rounded-xl bg-white border-emerald-300 text-slate-800 text-xs font-bold"
                        required
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optional Phones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  هاتف الطالب (اختياري)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full px-3.5 py-2.5 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-mono text-left text-slate-800"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  هاتف ولي الأمر (اختياري)
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full px-3.5 py-2.5 border rounded-xl border-slate-300 focus:border-emerald-500 outline-hidden font-mono text-left text-slate-800"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>التوافق السحابي مع كافة الأجهزة:</strong> يتم حفظ الحساب والصورة فورًا في قاعدة البيانات،
                ويمكن للطالب استخدامه على الفور من أي هاتف، آيباد أو كمبيوتر.
              </span>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseAll}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                حفظ وإنشاء الحساب أونلاين
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
