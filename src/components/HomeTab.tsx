import React, { useEffect, useState } from 'react';
import { ChevronRight, Clock, FileText, Flame, Radio, Trophy, CheckSquare } from 'lucide-react';
import { EXAM_SETS } from '../data/subjects';
import { ExamMode, ExamSetInfo, Question, UserProfile } from '../types';
import { formatTimerBn, toBn } from '../utils/bengali';
import {
  ChorchaLogo,
  ShortcutAdmissionIcon,
  ShortcutAiIcon,
  ShortcutBankIcon,
  ShortcutExamIcon,
  StudentAvatar,
} from './Icons';
import { PWAInstallButton } from './PWAInstallBanner';

interface HomeTabProps {
  profile: UserProfile;
  streak: number;
  allQuestions: Question[];
  practicalDoneCount: number;
  practicalTotalCount: number;
  onNavigateTab: (tab: 'home' | 'bank' | 'exam' | 'history' | 'progress', bankFilter?: 'model' | 'subject' | 'institution') => void;
  onStartExam: (title: string, subtitle: string, questions: Question[], mode: ExamMode, durationMinutes: number) => void;
  onOpenPractical: () => void;
  onOpenAiHelper: () => void;
  onShowToast: (msg: string) => void;
}

function shufflePick(pool: Question[], count: number): Question[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

const getBanners = (totalCount: number) => [
  {
    id: 'mega1000',
    setId: 'ai_mega_1000',
    badge: `Nur সুপার ব্যাংক • ${toBn(totalCount)}+ প্রশ্ন`,
    title: '১,০০০+ AI সম্ভাব্য প্রশ্নব্যাংক',
    subtitle: 'পরীক্ষকদের AI প্রশ্নপুল ও সাজেশন থেকে বাছাইকৃত ১০ বিষয়ের র‍্যান্ডম মক টেস্ট!',
    cta: 'র‍্যান্ডম মক দাও',
    bg: 'from-[#064E3B] via-[#0B7A4B] to-[#10B981]',
  },
  {
    id: 'sug2',
    setId: 'batch2_suggestion',
    badge: 'ফ্রি সাজেশন ২০২৬',
    title: '২য় ব্যাচের জন্য ফ্রি সাজেশন',
    subtitle: '৪০টি হুবহু MCQ, বাংলা↔ইংরেজি অনুবাদ ও সংক্ষিপ্ত উত্তর একসাথে!',
    cta: 'প্র্যাকটিস শুরু করো',
    bg: 'from-[#312E81] via-[#4338CA] to-[#6366F1]',
  },
  {
    id: 'prac1',
    setId: 'practical_batch1',
    badge: 'ব্যবহারিক পরীক্ষা গাইড',
    title: 'Practical Exam চেকলিস্ট',
    subtitle: 'Windows ফোল্ডার, MS Word, Excel ফর্মুলা ও ৫ স্লাইডের PowerPoint।',
    cta: 'চেকলিস্ট দেখো',
    bg: 'from-[#9A3412] via-[#C2410C] to-[#EA580C]',
  },
];

export const HomeTab: React.FC<HomeTabProps> = ({
  profile,
  streak,
  allQuestions,
  practicalDoneCount,
  practicalTotalCount,
  onNavigateTab,
  onStartExam,
  onOpenPractical,
  onOpenAiHelper,
  onShowToast,
}) => {
  const [bannerIdx, setBannerIdx] = useState(0);
  const [showAllToday, setShowAllToday] = useState(false);
  const [countdownTick, setCountdownTick] = useState(0);

  const banners = getBanners(allQuestions.length);

  useEffect(() => {
    const t = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5200);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdownTick((c) => c + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleLaunchSet = (setInfo: ExamSetInfo, mode: ExamMode = 'mock') => {
    if (setInfo.isPractical) {
      onOpenPractical();
      return;
    }
    const qs = allQuestions.filter((q) => q.set === setInfo.id);
    if (qs.length === 0) return;
    const examQuestions = setInfo.id === 'ai_mega_1000' ? shufflePick(qs, 40) : qs;
    onStartExam(setInfo.title, setInfo.batch, examQuestions, mode, setInfo.durationMinutes);
  };

  const handleBannerClick = (banner: ReturnType<typeof getBanners>[number]) => {
    if (banner.setId === 'practical_batch1') {
      onOpenPractical();
      return;
    }
    const setInfo = EXAM_SETS.find((s) => s.id === banner.setId);
    if (setInfo) {
      handleLaunchSet(setInfo, banner.id === 'sug2' ? 'practice' : 'mock');
    }
  };

  const todaySets = showAllToday ? EXAM_SETS.filter((s) => !s.isPractical) : EXAM_SETS.slice(0, 4);

  return (
    <div className="page-enter pb-24">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigateTab('progress')}
          className="chorcha-btn inline-flex items-center gap-1.5 bg-[#FDECEE] dark:bg-rose-950/60 text-[#B91C1C] dark:text-rose-300 px-3 py-1.5 rounded-full min-h-[40px]"
          aria-label="দৈনিক স্ট্রিক"
        >
          <Flame className="w-5 h-5 fill-[#DC2626] text-[#DC2626]" />
          <span className="font-bold text-base tabular-nums">{toBn(streak)}</span>
        </button>

        <ChorchaLogo className="h-9" />

        <button
          onClick={() => onNavigateTab('progress')}
          className="chorcha-btn rounded-full p-0.5 ring-2 ring-[#E4F2EC] dark:ring-emerald-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="প্রোফাইল ও প্রোগ্রেস"
        >
          <StudentAvatar variant={profile.avatarVariant} size={40} />
        </button>
      </header>

      <div className="px-4 space-y-5 pt-1">
        {/* Banner Slider */}
        <section aria-label="ফিচার্ড ব্যানার">
          <div className="relative overflow-hidden rounded-[22px] shadow-sm">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${bannerIdx * 100}%)` }}
            >
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  onClick={() => handleBannerClick(banner)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleBannerClick(banner)}
                  className={`w-full shrink-0 bg-gradient-to-br ${banner.bg} text-white p-5 pb-9 relative cursor-pointer select-none`}
                >
                  {/* Decorative subtle shapes */}
                  <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute right-4 bottom-2 w-20 h-20 rounded-2xl rotate-12 bg-white/10 pointer-events-none" />

                  <p className="text-xs font-medium text-white/85 mb-1">{banner.badge}</p>
                  <h2 className="text-[21px] font-bold leading-snug mb-1.5 pr-10">{banner.title}</h2>
                  <p className="text-[13px] text-white/90 leading-relaxed max-w-[85%] mb-3.5">{banner.subtitle}</p>
                  <span className="inline-flex items-center gap-1.5 bg-white text-slate-900 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                    {banner.cta}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>

            {/* Chorcha-style Pill Dot Indicator */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/35 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerIdx(i);
                  }}
                  aria-label={`স্লাইড ${toBn(i + 1)}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === bannerIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4 Shortcut Icons */}
        <section className="grid grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => onNavigateTab('bank', 'subject')}
            className="chorcha-btn flex flex-col items-center gap-1.5 py-1 min-h-[76px]"
          >
            <ShortcutBankIcon />
            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
              প্রশ্নব্যাংক
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('bank', 'model')}
            className="chorcha-btn flex flex-col items-center gap-1.5 py-1 min-h-[76px]"
          >
            <ShortcutAdmissionIcon />
            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
              অ্যাডমিশন
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('exam')}
            className="chorcha-btn flex flex-col items-center gap-1.5 py-1 min-h-[76px]"
          >
            <ShortcutExamIcon />
            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
              পরীক্ষা
            </span>
          </button>

          <button
            onClick={onOpenAiHelper}
            className="chorcha-btn flex flex-col items-center gap-1.5 py-1 min-h-[76px]"
          >
            <ShortcutAiIcon />
            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
              AI সহায়ক
            </span>
          </button>
        </section>

        {/* PWA Offline App Install Card (Auto-hides once installed) */}
        <section>
          <PWAInstallButton
            variant="banner"
            allQuestions={allQuestions}
            userName={profile.name}
            onShowToast={onShowToast}
          />
        </section>

        {/* Practical Exam Quick Progress Strip */}
        <section>
          <button
            onClick={onOpenPractical}
            className="chorcha-btn w-full text-left bg-[#F2FBF7] dark:bg-emerald-950/30 border border-[#CBEAD9] dark:border-emerald-800/60 rounded-[20px] p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#0B7A4B] text-white flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[15px] text-slate-900 dark:text-white truncate">
                  ব্যবহারিক পরীক্ষা চেকলিস্ট (১০ নম্বর)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Windows, Word, Excel ও PowerPoint • সম্পন্ন {toBn(practicalDoneCount)}/{toBn(practicalTotalCount)} ধাপ
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#0B7A4B] shrink-0" />
          </button>
        </section>

        {/* আজকের পরীক্ষা Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-bold text-slate-900 dark:text-white">আজকের পরীক্ষা</h2>
            <button
              onClick={() => setShowAllToday((prev) => !prev)}
              className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#0B7A4B] dark:hover:text-emerald-400 px-1 py-1 min-h-[40px]"
            >
              {showAllToday ? 'সংক্ষেপে দেখো' : 'সবগুলো দেখো'}
            </button>
          </div>

          <div className="space-y-3">
            {todaySets.map((setInfo) => {
              const qCount = allQuestions.filter((q) => q.set === setInfo.id).length;
              const remainingCountdown = setInfo.countdownSeconds
                ? Math.max(0, setInfo.countdownSeconds - countdownTick)
                : 0;

              return (
                <div
                  key={setInfo.id}
                  onClick={() => handleLaunchSet(setInfo, 'mock')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleLaunchSet(setInfo, 'mock')}
                  className="chorcha-btn bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[20px] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] cursor-pointer"
                >
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{setInfo.batch}</p>

                  <div className="flex items-center gap-2 flex-wrap mb-2.5">
                    <h3 className="text-[17px] font-bold text-slate-900 dark:text-white leading-snug">
                      {setInfo.title}
                    </h3>
                    <span className="inline-flex items-center bg-gradient-to-r from-[#2D7FF9] to-[#6B46F5] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      Free
                    </span>
                  </div>

                  {/* Time & Question Count */}
                  <div className="flex items-center gap-3 text-[13px] text-slate-600 dark:text-slate-400 mb-3.5 tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {toBn(setInfo.durationMinutes)} মিনিট
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {setInfo.id === 'ai_mega_1000'
                        ? `৪০ টি (${toBn(qCount)}+ থেকে)`
                        : `${toBn(qCount)} টি প্রশ্ন`}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span>{toBn(setInfo.totalMarks)} নম্বর</span>
                  </div>

                  {/* Bottom Row: Live/Countdown Badge + Participant Avatars */}
                  <div className="flex items-center justify-between gap-2">
                    {setInfo.isLive ? (
                      <div className="inline-flex items-center gap-1.5 bg-[#FDECEE] dark:bg-rose-950/50 text-[#B91C1C] dark:text-rose-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <Radio className="w-3.5 h-3.5 shrink-0" />
                        <span>{setInfo.liveText || 'লাইভ আছে – ১১ ঘণ্টা বাকি'}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 bg-[#FDECEE] dark:bg-rose-950/50 text-[#9F1239] dark:text-rose-300 text-xs font-semibold px-3 py-1.5 rounded-full tabular-nums">
                        <Trophy className="w-3.5 h-3.5 shrink-0" />
                        <span>শুরু হতে বাকি – {formatTimerBn(remainingCountdown, true)}</span>
                      </div>
                    )}

                    <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-full pl-1.5 pr-2 py-1 shrink-0">
                      <div className="flex -space-x-2">
                        <StudentAvatar variant={1} size={22} className="ring-2 ring-white dark:ring-slate-900" />
                        <StudentAvatar variant={2} size={22} className="ring-2 ring-white dark:ring-slate-900" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                        {toBn(setInfo.participants || 120)} জ...
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
