import React, { useState } from 'react';
import { Check, Clock, Play, SlidersHorizontal, X } from 'lucide-react';
import { EXAM_SETS, SUBJECTS } from '../data/subjects';
import { ExamMode, Question, SubjectInfo, UserSettings } from '../types';
import { toBn } from '../utils/bengali';
import { SubjectIcon } from './Icons';

interface ExamTabProps {
  allQuestions: Question[];
  settings: UserSettings;
  onStartExam: (
    title: string,
    subtitle: string,
    questions: Question[],
    mode: ExamMode,
    durationMinutes: number,
    negativeOverride?: boolean
  ) => void;
  onOpenPractical: () => void;
}

interface PendingConfig {
  title: string;
  subtitle: string;
  pool: Question[];
  defaultDuration: number;
}

export const ExamTab: React.FC<ExamTabProps> = ({
  allQuestions,
  settings,
  onStartExam,
  onOpenPractical,
}) => {
  const [mode, setMode] = useState<ExamMode>('mock');
  const [pending, setPending] = useState<PendingConfig | null>(null);
  const [qLimit, setQLimit] = useState<number>(20);
  const [duration, setDuration] = useState<number>(settings.defaultDurationMinutes);
  const [typeFilter, setTypeFilter] = useState<'all' | 'mcq' | 'written_short'>('all');
  const [negMarking, setNegMarking] = useState<boolean>(settings.negativeMarking);

  const openSubjectConfig = (subj: SubjectInfo) => {
    const pool = allQuestions.filter((q) => q.subject === subj.id);
    setPending({
      title: subj.shortName,
      subtitle: subj.name,
      pool,
      defaultDuration: Math.min(45, Math.max(10, pool.length)),
    });
    setQLimit(Math.min(20, pool.length));
    setDuration(Math.min(45, Math.max(10, pool.length)));
    setTypeFilter('all');
    setNegMarking(settings.negativeMarking);
  };

  const openPresetConfig = (setId: string) => {
    const setInfo = EXAM_SETS.find((s) => s.id === setId);
    if (!setInfo) return;
    if (setInfo.isPractical) {
      onOpenPractical();
      return;
    }
    const pool = allQuestions.filter((q) => q.set === setId);
    setPending({
      title: setInfo.title,
      subtitle: setInfo.batch,
      pool,
      defaultDuration: setInfo.durationMinutes,
    });
    setQLimit(pool.length > 60 ? 40 : pool.length);
    setDuration(setInfo.durationMinutes);
    setTypeFilter('all');
    setNegMarking(settings.negativeMarking);
  };

  const handleConfirmStart = () => {
    if (!pending) return;
    let filtered = pending.pool;
    if (typeFilter === 'mcq') {
      filtered = filtered.filter((q) => q.type === 'mcq');
    } else if (typeFilter === 'written_short') {
      filtered = filtered.filter((q) => q.type !== 'mcq');
    }
    if (filtered.length === 0) filtered = pending.pool;

    const targetCount = Math.min(qLimit, filtered.length);
    let chosen: Question[];
    if (targetCount < filtered.length) {
      const shuffled = [...filtered];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      chosen = shuffled.slice(0, targetCount);
    } else {
      chosen = filtered;
    }

    onStartExam(pending.title, pending.subtitle, chosen, mode, duration, negMarking);
    setPending(null);
  };

  return (
    <div className="page-enter pb-24">
      {/* Top 2 Tabs: মক পরীক্ষা | দ্রুত প্র্যাকটিস */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md pt-4 pb-2 px-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => setMode('mock')}
            className="relative pb-2.5 px-2 min-h-[44px] flex flex-col items-center justify-center"
          >
            <span
              className={`text-[18px] font-bold transition-colors ${
                mode === 'mock' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              মক পরীক্ষা
            </span>
            {mode === 'mock' && (
              <span className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#0B7A4B] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setMode('practice')}
            className="relative pb-2.5 px-2 min-h-[44px] flex flex-col items-center justify-center"
          >
            <span
              className={`text-[18px] font-bold transition-colors ${
                mode === 'practice' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              দ্রুত প্র্যাকটিস
            </span>
            {mode === 'practice' && (
              <span className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#0B7A4B] rounded-full" />
            )}
          </button>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-6">
        {/* Mode Helper Line */}
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
          {mode === 'mock'
            ? 'টাইমারসহ পূর্ণাঙ্গ পরীক্ষা — জমা দেওয়ার পর বিস্তারিত রেজাল্ট ও ব্যাখ্যা'
            : 'টাইমার ছাড়া অনুশীলন — প্রতিটি উত্তরের সাথে সাথেই সঠিক উত্তর ও ব্যাখ্যা'}
        </p>

        {/* বিষয় ভিত্তিক 2-Column Tactile Grid */}
        <section>
          <h2 className="text-center text-[18px] font-bold text-slate-900 dark:text-white mb-4">
            বিষয় ভিত্তিক
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map((subj) => {
              const count = allQuestions.filter((q) => q.subject === subj.id).length;
              return (
                <button
                  key={subj.id}
                  onClick={() => openSubjectConfig(subj)}
                  className="chorcha-btn bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-b-[3px] border-b-slate-300/90 dark:border-b-slate-800 rounded-[18px] px-3.5 py-3.5 flex items-center gap-3 text-left min-h-[70px] hover:border-[#0B7A4B]/50"
                >
                  <div className="shrink-0">
                    <SubjectIcon subject={subj.id} size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                      {subj.shortName}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5 tabular-nums">
                      {toBn(count)} প্রশ্ন
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* প্রিসেট পরীক্ষা Chips */}
        <section className="pt-1">
          <h2 className="text-center text-[18px] font-bold text-slate-900 dark:text-white mb-4">
            প্রিসেট পরীক্ষা
          </h2>

          <div className="flex flex-wrap justify-center gap-2.5">
            {EXAM_SETS.map((setInfo) => (
              <button
                key={setInfo.id}
                onClick={() => openPresetConfig(setInfo.id)}
                className="chorcha-btn bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-b-[3px] border-b-slate-300/80 dark:border-b-slate-800 rounded-full px-4 py-2.5 text-[14px] font-bold text-slate-800 dark:text-slate-100 hover:border-[#0B7A4B] hover:text-[#0B7A4B] dark:hover:text-emerald-400 min-h-[44px]"
              >
                {setInfo.shortTitle}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Exam Config Bottom Sheet */}
      {pending && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setPending(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="sheet-enter w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-t-[28px] p-5 pb-7 shadow-2xl space-y-5"
          >
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#0B7A4B] dark:text-emerald-400">
                  {mode === 'mock' ? 'মক পরীক্ষা কনফিগারেশন' : 'দ্রুত প্র্যাকটিস কনফিগারেশন'}
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{pending.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{pending.subtitle}</p>
              </div>
              <button
                onClick={() => setPending(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Question Count */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block">
                প্রশ্ন সংখ্যা (মোট আছে {toBn(pending.pool.length)} টি)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(pending.pool.length > 100
                  ? [20, 40, 60, 100]
                  : [10, 20, 40, pending.pool.length]
                )
                  .filter((v, i, arr) => v > 0 && v <= pending.pool.length && arr.indexOf(v) === i)
                  .map((num) => (
                    <button
                      key={num}
                      onClick={() => setQLimit(num)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-colors min-h-[42px] tabular-nums ${
                        qLimit === num
                          ? 'bg-[#0B7A4B] text-white border-[#0B7A4B]'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {num === pending.pool.length ? `সব (${toBn(num)})` : toBn(num)}
                    </button>
                  ))}
              </div>
            </div>

            {/* Time Limit (Only for Mock Exam) */}
            {mode === 'mock' && (
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0B7A4B]" />
                  পরীক্ষার সময় (মিনিট)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 35, 45].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-colors min-h-[42px] tabular-nums ${
                        duration === mins
                          ? 'bg-[#0B7A4B] text-white border-[#0B7A4B]'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {toBn(mins)} মি.
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question Type */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0B7A4B]" />
                প্রশ্নের ধরন
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'all', label: 'সব ধরন' },
                    { id: 'mcq', label: 'শুধু MCQ' },
                    { id: 'written_short', label: 'লিখিত/অনুবাদ' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-colors min-h-[42px] ${
                      typeFilter === t.id
                        ? 'bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300 border-[#0B7A4B]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Marking Toggle */}
            {mode === 'mock' && (
              <button
                onClick={() => setNegMarking((prev) => !prev)}
                className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 min-h-[50px]"
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">নেগেটিভ মার্কিং (-০.২৫)</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">প্রতিটি ভুল MCQ উত্তরে ০.২৫ নম্বর কাটা যাবে</p>
                </div>
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                    negMarking
                      ? 'bg-[#0B7A4B] border-[#0B7A4B] text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {negMarking && <Check className="w-4 h-4" />}
                </span>
              </button>
            )}

            <button
              onClick={handleConfirmStart}
              className="chorcha-btn w-full bg-[#0B7A4B] hover:bg-[#08613B] text-white font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md min-h-[50px]"
            >
              <Play className="w-4 h-4 fill-white" />
              {mode === 'mock' ? 'পরীক্ষা শুরু করো' : 'প্র্যাকটিস শুরু করো'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
