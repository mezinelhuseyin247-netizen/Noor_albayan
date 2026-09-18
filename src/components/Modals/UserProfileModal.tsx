import React, { useState } from 'react';
import { User } from '../../types';
import { useApp } from '../../context/AppContext';
import { PhotoCoverPicker } from '../Common/PhotoCoverPicker';
import {
  X,
  Image as ImageIcon,
  User as UserIcon,
  Phone,
  Lock,
  FileText,
  Save,
  CheckCircle,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateSuccess,
}) => {
  const { updateStudent, currentUser } = useApp();
  const isTeacher = user.role === 'teacher';
  const isSelf = currentUser?.id === user.id;

  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [parentPhone, setParentPhone] = useState(user.parentPhone || '');
  const [notes, setNotes] = useState(user.notes || '');
  const [bio, setBio] = useState(user.bio || '');
  const [password, setPassword] = useState(user.password || '');
  const [avatar, setAvatar] = useState<string | undefined>(user.avatar);
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(user.coverPhoto);

  const [activePicker, setActivePicker] = useState<'avatar' | 'cover' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates = {
        name: name.trim(),
        phone: phone.trim(),
        parentPhone: parentPhone.trim(),
        notes: notes.trim(),
        bio: bio.trim(),
        password: password.trim(),
        avatar,
        coverPhoto,
      };

      // Call API directly for reliable multi-device sync
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        updateStudent(user.id, updates);
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          if (onUpdateSuccess) onUpdateSuccess();
          onClose();
        }, 900);
      } else {
        alert('حدث خطأ أثناء حفظ التعديلات.');
      }
    } catch (err) {
      console.error('Failed to update user profile:', err);
      alert('حدث خطأ في الاتصال بالخادم.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header Cover Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 flex items-center justify-center">
          {coverPhoto ? (
            coverPhoto.startsWith('linear-gradient') ? (
              <div className="w-full h-full" style={{ background: coverPhoto }} />
            ) : (
              <img
                src={coverPhoto}
                alt="غلاف الملف"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )
          ) : (
            <div className="text-center p-4 text-white/40">
              <ImageIcon className="w-12 h-12 mx-auto mb-1 opacity-50" />
              <span className="text-xs">لم يتم تعيين غلاف بعد</span>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Change Cover Button */}
          <button
            type="button"
            onClick={() => setActivePicker('cover')}
            className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white text-xs font-semibold flex items-center gap-1.5 transition backdrop-blur-sm border border-white/20 shadow cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>تغيير الغلاف</span>
          </button>

          {/* Role badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold shadow">
            {isTeacher ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>حساب المعلم المشرف</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>حساب طالب</span>
              </>
            )}
          </div>
        </div>

        {/* Profile Avatar section overlapping banner */}
        <div className="px-6 sm:px-8 -mt-16 sm:-mt-20 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-end gap-4">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
                {avatar && (avatar.startsWith('data:image') || avatar.startsWith('http')) ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-4xl font-extrabold flex items-center justify-center">
                    {name ? name.charAt(0) : 'ن'}
                  </div>
                )}
              </div>

              {/* Change Avatar button overlay */}
              <button
                type="button"
                onClick={() => setActivePicker('avatar')}
                className="absolute inset-0 bg-black/50 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer"
              >
                <ImageIcon className="w-5 h-5" />
                <span>تغيير الصورة</span>
              </button>
            </div>

            <div className="mb-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">{name || 'مستخدم نور البيان'}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">@{user.username}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActivePicker('avatar')}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>تحديث الصورة الشخصية</span>
          </button>
        </div>

        {/* Modal content: Active Picker or Edit Form */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
          {activePicker ? (
            <div className="animate-in fade-in duration-150">
              <PhotoCoverPicker
                type={activePicker}
                currentValue={activePicker === 'avatar' ? avatar : coverPhoto}
                onSave={(newVal) => {
                  if (activePicker === 'avatar') setAvatar(newVal);
                  if (activePicker === 'cover') setCoverPhoto(newVal);
                  setActivePicker(null);
                }}
                onCancel={() => setActivePicker(null)}
                title={activePicker === 'avatar' ? 'تحديث الصورة الشخصية' : 'تحديث صورة الغلاف'}
              />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>الاسم الكامل</span>
                    </span>
                    {!isTeacher && (
                      <span className="text-[10px] text-slate-400 font-normal">محفوظ بسجلات المدرسة</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isTeacher}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition ${
                      !isTeacher
                        ? 'bg-slate-100/80 border border-slate-200 text-slate-600 cursor-not-allowed font-medium'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                    }`}
                  />
                  {!isTeacher && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      اسم الطالب وبياناته محمية ومسجلة رسميًا، وتعديلها أو حذفها من صلاحية المعلم فقط.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>كلمة المرور</span>
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>رقم الهاتف</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-left"
                    dir="ltr"
                  />
                </div>

                {!isTeacher && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>رقم هاتف ولي الأمر</span>
                    </label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition text-left"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>نبذة تعريفية / السيرة الذاتية (Bio)</span>
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={isTeacher ? 'اكتب تخصصك ومؤهلاتك التعليمية...' : 'اكتب اهتماماتك وطموحك الدراسي...'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                />
              </div>

              {isTeacher && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>ملاحظات إدارية / التخصص</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: معلم لغة عربية - مشرف المنصة"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>جاري الحفظ...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ التعديلات في السحابة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="absolute top-4 inset-x-0 mx-auto w-max px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-150">
            <CheckCircle className="w-4 h-4" />
            <span>تم حفظ التعديلات وتحديث السحابة بنجاح!</span>
          </div>
        )}
      </div>
    </div>
  );
};
