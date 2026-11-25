import React, { useMemo, useState } from 'react';
import { Bookmark, CheckCircle2, ChevronRight, Clock, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { ExamHistoryItem, Question, SubjectId } from '../types';
import { formatBnDate, formatTimerBn, getQuestionTypeLabel, toBn } from '../utils/bengali';
import { EmptyMascotSvg } from './Icons';

interface HistoryTabProps {
  allQuestions: Question[];
  bookmarks: string[];
  mistakes: string[];
  history: ExamHistoryItem[];
  onToggleBookmark: (id: string) => void;
  onRemoveMistake: (id: string) => void;
  onStartPracticeList: (title: string, questions: Question[]) => void;
  onOpenExamResult: (item: ExamHistoryItem) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  allQuestions,
  bookmarks,
  mistakes,
  history,
  onToggleBookmark,
  onRemoveMistake,
  onStartPracticeList,
  onOpenExamResult,
}) => {
  const [subTab, setSubTab] = useState<'bookmarks' | 'mistakes' | 'exams'>('bookmarks');
  const [subjectFilter, setSubjectFilter] = useState<'all' | SubjectId>('all');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    allQuestions.forEach((q) => map.set(q.id, q));
    return map;
  }, [allQuestions]);

  const bookmarkedQuestions = useMemo(() => {
    const list = bookmarks.map((id) => questionMap.get(id)).filter(Boolean) as Question[];
    if (subjectFilter === 'all') return list;
    return list.filter((q) => q.subject === subjectFilter);
  }, [bookmarks, questionMap, subjectFilter]);

  const mistakeQuestions = useMemo(() => {
    const list = mistakes.map((id) => questionMap.get(id)).filter(Boolean) as Question[];
    if (subjectFilter === 'all') return list;
    return list.filter((q) => q.subject === subjectFilter);
  }, [mistakes, questionMap, subjectFilter]);

  const activeList = subTab === 'bookmarks' ? bookmarkedQuestions : mistakeQuestions;

  return (
    <div className="page-enter pb-24 min-h-[100dvh] flex flex-col">
      {/* Top 3 Tabs matching Chorcha screenshot */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 pt-3">
        <div className="grid grid-cols-3 text-center">
          {(
            [
              { id: 'bookmarks', label: 'দাগানো প্রশ্ন' },
              { id: 'mistakes', label: 'পূর্বের ভুল' },
              { id: 'exams', label: 'পরীক্ষা' },
            ] as const
          ).map((t) => {
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                className="relative py-3 text-[15px] font-bold transition-colors min-h-[48px]"
              >
                <span className={active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}>
                  {t.label}
                </span>
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[3.5px] bg-[#0B7A4B] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Horizontal Subject Filter Chips (for Bookmarks & Mistakes) */}
      {subTab !== 'exams' && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSubjectFilter('all')}
            className={`chorcha-btn shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors min-h-[40px] ${
              subjectFilter === 'all'
                ? 'bg-[#0B7A4B] text-white border-[#0B7A4B]'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs'
            }`}
          >
            সব বিষয়
          </button>
          {SUBJECTS.map((subj) => {
            const active = subjectFilter === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => setSubjectFilter(subj.id)}
                className={`chorcha-btn shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors min-h-[40px] ${
                  active
                    ? 'bg-[#0B7A4B] text-white border-[#0B7A4B]'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs'
                }`}
              >
                {subj.shortName}
              </button>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 px-4 flex flex-col">
        {/* Bookmarks or Mistakes List */}
        {subTab !== 'exams' && (
          <>
            {activeList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <EmptyMascotSvg className="w-44 h-40 mb-3" />
                <p className="text-[20px] font-bold text-slate-800 dark:text-slate-200">কোনো প্রশ্ন পাওয়া যায়নি</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-[260px]">
                  {subTab === 'bookmarks'
                    ? 'প্রশ্নব্যাংক বা পরীক্ষা চলাকালে বুকমার্ক আইকনে ট্যাপ করলে প্রশ্ন এখানে জমা হবে।'
                    : 'পরীক্ষা বা প্র্যাকটিসে ভুল উত্তর দেওয়া প্রশ্নগুলো স্বয়ংক্রিয়ভাবে এখানে জমা হবে।'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <button
                  onClick={() =>
                    onStartPracticeList(
                      subTab === 'bookmarks' ? 'দাগানো প্রশ্ন প্র্যাকটিস' : 'পূর্বের ভুল সংশোধন প্র্যাকটিস',
                      activeList
                    )
                  }
                  className="chorcha-btn w-full bg-[#0B7A4B] text-white font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 min-h-[46px] shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  {subTab === 'bookmarks'
                    ? `দাগানো প্রশ্নগুলো প্র্যাকটিস করো (${toBn(activeList.length)} টি)`
                    : `ভুলগুলো আবার অনুশীলন করো (${toBn(activeList.length)} টি)`}
                </button>

                {activeList.map((q, idx) => {
                  const isOpen = Boolean(revealed[q.id]);
                  const subjName = SUBJECTS.find((s) => s.id === q.subject)?.shortName || q.subject;
                  return (
                    <div
                      key={q.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#0B7A4B] dark:text-emerald-400">
                          {toBn(idx + 1)}. {subjName} · {getQuestionTypeLabel(q.type)}
                        </span>
                        {subTab === 'bookmarks' ? (
                          <button
                            onClick={() => onToggleBookmark(q.id)}
                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="বুকমার্ক সরান"
                          >
                            <Bookmark className="w-4 h-4 fill-amber-400 text-amber-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onRemoveMistake(q.id)}
                            className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600"
                            aria-label="ভুল তালিকা থেকে সরান"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug">{q.question}</p>

                      <button
                        onClick={() => setRevealed((p) => ({ ...p, [q.id]: !p[q.id] }))}
                        className="chorcha-btn inline-flex items-center gap-1.5 text-xs font-bold text-[#0B7A4B] dark:text-emerald-400 bg-[#E4F2EC]/80 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl min-h-[34px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isOpen ? 'উত্তর লুকাও' : 'উত্তর ও ব্যাখ্যা দেখো'}
                      </button>

                      {isOpen && (
                        <div className="p-3 rounded-2xl bg-[#F2FBF7] dark:bg-emerald-950/30 text-sm space-y-1">
                          <p className="font-bold text-[#065F46] dark:text-emerald-300 whitespace-pre-line">
                            সঠিক উত্তর: {q.answer}
                          </p>
                          {q.explanation && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Completed Exams History */}
        {subTab === 'exams' && (
          <>
            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <EmptyMascotSvg className="w-44 h-40 mb-3" />
                <p className="text-[20px] font-bold text-slate-800 dark:text-slate-200">কোনো পরীক্ষা পাওয়া যায়নি</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-[260px]">
                  যেকোনো মক পরীক্ষা বা প্র্যাকটিস শেষ করলেই তার নম্বর ও বিশ্লেষণ এখানে সংরক্ষিত থাকবে।
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onOpenExamResult(item)}
                    className="chorcha-btn w-full text-left bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-4 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatBnDate(item.dateISO)}</span>
                        <span>·</span>
                        <span>{item.mode === 'mock' ? 'মক পরীক্ষা' : 'দ্রুত প্র্যাকটিস'}</span>
                      </div>
                      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white truncate">{item.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                        <span className="inline-flex items-center gap-1 text-[#0B7A4B] dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {toBn(item.obtainedMarks)}/{toBn(item.totalMarks)} ({toBn(item.percentage)}%)
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimerBn(item.durationSecondsSpent)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
