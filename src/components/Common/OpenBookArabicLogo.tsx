import React from 'react';

interface OpenBookArabicLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'cover';
  showTitle?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

/**
 * أيقونة وغلاف تطبيق «نور البيان»:
 * كتاب عربي مفتوح من المنتصف تظهر على صفحاته الحروف العربية: «أ  ب  ت  ث»
 * واضحة وكبيرة وجميلة، بتصميم تعليمي إسلامي عربي أنيق وبدون أي نجمة.
 */
export const OpenBookArabicIcon: React.FC<{ className?: string; size?: number | string }> = ({
  className = 'w-6 h-6',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="كتاب نور البيان المفتوح"
  >
    <defs>
      <linearGradient id="bookPageGradR" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="90%" stopColor="#f8f5ee" />
        <stop offset="100%" stopColor="#e5dec9" />
      </linearGradient>
      <linearGradient id="bookPageGradL" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="90%" stopColor="#f8f5ee" />
        <stop offset="100%" stopColor="#e5dec9" />
      </linearGradient>
      <linearGradient id="bookCoverGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#064e3b" />
        <stop offset="50%" stopColor="#047857" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
      <linearGradient id="goldRibbon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>

    {/* Outer book cover shadow and edge */}
    <path
      d="M50 78 C38 72 16 73 6 78 C5 58 6 36 8 26 C20 22 40 23 50 30 C60 23 80 22 92 26 C94 36 95 58 94 78 C84 73 62 72 50 78Z"
      fill="url(#bookCoverGrad)"
      stroke="#f59e0b"
      strokeWidth="1"
      strokeLinejoin="round"
    />

    {/* Right Open Page (الصفحة اليمنى) */}
    <path
      d="M50 31 C60 25 80 24 90 28 C91 43 91 59 90 73 C80 69 60 68 50 74Z"
      fill="url(#bookPageGradR)"
      stroke="#d1d5db"
      strokeWidth="0.5"
    />

    {/* Left Open Page (الصفحة اليسرى) */}
    <path
      d="M50 31 C40 25 20 24 10 28 C9 43 9 59 10 73 C20 69 40 68 50 74Z"
      fill="url(#bookPageGradL)"
      stroke="#d1d5db"
      strokeWidth="0.5"
    />

    {/* Spine separator line */}
    <path d="M50 31L50 74" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />

    {/* Golden bookmark ribbon at the center bottom */}
    <path
      d="M48.5 74C48.5 82 47.5 87 46 91L50 89L54 91C52.5 87 51.5 82 51.5 74Z"
      fill="url(#goldRibbon)"
    />

    {/* Soft light halo above spine */}
    <circle cx="50" cy="22" r="2.5" fill="#fde047" opacity="0.9" />
    <path d="M50 14L50 18 M44 16L46 19 M56 16L54 19" stroke="#fde047" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />

    {/* Arabic Letters: «أ  ب» on the right page and «ت  ث» on the left page */}
    <g
      fontFamily="'Cairo', 'Tajawal', 'Amiri', serif"
      fontWeight="900"
      textAnchor="middle"
      fontSize="13.5"
      fill="#064e3b"
    >
      {/* Right page: «أ» and «ب» */}
      <text x="79" y="55" fontSize="15" fontWeight="900" fill="#064e3b">أ</text>
      <text x="63" y="55" fontSize="13.5" fontWeight="900" fill="#047857">ب</text>

      {/* Left page: «ت» and «ث» */}
      <text x="37" y="55" fontSize="13.5" fontWeight="900" fill="#047857">ت</text>
      <text x="21" y="55" fontSize="13.5" fontWeight="900" fill="#064e3b">ث</text>
    </g>
  </svg>
);

export const NoorAlBayanLogo: React.FC<OpenBookArabicLogoProps> = ({
  size = 'md',
  showTitle = true,
  showSubtitle = true,
  subtitleText,
  theme = 'light',
  className = '',
}) => {
  const iconDimensions =
    size === 'xs'
      ? 'w-6 h-6'
      : size === 'sm'
      ? 'w-9 h-9'
      : size === 'lg'
      ? 'w-16 h-16'
      : size === 'xl'
      ? 'w-24 h-24'
      : size === 'cover'
      ? 'w-32 h-32'
      : 'w-11 h-11';

  const bookSize =
    size === 'xs'
      ? 'w-4 h-4'
      : size === 'sm'
      ? 'w-6 h-6'
      : size === 'lg'
      ? 'w-11 h-11'
      : size === 'xl'
      ? 'w-16 h-16'
      : size === 'cover'
      ? 'w-24 h-24'
      : 'w-7 h-7';

  const titleSize =
    size === 'xs'
      ? 'text-xs'
      : size === 'sm'
      ? 'text-base'
      : size === 'lg'
      ? 'text-2xl'
      : size === 'xl'
      ? 'text-3xl'
      : size === 'cover'
      ? 'text-4xl'
      : 'text-xl';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* App Icon Container: Modern Rounded Square with Open Arabic Book */}
      <div
        className={`${iconDimensions} rounded-2xl bg-linear-to-br from-emerald-800 via-emerald-700 to-teal-900 flex items-center justify-center text-white shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-400/40 shrink-0 relative overflow-hidden group`}
        title="غلاف وأيقونة نور البيان: كتاب مفتوح بالحروف أ ب ت ث"
      >
        {/* Subtle radial inner glow */}
        <div className="absolute inset-0 bg-radial from-amber-300/15 via-transparent to-black/20 pointer-events-none" />

        {/* The Open Arabic Book Icon with letters أ ب ت ث */}
        <div className="relative z-10 drop-shadow-md transform group-hover:scale-105 transition-transform">
          <OpenBookArabicIcon className={bookSize} />
        </div>
      </div>

      {showTitle && (
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight ${titleSize} font-sans ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              نور <span className="text-emerald-700">البيان</span>
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              أ • ب • ت • ث
            </span>
          </div>
          {showSubtitle && (
            <p
              className={`text-xs ${
                theme === 'dark' ? 'text-emerald-200/80' : 'text-slate-500'
              } font-medium mt-0.5`}
            >
              {subtitleText || 'منهج تأسيس القراءة واللغة العربية وإدارة الصفوف'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * بطاقة غلاف تطبيق «نور البيان» الرسمية المناسبة للعرض في شاشات تسجيل الدخول
 * وعلى الهواتف والآيباد والكمبيوتر
 */
export const NoorAlBayanAppCoverCard: React.FC<{
  className?: string;
  onPreview?: () => void;
}> = ({ className = '', onPreview }) => {
  return (
    <div
      onClick={onPreview}
      className={`relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-6 shadow-2xl text-white ${className}`}
    >
      {/* Background Soft Glows */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Gold Border */}
      <div className="absolute inset-2 rounded-2xl border border-amber-400/25 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Central App Icon Emblem */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-linear-to-b from-emerald-800 to-emerald-950 p-3 shadow-2xl ring-2 ring-amber-400/50 flex items-center justify-center mb-4 relative group">
          <div className="absolute inset-0 bg-radial from-amber-400/20 to-transparent rounded-3xl" />
          <OpenBookArabicIcon className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg" />
        </div>

        {/* Big Alphabet Badge */}
        <div className="inline-flex items-center gap-3 bg-emerald-900/90 border border-amber-400/40 px-5 py-1.5 rounded-full text-base sm:text-lg font-black text-amber-300 shadow-md mb-2 tracking-widest">
          <span>أ</span>
          <span className="text-amber-400/50">•</span>
          <span>ب</span>
          <span className="text-amber-400/50">•</span>
          <span>ت</span>
          <span className="text-amber-400/50">•</span>
          <span>ث</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 font-sans">
          تطبيق <span className="text-amber-300">نور البيان</span>
        </h2>
        <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-sm leading-relaxed">
          المنصة التعليمية الشاملة لتعليم الحروف واللغة العربية وإدارة الصفوف والواجبات
        </p>

        {/* Device Badges */}
        <div className="mt-4 pt-3 border-t border-emerald-800/80 flex items-center justify-center gap-3 text-[11px] text-emerald-300">
          <span>📱 هاتف</span>
          <span className="text-emerald-600">•</span>
          <span>📟 آيباد وتابلت</span>
          <span className="text-emerald-600">•</span>
          <span>💻 كمبيوتر</span>
        </div>
      </div>
    </div>
  );
};
