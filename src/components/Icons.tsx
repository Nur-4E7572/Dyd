import React from 'react';
import { SubjectId } from '../types';

/** Nur ব্র্যান্ড লোগো (লাল অ্যাকসেন্ট স্ট্রোক ও সবুজ AI ব্যাজসহ) */
export const ChorchaLogo: React.FC<{ className?: string }> = ({ className = 'h-9' }) => (
  <div className={`inline-flex items-center gap-1.5 select-none ${className}`} aria-label="Nur">
    <svg viewBox="0 0 112 46" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* লাল টপ অ্যাকসেন্ট স্ট্রোক */}
      <path d="M46 6C51 2 59 2 64 5C58 9 52 11 45 12C44 9 44.5 7 46 6Z" fill="#E11D48" />
      <text
        x="10"
        y="35"
        fontFamily="'Hind Siliguri', sans-serif"
        fontWeight="700"
        fontSize="32"
        letterSpacing="-0.5"
        className="fill-slate-900 dark:fill-white"
      >
        Nur
      </text>
      <rect x="72" y="14" width="32" height="20" rx="6" fill="#0B7A4B" />
      <text
        x="88"
        y="29"
        textAnchor="middle"
        fontFamily="'Hind Siliguri', sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="#FFFFFF"
      >
        AI
      </text>
    </svg>
  </div>
);

