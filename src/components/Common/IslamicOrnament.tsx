import React from 'react';
import { OpenBookArabicIcon } from './OpenBookArabicLogo';

export { OpenBookArabicIcon };

/**
 * استبدال الرمز القديم (النجمة) برمز الكتاب العربي المفتوح بالحروف أ ب ت ث
 * لضمان عدم ظهور أي نجمة في أي شاشة من شاشات التطبيق
 */
export const IslamicStarIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <OpenBookArabicIcon className={className} />
);

export const IslamicArabesqueDivider: React.FC<{ className?: string }> = ({ className = 'my-4' }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <div className="h-px bg-linear-to-r from-transparent via-emerald-300 to-emerald-500 flex-1 max-w-[120px]" />
    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70">
      <OpenBookArabicIcon className="w-4 h-4" />
      <span className="text-[11px] font-black tracking-widest text-emerald-900 font-serif">أ • ب • ت • ث</span>
    </div>
    <div className="h-px bg-linear-to-l from-transparent via-emerald-300 to-emerald-500 flex-1 max-w-[120px]" />
  </div>
);

export const NoorAlBayanLogo: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  theme?: 'light' | 'dark';
}> = ({ size = 'md', showSubtitle = true, subtitleText, theme = 'light' }) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-11 h-11';
  const bookSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* غلاف وأيقونة التطبيق: كتاب عربي مفتوح بالحروف أ ب ت ث */}
      <div
        className={`${iconSize} rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 flex items-center justify-center text-amber-300 shadow-lg shadow-emerald-900/15 ring-2 ring-emerald-400/40 shrink-0 relative overflow-hidden group`}
        title="غلاف وأيقونة تطبيق نور البيان: كتاب عربي مفتوح"
      >
        <div className="absolute inset-0 bg-radial from-amber-400/15 to-transparent pointer-events-none" />
        <OpenBookArabicIcon className={bookSize} />
      </div>

      <div className="text-right">
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight ${titleSize} font-sans ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            نور <span className="text-emerald-700">البيان</span>
          </span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
            أ • ب • ت • ث
          </span>
        </div>
        {showSubtitle && (
          <p
            className={`text-xs ${
              theme === 'dark' ? 'text-emerald-200/80' : 'text-slate-500'
            } font-medium mt-0.5`}
          >
            {subtitleText || 'منهج تأسيس القراءة واللغة العربية وإدارة الصفوف والواجبات'}
          </p>
        )}
      </div>
    </div>
  );
};
