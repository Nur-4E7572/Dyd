import React, { useMemo, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Flame,
  Info,
  Pencil,
  Play,
  Settings,
  Share2,
  Star,
  Trophy,
  UserPlus,
  X,
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { ExamHistoryItem, Question, SubjectId, UserProfile } from '../types';
import { getCurrentWeekDays, toBn } from '../utils/bengali';
import { computeUserRank, getTotalPoints } from '../utils/storage';
import { StudentAvatar, SubjectIcon } from './Icons';

interface ProgressTabProps {
  profile: UserProfile;
  streak: number;
  dailyPoints: Record<string, number>;
  history: ExamHistoryItem[];
  allQuestions: Question[];
  friends: { id: string; name: string; batch: string; points: number }[];
  onAddFriend: (name: string, batch: string) => void;
  onOpenSettings: () => void;
  onPracticeSubject: (subjectId: SubjectId) => void;
  onShowToast: (msg: string) => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  profile,
  streak,
  dailyPoints,
  history,
  allQuestions,
  friends,
  onAddFriend,
  onOpenSettings,
  onPracticeSubject,
  onShowToast,
}) => {
  const [openSubjectId, setOpenSubjectId] = useState<SubjectId | null>(null);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showInfoTip, setShowInfoTip] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendBatch, setFriendBatch] = useState('২য় ব্যাচ — যুব উন্নয়ন');

  const totalPoints = useMemo(() => getTotalPoints(dailyPoints), [dailyPoints]);
  const rankLabel = useMemo(() => computeUserRank(totalPoints, history.length), [totalPoints, history.length]);
  const weekDays = useMemo(() => getCurrentWeekDays(), []);

  const weekRangeLabel = `${weekDays[0].monthBn} ${weekDays[0].dayNumBn} - ${weekDays[6].monthBn} ${weekDays[6].dayNumBn}`;

  // Prepare SVG chart points (only up to today, matching Chorcha screenshot)
  const chartData = useMemo(() => {
    const activeDays = weekDays.map((d, idx) => ({
      ...d,
      idx,
      pts: Number((dailyPoints[d.dateKey] || 0).toFixed(2)),
    }));
    const maxPts = Math.max(10, ...activeDays.map((d) => d.pts));
    const width = 340;
    const height = 110;
    const padX = 24;
    const topY = 26;
    const bottomY = 92;
    const stepX = (width - padX * 2) / 6;

    const plotted = activeDays
      .filter((d) => !d.isFuture)
      .map((d) => {
        const x = padX + d.idx * stepX;
        const y = bottomY - (d.pts / maxPts) * (bottomY - topY);
        return { ...d, x, y };
      });

    const linePath = plotted.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath =
      plotted.length > 0
        ? `${linePath} L ${plotted[plotted.length - 1].x} ${bottomY + 14} L ${plotted[0].x} ${bottomY + 14} Z`
        : '';

    return { width, height, plotted, linePath, areaPath };
  }, [weekDays, dailyPoints]);

  // Subject-wise accuracy stats computed from exam history
  const subjectStats = useMemo(() => {
    const qMap = new Map<string, Question>();
    allQuestions.forEach((q) => qMap.set(q.id, q));

    const stats: Record<SubjectId, { attempted: number; correct: number; wrong: number }> = {} as Record<
      SubjectId,
      { attempted: number; correct: number; wrong: number }
    >;
    SUBJECTS.forEach((s) => {
      stats[s.id] = { attempted: 0, correct: 0, wrong: 0 };
    });

    history.forEach((exam) => {
      Object.values(exam.answers).forEach((ans) => {
        if (!ans.isAttempted) return;
        const q = qMap.get(ans.questionId);
        if (!q || !stats[q.subject]) return;
        stats[q.subject].attempted += 1;
        if (ans.isCorrect) stats[q.subject].correct += 1;
        else stats[q.subject].wrong += 1;
      });
    });

    return stats;
  }, [history, allQuestions]);

  const handleShareProgress = async () => {
    const text = `Nur — আমার প্রস্তুতি রিপোর্ট:\nনাম: ${profile.name}\nমোট পয়েন্ট: ${toBn(totalPoints)}\nসম্পন্ন পরীক্ষা: ${toBn(history.length)} টি\nদৈনিক স্ট্রিক: ${toBn(streak)} দিন`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        onShowToast('প্রোগ্রেস রিপোর্ট কপি করা হয়েছে!');
      }
    } catch {
      onShowToast('রিপোর্ট শেয়ার করার জন্য প্রস্তুত!');
    }
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) return;
    onAddFriend(friendName.trim(), friendBatch.trim() || '২য় ব্যাচ');
    setFriendName('');
    onShowToast('বন্ধু সফলভাবে যুক্ত হয়েছে!');
  };

  return (
    <div className="page-enter pb-24">
      {/* Lavender Header matching Chorcha Screenshot */}
      <div className="bg-[#A5ADFF] dark:bg-indigo-950 pt-5 pb-16 px-4 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight truncate">
              {profile.name}
            </h1>
            <p className="text-[13px] font-medium text-slate-800/80 dark:text-indigo-200 truncate mt-0.5">
              {profile.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShareProgress}
              className="chorcha-btn w-10 h-10 rounded-full bg-slate-900/15 dark:bg-white/15 flex items-center justify-center text-white"
              aria-label="প্রোগ্রেস শেয়ার করুন"
            >
              <Share2 className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={onOpenSettings}
              className="chorcha-btn w-10 h-10 rounded-full bg-slate-900/15 dark:bg-white/15 flex items-center justify-center text-white"
              aria-label="সেটিংস"
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => onShowToast(`আজকের লক্ষ্য: অন্তত ১টি মক পরীক্ষা দাও! স্ট্রিক: ${toBn(streak)} দিন`)}
              className="chorcha-btn w-10 h-10 rounded-full bg-slate-900/15 dark:bg-white/15 flex items-center justify-center text-white"
              aria-label="নোটিফিকেশন"
            >
              <Bell className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlapping Circular Avatar + Green Online Dot */}
      <div className="px-4 -mt-14 relative z-10 mb-4">
        <div className="relative inline-block">
          <div className="w-[104px] h-[104px] rounded-full bg-white dark:bg-slate-950 p-1 shadow-sm">
            <StudentAvatar variant={profile.avatarVariant} size={96} />
          </div>
          <span
            className="w-5 h-5 rounded-full bg-[#3BB54A] border-[3px] border-white dark:border-slate-950 absolute right-1 bottom-1.5"
            title="সক্রিয়"
          />
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* 4 Stats Row matching Chorcha */}
        <section className="grid grid-cols-4 gap-2 pt-1 tabular-nums">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[16px] font-bold text-slate-900 dark:text-white leading-none">
                {toBn(totalPoints.toFixed(1))}
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">পয়েন্ট</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[16px] font-bold text-slate-900 dark:text-white leading-none">
                {toBn(history.length)}
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">পরীক্ষা</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                {rankLabel}
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">র্যাংক</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 fill-[#0B7A4B] text-[#0B7A4B] shrink-0" />
            <div className="min-w-0">
              <p className="text-[16px] font-bold text-slate-900 dark:text-white leading-none">
                {toBn(streak)}
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">স্ট্রিক</p>
            </div>
          </div>
        </section>

        {/* বন্ধু অ্যাড করো Button (White tactile button with green text) */}
        <button
          onClick={() => setShowFriendModal(true)}
          className="chorcha-btn w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-b-[3px] border-b-slate-300 dark:border-b-slate-800 rounded-[18px] py-3.5 px-4 flex items-center justify-center gap-2.5 text-[#0B7A4B] dark:text-emerald-400 font-bold text-[16px] min-h-[52px]"
        >
          <UserPlus className="w-5 h-5" />
          বন্ধু অ্যাড করো
        </button>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* দৈনিক পয়েন্ট Section */}
        <section className="space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-[20px] font-bold text-slate-900 dark:text-white">দৈনিক পয়েন্ট</h2>
            <button
              onClick={() => setShowInfoTip((p) => !p)}
              className="p-1 text-slate-500 hover:text-[#0B7A4B]"
              aria-label="দৈনিক পয়েন্ট সম্পর্কে জানুন"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {weekRangeLabel}
          </p>

          {showInfoTip && (
            <div className="text-xs text-center bg-[#F2FBF7] dark:bg-emerald-950/40 text-[#065F46] dark:text-emerald-300 px-3 py-2 rounded-xl">
              প্রতিটি পরীক্ষা বা প্র্যাকটিসে সঠিক উত্তরের জন্য পয়েন্ট যোগ হয় এবং দৈনিক স্ট্রিক বাড়ে।
            </div>
          )}

          {/* SVG Line Chart */}
          <div className="pt-3">
            <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} className="w-full h-[118px] overflow-visible">
              <defs>
                <linearGradient id="pointsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {chartData.areaPath && <path d={chartData.areaPath} fill="url(#pointsAreaGrad)" />}
              {chartData.linePath && (
                <path
                  d={chartData.linePath}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {chartData.plotted.map((pt) => (
                <g key={pt.dateKey}>
                  <text
                    x={pt.x}
                    y={pt.y - 11}
                    textAnchor="middle"
                    className="fill-slate-800 dark:fill-slate-200 text-[11px] font-bold"
                  >
                    {toBn(pt.pts.toFixed(1))}
                  </text>
                  <circle cx={pt.x} cy={pt.y} r="4.5" fill="#9A5B13" stroke="#FFFFFF" strokeWidth="1.5" />
                </g>
              ))}
            </svg>

            {/* 7 Days Row with Today Highlighted in Deep Green Pill */}
            <div className="grid grid-cols-7 gap-1 mt-1 text-center tabular-nums">
              {weekDays.map((d) => (
                <div
                  key={d.dateKey}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-colors ${
                    d.isToday
                      ? 'bg-[#0B7A4B] text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[13px] leading-none">{d.dayNumBn}</span>
                  <span className={`text-[12px] mt-1 font-bold ${d.isToday ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {d.dayLetter}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* সাবজেক্ট ভিত্তিক রিপোর্ট */}
        <section className="pt-2 space-y-3">
          <h2 className="text-center text-[20px] font-bold text-slate-900 dark:text-white">
            সাবজেক্ট ভিত্তিক রিপোর্ট
          </h2>

          <div className="space-y-2.5">
            {SUBJECTS.map((subj) => {
              const stat = subjectStats[subj.id];
              const accuracy =
                stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;
              const isOpen = openSubjectId === subj.id;

              return (
                <div
                  key={subj.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[18px] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenSubjectId(isOpen ? null : subj.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left min-h-[58px]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <SubjectIcon subject={subj.id} size={24} />
                      <span className="font-bold text-[15.5px] text-slate-900 dark:text-white truncate">
                        {subj.shortName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 tabular-nums">
                      <span className="text-[15px] font-bold text-slate-500 dark:text-slate-400">
                        {toBn(accuracy)}%
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#0B7A4B]' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0B7A4B] rounded-full transition-all duration-300"
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs tabular-nums">
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl py-2">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{toBn(stat.attempted)}</p>
                          <p className="text-slate-500 dark:text-slate-400">চেষ্টা করা</p>
                        </div>
                        <div className="bg-[#F2FBF7] dark:bg-emerald-950/40 rounded-xl py-2">
                          <p className="font-bold text-[#0B7A4B] dark:text-emerald-400 text-sm">{toBn(stat.correct)}</p>
                          <p className="text-slate-500 dark:text-slate-400">সঠিক</p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-950/40 rounded-xl py-2">
                          <p className="font-bold text-rose-600 dark:text-rose-400 text-sm">{toBn(stat.wrong)}</p>
                          <p className="text-slate-500 dark:text-slate-400">ভুল</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onPracticeSubject(subj.id)}
                        className="chorcha-btn w-full bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 min-h-[40px]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        এই বিষয়ে দ্রুত প্র্যাকটিস করো
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Add Friend / Study Buddy Modal */}
      {showFriendModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowFriendModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="sheet-enter w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-t-[28px] p-5 pb-7 max-h-[80vh] overflow-y-auto space-y-4"
          >
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">বন্ধু ও লিডারবোর্ড</h3>
              <button
                onClick={() => setShowFriendModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFriendSubmit} className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">নতুন স্টাডি পার্টনার যোগ করো</p>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="বন্ধুর নাম লিখুন..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B7A4B]"
              />
              <input
                type="text"
                value={friendBatch}
                onChange={(e) => setFriendBatch(e.target.value)}
                placeholder="ব্যাচ বা জেলা..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B7A4B]"
              />
              <button
                type="submit"
                className="chorcha-btn w-full bg-[#0B7A4B] text-white font-bold text-sm py-2.5 rounded-xl min-h-[44px]"
              >
                তালিকায় যোগ করো
              </button>
            </form>

            {/* Leaderboard comparing user + friends */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">ব্যাচ লিডারবোর্ড</p>
              {[
                { id: 'me', name: `${profile.name} (তুমি)`, batch: profile.subtitle, points: totalPoints, isMe: true },
                ...friends.map((f) => ({ ...f, isMe: false })),
              ]
                .sort((a, b) => b.points - a.points)
                .map((person, idx) => (
                  <div
                    key={person.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-2xl border ${
                      person.isMe
                        ? 'bg-[#E4F2EC]/70 dark:bg-emerald-950/50 border-[#0B7A4B]/40'
                        : 'bg-white dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                        {toBn(idx + 1)}
                      </span>
                      <StudentAvatar variant={idx} size={34} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{person.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{person.batch}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#0B7A4B] dark:text-emerald-400 tabular-nums shrink-0">
                      {toBn(person.points.toFixed(1))} প.
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