/** কার্টুন প্রোফাইল অ্যাভাটার (চর্চার মতো চশমা ও মিষ্টি হাসিসহ) */
export const StudentAvatar: React.FC<{ variant?: number; size?: number; className?: string }> = ({
  variant = 0,
  size = 44,
  className = '',
}) => {
  const bgColors = ['#D6DCFF', '#D1FAE5', '#FEF3C7', '#FCE7F3'];
  const shirtColors = ['#0E7490', '#0B7A4B', '#4F46E5', '#BE185D'];
  const bg = bgColors[variant % bgColors.length];
  const shirt = shirtColors[variant % shirtColors.length];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`rounded-full shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="50" fill={bg} />
      {/* Shirt / Shoulders */}
      <path d="M18 92C22 76 34 70 50 70C66 70 78 76 82 92C73 97 62 100 50 100C38 100 27 97 18 92Z" fill={shirt} />
      {/* Ears */}
      <circle cx="26" cy="52" r="5.5" fill="#F9C5B4" />
      <circle cx="74" cy="52" r="5.5" fill="#F9C5B4" />
      {/* Hair back/top */}
      <path d="M27 42C27 28 36 22 50 22C64 22 73 28 73 42V55H27V42Z" fill="#18181B" />
      <path d="M28 24L45 27L68 23L65 34H30L28 24Z" fill="#18181B" />
      {/* Face */}
      <rect x="29" y="34" width="42" height="44" rx="18" fill="#FCD3C2" />
      {/* Beard / Jaw for variant 0 & 2 */}
      {variant % 2 === 0 && (
        <path
          d="M29 56V62C29 72 38 80 50 80C62 80 71 72 71 62V56H67V62C67 69 60 74 50 74C40 74 33 69 33 62V56H29Z"
          fill="#18181B"
        />
      )}
      {/* Glasses */}
      <rect x="33" y="44" width="15" height="14" rx="4.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.8" />
      <rect x="52" y="44" width="15" height="14" rx="4.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.8" />
      <line x1="48" y1="50" x2="52" y2="50" stroke="#18181B" strokeWidth="2.8" />
      {/* Eyes */}
      <circle cx="41" cy="51" r="2.6" fill="#18181B" />
      <circle cx="59" cy="51" r="2.6" fill="#18181B" />
      {/* Nose & Smile */}
      <path d="M48 56C49 58 51 58 52 56" stroke="#D99482" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 65C46 68 54 68 57 65" stroke="#B45A4A" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};

/** হিস্ট্রি খালি থাকলে লাল গোলগাল কার্টুন মাসকট (হাতে খালি বাক্স) — স্ক্রিনশটের আদলে */
export const EmptyMascotSvg: React.FC<{ className?: string }> = ({ className = 'w-44 h-44' }) => (
  <svg viewBox="0 0 220 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shadow */}
    <ellipse cx="110" cy="172" rx="68" ry="9" fill="#E2E8F0" className="dark:fill-slate-800" />
    {/* Cute rounded ears */}
    <ellipse cx="67" cy="48" rx="9" ry="11" transform="rotate(-20 67 48)" fill="#991B1B" />
    <ellipse cx="147" cy="48" rx="9" ry="11" transform="rotate(20 147 48)" fill="#991B1B" />
    {/* Chubby Red Body */}
    <path
      d="M52 146C42 120 48 64 78 46C96 36 122 36 140 46C170 64 176 120 166 146C162 158 156 168 144 168H74C62 168 56 158 52 146Z"
      fill="#C81E1E"
    />
    {/* Belly cream patch */}
    <path
      d="M68 112C68 88 85 75 109 75C133 75 150 88 150 112V156H68V112Z"
      fill="#FEF3E2"
    />
    {/* Big expressive eyes */}
    <ellipse cx="90" cy="70" rx="11" ry="14" fill="#FFFFFF" />
    <ellipse cx="122" cy="72" rx="11" ry="14" fill="#FFFFFF" />
    <ellipse cx="93" cy="73" rx="5.5" ry="7.5" fill="#1E293B" />
    <ellipse cx="120" cy="75" rx="5.5" ry="7.5" fill="#1E293B" />
    <circle cx="95" cy="70" r="2" fill="#FFFFFF" />
    <circle cx="122" cy="72" r="2" fill="#FFFFFF" />
    {/* Nose */}
    <ellipse cx="106" cy="83" rx="5" ry="3.5" fill="#450A0A" />
    {/* Curious frown + tiny tooth */}
    <path d="M84 96C96 90 118 90 132 98" stroke="#7F1D1D" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M117 94L120 102L125 95" fill="#FFFFFF" stroke="#7F1D1D" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Empty Cardboard Box */}
    <path d="M80 112H144L138 158H86L80 112Z" fill="#E39D5B" />
    {/* Box inner dark flap */}
    <path d="M80 112L94 128H132L144 112H80Z" fill="#C47D3B" />
    {/* Front open flaps */}
    <path d="M94 128L66 152L88 164L114 146L94 128Z" fill="#F2B879" />
    <path d="M132 128L154 146L134 166L114 146L132 128Z" fill="#F7C790" />
    <path d="M84 146H136V166H84V146Z" fill="#D48B47" />
    {/* Cute paws holding box */}
    <path d="M56 116C64 110 82 114 88 124C92 131 86 139 76 138C64 137 54 128 56 116Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.5" />
    <path d="M162 116C154 110 138 114 134 124C131 131 137 139 147 138C158 137 166 128 162 116Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.5" />
  </svg>
);

/** হোম শর্টকাট আইকন ৪টি (চর্চার মতো 3D স্কুইর্কেল স্টাইল) */
export const ShortcutBankIcon: React.FC = () => (
  <svg viewBox="0 0 56 56" className="w-12 h-12" fill="none">
    <rect x="6" y="14" width="44" height="34" rx="8" fill="#D98A2B" />
    <rect x="4" y="10" width="48" height="12" rx="4" fill="#F5A623" />
    <rect x="19" y="27" width="18" height="5" rx="2.5" fill="#92520F" />
    <path d="M10 44H46" stroke="#B56E1A" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const ShortcutAdmissionIcon: React.FC = () => (
  <svg viewBox="0 0 56 56" className="w-12 h-12" fill="none">
    <rect x="9" y="8" width="38" height="42" rx="10" fill="#F59E0B" />
    <rect x="13" y="12" width="30" height="34" rx="6" fill="#FFFFFF" />
    <rect x="20" y="6" width="16" height="8" rx="4" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
    <circle cx="19" cy="23" r="2.2" fill="#A855F7" />
    <rect x="24" y="21.5" width="14" height="3" rx="1.5" fill="#CBD5E1" />
    <circle cx="19" cy="31" r="2.2" fill="#8B5CF6" />
    <rect x="24" y="29.5" width="12" height="3" rx="1.5" fill="#CBD5E1" />
    <circle cx="19" cy="39" r="2.2" fill="#6366F1" />
    <rect x="24" y="37.5" width="10" height="3" rx="1.5" fill="#CBD5E1" />
  </svg>
);

export const ShortcutExamIcon: React.FC = () => (
  <svg viewBox="0 0 56 56" className="w-12 h-12" fill="none">
    <rect x="6" y="6" width="44" height="44" rx="12" fill="#B91C4A" />
    <rect x="9" y="9" width="38" height="38" rx="9" fill="#E1496E" />
    <path d="M18 39L21.5 28L35 14.5C36.8 12.7 39.7 12.7 41.5 14.5C43.3 16.3 43.3 19.2 41.5 21L28 34.5L18 39Z" fill="#FDE68A" />
    <path d="M34 15.5L40.5 22L36.5 26L30 19.5L34 15.5Z" fill="#F59E0B" />
    <path d="M18 39L21 30L26 35L18 39Z" fill="#475569" />
  </svg>
);

export const ShortcutAiIcon: React.FC = () => (
  <svg viewBox="0 0 56 56" className="w-12 h-12" fill="none">
    <rect x="6" y="6" width="44" height="44" rx="12" fill="#312E81" />
    <rect x="9" y="9" width="38" height="38" rx="9" fill="#4F46E5" />
    {/* Sparkle top */}
    <path d="M28 13L29.5 17.5L34 19L29.5 20.5L28 25L26.5 20.5L22 19L26.5 17.5L28 13Z" fill="#FFFFFF" />
    {/* Cute Bot head */}
    <rect x="16" y="25" width="24" height="16" rx="8" fill="#E0E7FF" />
    <rect x="20" y="29" width="16" height="8" rx="4" fill="#1E1B4B" />
    <circle cx="24.5" cy="33" r="1.8" fill="#38BDF8" />
    <circle cx="31.5" cy="33" r="1.8" fill="#38BDF8" />
  </svg>
);

/** ১০টি বিষয়ের রঙিন আইকন (পরীক্ষা ট্যাব ও রিপোর্টের জন্য) */
export const SubjectIcon: React.FC<{ subject: SubjectId; size?: number }> = ({ subject, size = 28 }) => {
  switch (subject) {
    case 'computer_basics':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="4" y="6" width="24" height="16" rx="3" fill="#EAB308" />
          <rect x="6.5" y="8.5" width="19" height="11" rx="1.5" fill="#FEF9C3" />
          <path d="M12 26H20M16 22V26" stroke="#A16207" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'internet_email':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" fill="#3B82F6" />
          <ellipse cx="16" cy="16" rx="5" ry="11" stroke="#DBEAFE" strokeWidth="1.8" />
          <path d="M5 16H27M7 11H25M7 21H25" stroke="#DBEAFE" strokeWidth="1.6" />
        </svg>
      );
    case 'hardware_security':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path d="M16 4L26 8V15C26 21.5 21.6 26.8 16 28.5C10.4 26.8 6 21.5 6 15V8L16 4Z" fill="#E11D48" />
          <path d="M12.5 16.5L15 19L20.5 13.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'ai_ml':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" fill="#4F46E5" />
          <circle cx="11.5" cy="13" r="2.2" fill="#E0E7FF" />
          <circle cx="20.5" cy="13" r="2.2" fill="#E0E7FF" />
          <circle cx="16" cy="21" r="2.2" fill="#E0E7FF" />
          <path d="M11.5 13L20.5 13L16 21L11.5 13Z" stroke="#A5B4FC" strokeWidth="1.6" />
        </svg>
      );
    case 'genai_prompt':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="4" y="6" width="24" height="18" rx="5" fill="#059669" />
          <path d="M11 24L8 28V24" fill="#059669" />
          <path d="M16 10L17.5 13.5L21 15L17.5 16.5L16 20L14.5 16.5L11 15L14.5 13.5L16 10Z" fill="#FFFFFF" />
        </svg>
      );
    case 'ai_ethics':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" fill="#9333EA" />
          <path d="M16 9V23M10 13H22M10 13L8 19H12L10 13ZM22 13L20 19H24L22 13Z" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case 'ai_tools':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="5" y="5" width="22" height="22" rx="6" fill="#0891B2" />
          <path d="M10 21V15M16 21V11M22 21V13" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'graphic_freelancing':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" fill="#65A30D" />
          <circle cx="12" cy="13" r="2" fill="#FEF08A" />
          <circle cx="19" cy="12" r="2" fill="#FDA4AF" />
          <circle cx="21" cy="18" r="2" fill="#93C5FD" />
          <circle cx="13" cy="20" r="2.2" fill="#FFFFFF" />
        </svg>
      );
    case 'english':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <text x="3" y="23" fontFamily="'Hind Siliguri', sans-serif" fontWeight="700" fontSize="19" fill="#6D28D9">
            Aa
          </text>
        </svg>
      );
    case 'ms_office':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="5" y="5" width="22" height="22" rx="5" fill="#0F766E" />
          <path d="M10 11H22M10 16H22M10 21H17" stroke="#CCFBF1" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
  }
};

/** প্রশ্নব্যাংক গ্রেডিয়েন্ট কার্ডের ভেতরের ডেকোরেটিভ ভেক্টর ইলাস্ট্রেশন */
export const CardIllustration: React.FC<{ subject: SubjectId }> = ({ subject }) => {
  switch (subject) {
    case 'computer_basics':
      return (
        <svg viewBox="0 0 80 65" className="w-20 h-16 opacity-35" fill="none">
          <rect x="14" y="8" width="52" height="34" rx="5" fill="white" />
          <rect x="6" y="45" width="68" height="8" rx="3" fill="white" />
        </svg>
      );
    case 'english':
      return (
        <svg viewBox="0 0 80 70" className="w-20 h-16 opacity-30" fill="none">
          <text x="18" y="60" fontFamily="sans-serif" fontWeight="800" fontSize="62" fill="white">A</text>
        </svg>
      );
    case 'ai_ml':
      return (
        <svg viewBox="0 0 80 65" className="w-20 h-16 opacity-30" fill="none">
          <circle cx="24" cy="20" r="8" fill="white" />
          <circle cx="58" cy="22" r="8" fill="white" />
          <circle cx="42" cy="50" r="8" fill="white" />
          <path d="M24 20L58 22L42 50L24 20Z" stroke="white" strokeWidth="4" />
        </svg>
      );
    case 'genai_prompt':
      return (
        <svg viewBox="0 0 80 65" className="w-20 h-16 opacity-30" fill="none">
          <path d="M44 8L49 24L65 29L49 34L44 50L39 34L23 29L39 24L44 8Z" fill="white" />
          <circle cx="20" cy="48" r="5" fill="white" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 65" className="w-20 h-16 opacity-25" fill="none">
          <circle cx="52" cy="36" r="24" fill="white" />
          <rect x="14" y="22" width="28" height="28" rx="7" fill="white" fillOpacity="0.65" />
        </svg>
      );
  }
};
