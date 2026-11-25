import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Bookmark,
  CheckCircle2,
  Clock,
  Home,
  MinusCircle,
  RotateCcw,
  Star,
  XCircle,
} from 'lucide-react';
import { ExamHistoryItem, Question } from '../types';
import { formatTimerBn, MCQ_LETTERS, toBn } from '../utils/bengali';

interface ResultViewProps {
  result: ExamHistoryItem;
  allQuestions: Question[];
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onPracticeMistakes: (questions: Question[]) => void;
  onClose: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  allQuestions,
  bookmarks,
  onToggleBookmark,
  onPracticeMistakes,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');

  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    allQuestions.forEach((q) => map.set(q.id, q));
    return map;
  }, [allQuestions]);

  const examQuestions = useMemo(
    () => result.questionIds.map((id) => questionMap.get(id)).filter(Boolean) as Question[],
    [result.questionIds, questionMap]
  );

  const wrongQuestions = useMemo(
    () =>
      examQuestions.filter((q) => {
        const rec = result.answers[q.id];
        return rec && rec.isAttempted && !rec.isCorrect;
      }),
    [examQuestions, result.answers]
  );

  const filteredQuestions = useMemo(() => {
    return examQuestions.filter((q) => {
      const rec = result.answers[q.id];
      if (filter === 'all') return true;
      if (filter === 'correct') return Boolean(rec?.isAttempted && rec.isCorrect);
      if (filter === 'wrong') return Boolean(rec?.isAttempted && !rec.isCorrect);
      return !rec?.isAttempted;
    });
  }, [examQuestions, result.answers, filter]);

  const gradeText =
    result.percentage >= 80
      ? 'অসাধারণ প্রস্তুতি!'
      : result.percentage >= 60
        ? 'ভালো হয়েছে, আরও এগিয়ে যাও!'
        : 'ভুলগুলো অনুশীলন করলে আরও ভালো করবে!';

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 pb-12 page-enter">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="chorcha-btn w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
          aria-label="বন্ধ করুন"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">পরীক্ষার ফলাফল</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{result.title}</p>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Hero Score Card */}
        <section className="bg-gradient-to-br from-[#065F46] via-[#0B7A4B] to-[#159960] text-white rounded-[26px] p-5 shadow-md relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />

          <div className="flex items-center justify-between gap-4 relative z-10">
            <div>
              <p className="text-xs font-medium text-emerald-100 mb-1 flex items-center gap-1">
                <Award className="w-4 h-4" /> {gradeText}
              </p>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-4xl font-bold">{toBn(result.obtainedMarks)}</span>
                <span className="text-lg text-emerald-100 font-semibold">/ {toBn(result.totalMarks)}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-emerald-100 tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> সময়: {formatTimerBn(result.durationSecondsSpent)}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> +{toBn(result.pointsEarned)} পয়েন্ট
                </span>
              </div>
            </div>

            {/* Percentage Ring */}
            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-xs border-4 border-white/80 flex flex-col items-center justify-center shrink-0 tabular-nums">
              <span className="text-xl font-bold leading-none">{toBn(result.percentage)}%</span>
              <span className="text-[10px] text-emerald-100 mt-0.5">সঠিক হার</span>
            </div>
          </div>
        </section>

        {/* 3 Stat Breakdown */}
        <section className="grid grid-cols-3 gap-2.5 tabular-nums">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[18px] p-3.5 text-center">
            <CheckCircle2 className="w-5 h-5 text-[#0B7A4B] mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{toBn(result.correctCount)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">সঠিক</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[18px] p-3.5 text-center">
            <XCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{toBn(result.wrongCount)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">ভুল</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[18px] p-3.5 text-center">
            <MinusCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{toBn(result.unansweredCount)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">উত্তরহীন</p>
          </div>
        </section>

        {/* Primary Action CTAs */}
        <section className="flex flex-col gap-2.5">
          {wrongQuestions.length > 0 && (
            <button
              onClick={() => onPracticeMistakes(wrongQuestions)}
              className="chorcha-btn w-full bg-[#0B7A4B] hover:bg-[#08613B] text-white font-bold text-sm py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm min-h-[48px]"
            >
              <RotateCcw className="w-4 h-4" />
              ভুলগুলো আবার অনুশীলন করো ({toBn(wrongQuestions.length)} টি)
            </button>
          )}
          <button
            onClick={onClose}
            className="chorcha-btn w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 min-h-[46px]"
          >
            <Home className="w-4 h-4" />
            ফিরে যাও
          </button>
        </section>

        {/* Review Filter Tabs */}
        <section className="pt-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2.5">প্রশ্নভিত্তিক রিভিউ</h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {(
              [
                { id: 'all', label: `সব (${toBn(examQuestions.length)})` },
                { id: 'correct', label: `সঠিক (${toBn(result.correctCount)})` },
                { id: 'wrong', label: `ভুল (${toBn(result.wrongCount)})` },
                { id: 'skipped', label: `উত্তরহীন (${toBn(result.unansweredCount)})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`chorcha-btn shrink-0 px-3.5 py-2 rounded-full text-xs font-bold min-h-[38px] ${
                  filter === tab.id
                    ? 'bg-[#0B7A4B] text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 mt-2">
            {filteredQuestions.map((q, idx) => {
              const rec = result.answers[q.id];
              const isBookmarked = bookmarks.includes(q.id);
              const statusText = !rec?.isAttempted ? 'উত্তরহীন' : rec.isCorrect ? 'সঠিক' : 'ভুল';
              const statusClass = !rec?.isAttempted
                ? 'text-slate-500'
                : rec.isCorrect
                  ? 'text-[#0B7A4B] dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400';

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-bold ${statusClass}`}>
                      প্রশ্ন {toBn(idx + 1)} · {statusText}
                    </span>
                    <button
                      onClick={() => onToggleBookmark(q.id)}
                      className="p-1.5 -m-1 rounded-full min-w-[34px] min-h-[34px] flex items-center justify-center"
                      aria-label="বুকমার্ক করুন"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`}
                      />
                    </button>
                  </div>

                  <p className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug">{q.question}</p>

                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-1.5 text-sm">
                      {q.options.map((opt, oi) => {
                        const isRight = oi === q.correctIndex;
                        const isPicked = rec?.selectedOptionIndex === oi;
                        let optStyle = 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-300';
                        if (isRight) {
                          optStyle =
                            'bg-[#E4F2EC] dark:bg-emerald-950/60 border-[#0B7A4B] text-[#065F46] dark:text-emerald-300 font-semibold';
                        } else if (isPicked && !isRight) {
                          optStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-800 dark:text-rose-200 font-semibold';
                        }
                        return (
                          <div key={oi} className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${optStyle}`}>
                            <span className="font-bold">{MCQ_LETTERS[oi]})</span>
                            <span className="flex-1">{opt}</span>
                            {isRight && <CheckCircle2 className="w-4 h-4 text-[#0B7A4B] shrink-0" />}
                            {isPicked && !isRight && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type !== 'mcq' && (
                    <div className="space-y-1.5 text-sm">
                      {rec?.typedAnswer && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
                          <span className="text-xs font-bold block text-slate-500 mb-0.5">আপনার উত্তর:</span>
                          {rec.typedAnswer}
                        </div>
                      )}
                      <div className="p-3 rounded-xl bg-[#F2FBF7] dark:bg-emerald-950/40 text-[#065F46] dark:text-emerald-300">
                        <span className="text-xs font-bold block mb-0.5">মডেল উত্তর:</span>
                        <span className="whitespace-pre-line">{q.answer}</span>
                      </div>
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl leading-relaxed">
                      <span className="font-bold">ব্যাখ্যা:</span> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
