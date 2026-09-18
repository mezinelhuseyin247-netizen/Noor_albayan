import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Lock,
  User as UserIcon,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Info,
  UserCheck,
  UserPlus,
  BookOpen,
  Phone,
  Mail,
  Sparkles,
  CheckCircle2,
  Laptop,
  Smartphone,
  Tablet,
  Calculator,
  Compass,
} from 'lucide-react';
import { OpenBookArabicIcon } from './Common/OpenBookArabicLogo';
import { IslamicArabesqueDivider } from './Common/IslamicOrnament';
import studentSceneImg from '../assets/images/student_whiteboard_scene_1788465890900.jpg';
import appCoverImg from '../assets/images/noor_albayan_cover_1789759364849.jpg';

type AuthMode = 'teacher_login' | 'student_login' | 'teacher_register' | 'forgot_password';

export const LoginPage: React.FC = () => {
  const { login, registerTeacher, requestPasswordReset, resetPasswordWithToken } = useApp();

  const [authMode, setAuthMode] = useState<AuthMode>('teacher_login');
  const [leftShowcaseTab, setLeftShowcaseTab] = useState<'cover' | 'scene'>('cover');

  // Login inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Teacher Registration inputs
  const [teacherName, setTeacherName] = useState('');
  const [teacherSpecialty, setTeacherSpecialty] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Forgot Password inputs & states
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [resetToken, setResetToken] = useState('');
  const [recoveredTeacher, setRecoveredTeacher] = useState<{
    id: string;
    name: string;
    username: string;
    email?: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(username, password);
      if (!res.success) {
        setErrorMessage(
          res.error ||
            (authMode === 'student_login'
              ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى مراجعة المعلم للتأكد من بيانات الحساب.'
              : 'فشل تسجيل الدخول. يرجى التحقق من اسم المستخدم وكلمة المرور.')
        );
      }
    } catch {
      setErrorMessage('تعذر الاتصال بالخادم السحابي، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Teacher Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!teacherName.trim()) {
      setErrorMessage('يرجى إدخال الاسم الكامل للمعلم');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم المطلوب');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 4) {
      setErrorMessage('يرجى إدخال كلمة مرور مكونة من 4 أحرف/أرقام على الأقل');
      return;
    }

    try {
      setIsLoading(true);
      const res = await registerTeacher({
        name: teacherName.trim(),
        specialty: teacherSpecialty.trim(),
        username: regUsername.trim(),
        password: regPassword.trim(),
        email: regEmail.trim() || undefined,
        phone: regPhone.trim() || undefined,
      });

      if (res.success) {
        setSuccessMessage('تم إنشاء حساب المعلم بنجاح! جاري الدخول للوحة التحكم...');
      } else {
        setErrorMessage(res.error || 'تعذر إنشاء الحساب، يرجى اختيار اسم مستخدم آخر.');
      }
    } catch {
      setErrorMessage('تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Request Password Reset Submit (Step 1)
  const handleRequestResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني المرتبط بحساب المعلم.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await requestPasswordReset(cleanEmail);

      if (res.success && res.resetToken && res.teacher) {
        setResetToken(res.resetToken);
        setRecoveredTeacher(res.teacher);
        setResetStep('reset');
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccessMessage(
          `تم العثور على حساب المعلم (${res.teacher.name}) بنجاح. يمكنك الآن تعيين كلمة المرور الجديدة.`
        );
      } else {
        setErrorMessage(
          res.error ||
            'لم يتم العثور على أي حساب معلم مرتبط بهذا البريد الإلكتروني في قاعدة البيانات السحابية. يرجى التأكد من البريد الإلكتروني المسجل به الحساب.'
        );
      }
    } catch {
      setErrorMessage('تعذر الاتصال بالخادم السحابي، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Perform Password Reset Submit (Step 2)
  const handlePerformResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedNewPass = newPassword.trim();
    const trimmedConfirmPass = confirmNewPassword.trim();

    if (!trimmedNewPass || trimmedNewPass.length < 4) {
      setErrorMessage('يرجى إدخال كلمة مرور جديدة مكونة من 4 أحرف أو أرقام على الأقل.');
      return;
    }

    if (trimmedNewPass !== trimmedConfirmPass) {
      setErrorMessage('كلمتا المرور غير متطابقتين. يرجى التأكد وإعادة كتابتهما بشكل متطابق.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetPasswordWithToken(resetToken, trimmedNewPass, trimmedConfirmPass);

      if (res.success) {
        const teacherUser = recoveredTeacher?.username || res.username || '';
        setUsername(teacherUser);
        setPassword('');
        setAuthMode('teacher_login');
        setResetStep('request');
        setResetToken('');
        setRecoveredTeacher(null);
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccessMessage(
          `تم تغيير وتحديث كلمة المرور بنجاح للحساب (${teacherUser})! يمكنك الآن تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور الجديدة.`
        );
      } else {
        setErrorMessage(res.error || 'تعذر تغيير كلمة المرور. يرجى المحاولة مرة أخرى.');
      }
    } catch {
      setErrorMessage('تعذر الاتصال بالخادم السحابي، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    if (mode === 'forgot_password') {
      setResetStep('request');
      setResetToken('');
      setRecoveredTeacher(null);
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white relative flex flex-col justify-between py-4 sm:py-8 px-3 sm:px-6 lg:px-8 overflow-x-hidden selection:bg-emerald-600 selection:text-white"
      dir="rtl"
    >
      {/* Subtle modern clean ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* 2. Top Header Bar (Device Indicators & Cloud Sync Guarantee) */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between text-xs text-white/90 bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="font-bold tracking-wide text-white">قاعدة بيانات سحابية مركزية متصلة أونلاين</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/80 font-medium">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-300" /> هاتف
          </span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1">
            <Tablet className="w-3.5 h-3.5 text-emerald-300" /> iPad
          </span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1">
            <Laptop className="w-3.5 h-3.5 text-emerald-300" /> كمبيوتر
          </span>
        </div>
      </header>

      {/* 3. Main Center Area with Educational Whiteboard Scene & Authentication Card */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-auto px-1 sm:px-4">
        {/* Blackboard Title Banner with Arabic Calligraphy Theme */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center p-3 sm:p-4 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-amber-300 shadow-2xl shadow-slate-950/40 mb-3 ring-4 ring-white/30 backdrop-blur-sm group"
            title="غلاف تطبيق نور البيان: كتاب عربي مفتوح بالحروف أ ب ت ث"
          >
            <OpenBookArabicIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md group-hover:scale-105 transition-transform" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md tracking-tight font-sans">
            منصة <span className="text-amber-300">نور البيان</span>
          </h1>

          {/* Blackboard-style Subtitle Badge */}
          <div className="mt-2 inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-400/40 px-4 py-1.5 rounded-full text-xs text-emerald-100 backdrop-blur-md shadow-md">
            <span className="font-bold text-amber-300">أ • ب • ت • ث</span>
            <span className="text-emerald-500">•</span>
            <span className="font-bold">كتاب مفتوح لتعليم القراءة واللغة العربية</span>
            <span className="text-emerald-500">•</span>
            <span className="font-bold text-emerald-200">الصفوف والواجبات</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Scene Showcase + Login Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Educational Whiteboard Scene Showcase Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4 order-2 lg:order-1">
            <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-emerald-500/30 p-4 sm:p-5 shadow-2xl shadow-slate-950/40 relative overflow-hidden group">
              {/* Decorative subtle corner glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Cover vs Scene Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-white/10 mb-3 text-xs">
                <button
                  type="button"
                  onClick={() => setLeftShowcaseTab('cover')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    leftShowcaseTab === 'cover'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>غلاف التطبيق (كتاب مفتوح)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeftShowcaseTab('scene')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    leftShowcaseTab === 'scene'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>المشهد الفصلي</span>
                </button>
              </div>

              {/* Showcase Display Area */}
              {leftShowcaseTab === 'cover' ? (
                /* Official Book Cover Artwork */
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/40 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 shadow-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 flex flex-col items-center justify-center p-4 text-center group">
                  {/* Background Image of cover with overlay */}
                  <img
                    src={appCoverImg}
                    alt="غلاف تطبيق نور البيان: كتاب عربي مفتوح تظهر على صفحاته الحروف أ ب ت ث"
                    className="absolute inset-0 w-full h-full object-cover opacity-85 transform group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-slate-950/20" />

                  {/* Badge & Typography over cover */}
                  <div className="relative z-10 mt-auto w-full">
                    <div className="inline-flex items-center gap-2 bg-emerald-950/90 border border-amber-400/50 px-4 py-1 rounded-full font-black text-amber-300 shadow-lg text-base tracking-widest mb-1.5">
                      <span>أ</span>
                      <span className="text-amber-400/40">•</span>
                      <span>ب</span>
                      <span className="text-amber-400/40">•</span>
                      <span>ت</span>
                      <span className="text-amber-400/40">•</span>
                      <span>ث</span>
                    </div>
                    <div className="text-sm font-black text-white drop-shadow">
                      غلاف تطبيق «نور البيان» الرسمي
                    </div>
                    <div className="text-[11px] text-emerald-200/90">
                      كتاب عربي مفتوح لتعليم حروف الهجاء والقراءة
                    </div>
                  </div>
                </div>
              ) : (
                /* Whiteboard Scene Artwork */
                <div className="relative rounded-2xl overflow-hidden border border-emerald-400/30 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 shadow-xl bg-slate-950">
                  <img
                    src={studentSceneImg}
                    alt="طالب يكتب حروف الهجاء العربية أ ب ت ث على لوح أبيض في فصل دراسي"
                    className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle soft gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Arabic Alphabet Highlight Badge on Scene */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2">
                    <div className="bg-emerald-950/90 backdrop-blur-md border border-emerald-400/50 px-3.5 py-1.5 rounded-full font-black text-amber-300 shadow-lg flex items-center gap-2 text-sm sm:text-base tracking-widest">
                      <BookOpen className="w-4 h-4 text-amber-300" />
                      <span>أ   ب   ت   ث</span>
                    </div>
                    <div className="bg-slate-900/85 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[11px] text-emerald-200 font-medium">
                      مشهد تعليمي فصلي
                    </div>
                  </div>
                </div>
              )}

              {/* Educational Context Cards */}
              <div className="mt-4 text-center space-y-2">
                <h2 className="text-base font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>منهج «نور البيان» لتأسيس القراءة والقرآن</span>
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  تصميم تعليمي عربي أصيل بهيئة كتاب مفتوح يعرض الحروف «أ  ب  ت  ث»، مناسب للهواتف والآيباد والكمبيوتر.
                </p>
              </div>

              {/* Educational Features Quick Pills */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/25">
                  <div className="font-bold text-amber-300 text-xs">أ ب ت ث</div>
                  <div className="text-[10px] text-emerald-300">الحروف والهجاء</div>
                </div>
                <div className="p-2 rounded-xl bg-teal-950/50 border border-teal-500/25">
                  <div className="font-bold text-white text-xs">صفوف وحصص</div>
                  <div className="text-[10px] text-teal-300">متابعة يومية</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-500/25">
                  <div className="font-bold text-amber-300 text-xs">سحابة فورية</div>
                  <div className="text-[10px] text-amber-300">كل الأجهزة</div>
                </div>
              </div>
            </div>
          </div>

          {/* Central High-Contrast Authentication Card Column */}
          <div className="lg:col-span-7 order-1 lg:order-2 w-full max-w-xl mx-auto">
            {/* Central High-Contrast Authentication Card */}
            <div className="bg-white/95 backdrop-blur-xl py-6 px-5 sm:px-8 shadow-2xl shadow-slate-950/30 rounded-3xl border border-white/80 relative overflow-hidden">
          {/* Top Decorative Color Ribbon */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-emerald-600 via-teal-500 to-amber-500" />

          {/* Navigation Mode Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl mb-5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleModeChange('teacher_login')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center ${
                authMode === 'teacher_login' || authMode === 'forgot_password'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>دخول المعلم</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('student_login')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center ${
                authMode === 'student_login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>دخول الطالب</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('teacher_register')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center ${
                authMode === 'teacher_register'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>تسجيل معلم جديد</span>
            </button>
          </div>

          {/* Contextual Notice Information */}
          {authMode === 'forgot_password' && (
            <div className="mb-4 rounded-2xl bg-amber-50/95 border border-amber-200/90 p-3.5 text-xs text-amber-950 flex items-start justify-between gap-3 shadow-2xs animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="leading-relaxed">
                  <strong className="font-bold block text-amber-900 text-sm mb-0.5">
                    استعادة كلمة مرور المعلم:
                  </strong>
                  <span className="text-slate-700">
                    {resetStep === 'request'
                      ? 'أدخل البريد الإلكتروني المرتبط بحسابك للبحث عنه في قاعدة البيانات السحابية المركزية وبدء استعادة كلمة المرور بأمان.'
                      : `تم التحقق بنجاح من حساب المعلم: ${recoveredTeacher?.name}. يرجى إدخال كلمة المرور الجديدة أدناه.`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleModeChange('teacher_login')}
                className="text-amber-800 hover:text-amber-950 hover:underline text-xs font-bold shrink-0 self-center cursor-pointer px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors"
              >
                العودة لدخول المعلم
              </button>
            </div>
          )}

          {authMode === 'student_login' && (
            <div className="mb-4 rounded-2xl bg-blue-50/90 border border-blue-200/90 p-3 text-xs text-blue-950 flex items-start gap-2.5 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="leading-relaxed">
                <strong className="font-bold block text-blue-900 mb-0.5">حسابات الطلاب المعتمدة:</strong>
                <span className="text-slate-700">
                  حساب الطالب ينشئه المعلم فقط من لوحة التحكم. يمكنك تسجيل الدخول من هاتفك أو هاتف والدتك أو الآيباد أو الكمبيوتر.
                </span>
              </div>
            </div>
          )}

          {authMode === 'teacher_login' && (
            <div className="mb-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 p-3 text-xs text-emerald-950 flex items-start gap-2.5 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="leading-relaxed">
                <strong className="font-bold block text-emerald-900 mb-0.5">بوابة المعلم والمشرف:</strong>
                <span className="text-slate-700">
                  إدارة الطلاب، توزيع كلمات المرور، إعداد الواجبات والتصحيح، ومتابعة البرنامج الأسبوعي للحصص.
                </span>
              </div>
            </div>
          )}

          {authMode === 'teacher_register' && (
            <div className="mb-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 p-3 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="leading-relaxed">
                <strong className="font-bold block text-amber-900 mb-0.5">إنشاء حساب معلم مستقل:</strong>
                <span className="text-slate-700">
                  سجل بياناتك كمعلم لتبدأ فورًا في إدارة فصولك وإضافة الطلاب والدروس والبرنامج الأسبوعي.
                </span>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          )}

          {/* FORM 1: LOGIN (Teacher or Student) */}
          {(authMode === 'teacher_login' || authMode === 'student_login') && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المستخدم (Username)
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      authMode === 'teacher_login'
                        ? 'اسم مستخدم المعلم'
                        : 'اسم المستخدم المسلم لك من المعلم'
                    }
                    className="block w-full rounded-xl border border-slate-300 pr-10 pl-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all text-right font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    كلمة المرور (Password)
                  </label>
                  {authMode === 'teacher_login' && (
                    <button
                      type="button"
                      onClick={() => handleModeChange('forgot_password')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>نسيت كلمة المرور؟</span>
                    </button>
                  )}
                </div>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="block w-full rounded-xl border border-slate-300 pr-10 pl-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all text-right font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full mt-3 flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-75 ${
                  authMode === 'teacher_login'
                    ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-600/20'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {isLoading
                    ? 'جاري التحقق والاتصال بالخادم...'
                    : authMode === 'teacher_login'
                    ? 'تسجيل الدخول كمعلم'
                    : 'تسجيل الدخول كطالب'}
                </span>
              </button>

              {authMode === 'teacher_login' && (
                <div className="pt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot_password')}
                    className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>نسيت كلمة المرور؟ استعادة الحساب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('teacher_register')}
                    className="font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>تسجيل معلم جديد</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* FORM 3: FORGOT PASSWORD (Teacher Recovery Flow) */}
          {authMode === 'forgot_password' && (
            <div className="space-y-4">
              {resetStep === 'request' ? (
                /* Step 1: Enter email linked to teacher account */
                <form onSubmit={handleRequestResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>أدخل البريد الإلكتروني المرتبط بحسابك</span>
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="أدخل بريدك الإلكتروني المسجل (مثال: teacher@example.com)"
                        className="block w-full rounded-xl border border-slate-300 pr-10 pl-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all text-left font-sans"
                        dir="ltr"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      اكتب البريد الإلكتروني الذي قمت بتسجيله لحساب المعلم. سيقوم النظام بالبحث عنه مباشرة في قاعدة البيانات السحابية المركزية للبدء في استعادة كلمة المرور بشكل آمن.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-75"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>
                      {isLoading
                        ? 'جاري البحث عن الحساب في قاعدة البيانات السحابية...'
                        : 'البحث عن الحساب وبدء استعادة كلمة المرور'}
                    </span>
                  </button>

                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleModeChange('teacher_login')}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>تذكرت كلمة المرور؟ العودة لتسجيل دخول المعلم</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Set New Password for verified teacher */
                <form onSubmit={handlePerformResetSubmit} className="space-y-4">
                  {/* Verified Teacher Info Card (Never displays old password) */}
                  {recoveredTeacher && (
                    <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {recoveredTeacher.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{recoveredTeacher.name}</div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                            <span>اسم المستخدم:</span>
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                              {recoveredTeacher.username}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>تم التحقق من الحساب</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      كلمة المرور الجديدة *
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الجديدة (4 أحرف أو أرقام على الأقل)"
                        className="block w-full rounded-xl border border-slate-300 pr-10 pl-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all text-right font-mono"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      تأكيد كلمة المرور الجديدة *
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="أعد إدخال كلمة المرور الجديدة للتأكيد"
                        className="block w-full rounded-xl border border-slate-300 pr-10 pl-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all text-right font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-75"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isLoading ? 'جاري تشفير وتحديث كلمة المرور سحابياً...' : 'حفظ كلمة المرور الجديدة ومتابعة الدخول'}
                    </span>
                  </button>

                  <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep('request');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                    >
                      الرجوع للبحث ببريد إلكتروني آخر
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => handleModeChange('teacher_login')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      إلغاء والعودة لتسجيل الدخول
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* FORM 2: TEACHER REGISTRATION */}
          {authMode === 'teacher_register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل للمعلم / المعلمة *
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="مثال: أ. إبراهيم المنصوري"
                    className="block w-full rounded-xl border border-slate-300 pr-9 pl-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المادة أو التخصص التعليمي *
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={teacherSpecialty}
                    onChange={(e) => setTeacherSpecialty(e.target.value)}
                    placeholder="مثال: اللغة العربية / الرياضيات / العلوم"
                    className="block w-full rounded-xl border border-slate-300 pr-9 pl-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المستخدم للدخول (Username) *
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="teacher_ibrahim"
                      className="block w-full rounded-xl border border-slate-300 pr-9 pl-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور (Password) *
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="كلمة مرور قوية"
                      className="block w-full rounded-xl border border-slate-300 pr-9 pl-8 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="teacher@school.edu"
                      className="block w-full rounded-xl border border-slate-300 pr-9 pl-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف / الواتساب (اختياري)
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="block w-full rounded-xl border border-slate-300 pr-9 pl-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-75"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'جاري حفظ بيانات الحساب السحابي...' : 'إنشاء حساب المعلم وبدء العمل'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange('teacher_login')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                >
                  لديك حساب بالفعل؟ تسجيل الدخول
                </button>
              </div>
            </form>
          )}

          <IslamicArabesqueDivider className="my-4" />

          {/* Device Compatibility Footnote */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>مزامنة فورية عبر الإنترنت لجميع الأجهزة</span>
            </div>
            <p className="text-slate-500">
              يمكن للمعلم أو الطالب تسجيل الدخول من أي هاتف، آيباد أو كمبيوتر دون الحاجة لأي إعدادات خاصة.
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>

      {/* 4. Platform Footer */}
      <footer className="relative z-10 text-center text-xs text-white/90 space-y-0.5 mt-4">
        <div className="font-bold drop-shadow-sm">
          منصة نور البيان التعليمية © {new Date().getFullYear()}
        </div>
        <div className="text-[11px] text-emerald-200/90 drop-shadow-sm">
          بيئة تعليمية تفاعلية حديثة للأطفال والطلاب مع حفظ سحابي مؤمّن
        </div>
      </footer>
    </div>
  );
};
