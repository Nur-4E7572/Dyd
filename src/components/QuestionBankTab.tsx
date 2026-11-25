import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Eye,
  EyeOff,
  Pencil,
  Play,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { EXAM_SETS, INSTITUTIONS, SUBJECTS } from '../data/subjects';
import { ExamMode, Question, QuestionType, SubjectId } from '../types';
import { getQuestionTypeLabel, MCQ_LETTERS, toBn } from '../utils/bengali';
import { CardIllustration } from './Icons';

interface QuestionBankTabProps {
  allQuestions: Question[];
  bookmarks: string[];
  initialFilter?: 'model' | 'subject' | 'institution';
  onToggleBookmark: (id: string) => void;
  onStartExam: (title: string, subtitle: string, questions: Question[], mode: ExamMode, durationMinutes: number) => void;
  onOpenPractical: () => void;
}

interface DetailSelection {
  title: string;
  subtitle: string;
  questions: Question[];
  defaultDuration: number;
}

export const QuestionBankTab: React.FC<QuestionBankTabProps> = ({
  allQuestions,
  bookmarks,
  initialFilter = 'subject',
  onToggleBookmark,
  onStartExam,
  onOpenPractical,
}) => {
  const [filterMode, setFilterMode] = useState<'model' | 'subject' | 'institution'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<DetailSelection | null>(null);
  const [detailTypeFilter, setDetailTypeFilter] = useState<'all' | QuestionType>('all');
  const [visibleLimit, setVisibleLimit] = useState<number>(40);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setFilterMode(initialFilter);
  }, [initialFilter]);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchingQuestions = useMemo(() => {
    if (!trimmedQuery) return [];
    return allQuestions
      .filter(
        (q) =>
          q.question.toLowerCase().includes(trimmedQuery) ||
          q.answer.toLowerCase().includes(trimmedQuery) ||
          q.explanation.toLowerCase().includes(trimmedQuery)
      )
      .slice(0, 20);
  }, [allQuestions, trimmedQuery]);

  const filteredSubjects = useMemo(() => {
    if (!trimmedQuery) return SUBJECTS;
    return SUBJECTS.filter(
      (s) =>
        s.name.toLowerCase().includes(trimmedQuery) ||
        s.shortName.toLowerCase().includes(trimmedQuery) ||
        s.subtitle.toLowerCase().includes(trimmedQuery)
    );
  }, [trimmedQuery]);

  const filteredSets = useMemo(() => {
    if (!trimmedQuery) return EXAM_SETS;
    return EXAM_SETS.filter(
      (s) =>
        s.title.toLowerCase().includes(trimmedQuery) ||
        s.batch.toLowerCase().includes(trimmedQuery) ||
        s.subtitle.toLowerCase().includes(trimmedQuery)
    );
  }, [trimmedQuery]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openSubjectDetail = (subjectId: SubjectId) => {
    const subj = SUBJECTS.find((s) => s.id === subjectId);
    if (!subj) return;
    const qs = allQuestions.filter((q) => q.subject === subjectId);
    setDetailTypeFilter('all');
    setVisibleLimit(40);
    setSelectedDetail({
      title: subj.shortName,
      subtitle: subj.name,
      questions: qs,
      defaultDuration: Math.max(15, Math.min(45, qs.length)),
    });
  };

  const openSetDetail = (setId: string) => {
    const setInfo = EXAM_SETS.find((s) => s.id === setId);
    if (!setInfo) return;
    if (setInfo.isPractical) {
      onOpenPractical();
      return;
    }
    const qs = allQuestions.filter((q) => q.set === setId);
    setDetailTypeFilter('all');
    setVisibleLimit(40);
    setSelectedDetail({
      title: setInfo.title,
      subtitle: setInfo.batch,
      questions: qs,
      defaultDuration: setInfo.durationMinutes,
    });
  };

  const openInstitutionDetail = (instId: string) => {
    const inst = INSTITUTIONS.find((i) => i.id === instId);
    if (!inst) return;
    const qs = allQuestions.filter((q) => q.institution === instId);
    setDetailTypeFilter('all');
    setVisibleLimit(40);
    setSelectedDetail({
      title: inst.name,
      subtitle: inst.subtitle,
      questions: qs,
      defaultDuration: 45,
    });
  };

  // Detail View (প্রশ্ন তালিকা + দ্রুত পড়ার মোড + পরীক্ষা শুরু)
  if (selectedDetail) {
    const visibleQs =
      detailTypeFilter === 'all'
        ? selectedDetail.questions
        : selectedDetail.questions.filter((q) => q.type === detailTypeFilter);

    const availableTypes: ('all' | QuestionType)[] = ['all'];
    (['mcq', 'short', 'translate', 'written'] as QuestionType[]).forEach((t) => {
      if (selectedDetail.questions.some((q) => q.type === t)) availableTypes.push(t);
    });

    const pickForSession = (source: Question[]): Question[] => {
      if (source.length <= 50) return source;
      const copy = [...source];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, 40);
    };

    const paginatedQs = visibleQs.slice(0, visibleLimit);
    const remainingCount = Math.max(0, visibleQs.length - paginatedQs.length);

    return (
      <div className="page-enter pb-32 min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedDetail(null)}
            className="chorcha-btn w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label="পিছনে যাও"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-200" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">{selectedDetail.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {selectedDetail.subtitle} • মোট {toBn(selectedDetail.questions.length)} টি প্রশ্ন
            </p>
          </div>
        </header>

        {/* Action Banner */}
        <div className="p-4 pb-2 flex gap-2.5">
          <button
            onClick={() =>
              onStartExam(
                selectedDetail.title,
                selectedDetail.subtitle,
                pickForSession(visibleQs.length > 0 ? visibleQs : selectedDetail.questions),
                'mock',
                selectedDetail.defaultDuration
              )
            }
            className="chorcha-btn flex-1 bg-[#0B7A4B] hover:bg-[#08613B] text-white font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm min-h-[46px]"
          >
            <Play className="w-4 h-4 fill-white" />
            {visibleQs.length > 50 ? '৪০ প্রশ্নের মক দাও' : 'মক পরীক্ষা দাও'}
          </button>
          <button
            onClick={() =>
              onStartExam(
                selectedDetail.title,
                selectedDetail.subtitle,
                pickForSession(visibleQs.length > 0 ? visibleQs : selectedDetail.questions),
                'practice',
                selectedDetail.defaultDuration
              )
            }
            className="chorcha-btn flex-1 bg-white dark:bg-slate-900 border border-[#0B7A4B] text-[#0B7A4B] dark:text-emerald-400 font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 min-h-[46px]"
          >
            <Sparkles className="w-4 h-4" />
            দ্রুত প্র্যাকটিস
          </button>
        </div>

        {/* Question Type Filter Chips */}
        {availableTypes.length > 2 && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
            {availableTypes.map((t) => {
              const active = detailTypeFilter === t;
              const label =
                t === 'all'
                  ? `সব (${toBn(selectedDetail.questions.length)})`
                  : `${getQuestionTypeLabel(t)} (${toBn(selectedDetail.questions.filter((q) => q.type === t).length)})`;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setDetailTypeFilter(t);
                    setVisibleLimit(40);
                  }}
                  className={`chorcha-btn shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors min-h-[38px] ${
                    active
                      ? 'bg-[#0B7A4B] text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Question Study List */}
        <div className="px-4 pt-2 space-y-3">
          {paginatedQs.map((q, idx) => {
            const isBookmarked = bookmarks.includes(q.id);
            const isRevealed = Boolean(revealedIds[q.id]);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-4 shadow-[0_1px_4px_rgba(15,23,42,0.03)]"
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="font-bold text-[#0B7A4B] dark:text-emerald-400">প্রশ্ন {toBn(idx + 1)}</span>
                    <span>·</span>
                    <span>{getQuestionTypeLabel(q.type)}</span>
                    <span>·</span>
                    <span>{toBn(q.marks)} নম্বর</span>
                  </div>
                  <button
                    onClick={() => onToggleBookmark(q.id)}
                    className="p-1.5 -m-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="প্রশ্ন দাগান"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        isBookmarked ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                      }`}
                    />
                  </button>
                </div>

                <h3 className="text-[15.5px] font-semibold text-slate-900 dark:text-white leading-relaxed mb-3">
                  {q.question}
                </h3>

                {q.type === 'mcq' && q.options && (
                  <div className="space-y-1.5 mb-3">
                    {q.options.map((opt, oi) => {
                      const isCorrect = isRevealed && oi === q.correctIndex;
                      return (
                        <div
                          key={oi}
                          className={`text-sm px-3 py-2 rounded-xl border flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-[#E4F2EC] dark:bg-emerald-950/60 border-[#0B7A4B] text-[#065F46] dark:text-emerald-300 font-semibold'
                              : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="font-bold shrink-0">{MCQ_LETTERS[oi]})</span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-[#0B7A4B] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => toggleReveal(q.id)}
                  className="chorcha-btn inline-flex items-center gap-1.5 text-xs font-bold text-[#0B7A4B] dark:text-emerald-400 bg-[#E4F2EC]/80 dark:bg-emerald-950/50 px-3 py-2 rounded-xl min-h-[36px]"
                >
                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {isRevealed ? 'উত্তর লুকাও' : 'উত্তর ও ব্যাখ্যা দেখো'}
                </button>

                {isRevealed && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-[#F2FBF7] dark:bg-emerald-950/30 border border-[#CBEAD9] dark:border-emerald-800/50 text-sm space-y-1.5">
                    <p className="font-bold text-[#065F46] dark:text-emerald-300 whitespace-pre-line">
                      সঠিক উত্তর: {q.answer}
                    </p>
                    {q.explanation && (
                      <p className="text-slate-700 dark:text-slate-300 text-[13px] leading-relaxed">
                        <span className="font-semibold">ব্যাখ্যা:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {remainingCount > 0 && (
            <button
              onClick={() => setVisibleLimit((prev) => prev + 40)}
              className="chorcha-btn w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#0B7A4B] dark:text-emerald-400 font-bold text-sm py-3.5 rounded-2xl shadow-2xs min-h-[48px]"
            >
              আরও প্রশ্ন দেখো (বাকি {toBn(remainingCount)} টি)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-36">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 pt-3 pb-3">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="প্রশ্নব্যাংক খুঁজো"
            className="w-full bg-[#EDEDED] dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-full pl-11 pr-11 py-3 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0B7A4B]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 w-8 h-8 rounded-full bg-slate-300/70 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200"
              aria-label="সার্চ মুছুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Sky-Tinted Chorcha Container */}
      <div className="px-3.5">
        <div className="bg-[#E5F2F5] dark:bg-slate-900/90 rounded-[26px] p-4 space-y-4">
          {/* Header inside sky box */}
          <div className="pb-2 border-b border-[#CDE4EA] dark:border-slate-800">
            <h1 className="text-[20px] font-bold text-slate-900 dark:text-white">
              {filterMode === 'subject'
                ? 'বিষয় ভিত্তিক'
                : filterMode === 'model'
                  ? 'মডেল টেস্ট ও ব্যাচ সেট'
                  : 'প্রতিষ্ঠান ভিত্তিক'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {filterMode === 'subject'
                ? 'সকল বিষয়ের প্রশ্নব্যাংক ও সাজেশন'
                : filterMode === 'model'
                  ? '১ম ও ২য় ব্যাচের ভর্তি পরীক্ষা ও ফ্রি সাজেশন'
                  : 'যুব উন্নয়ন অধিদপ্তর ও পলিটেকনিক প্রশ্নপত্র'}
            </p>
          </div>

          {/* 1. বিষয় ভিত্তিক 2-Column Gradient Cards */}
          {filterMode === 'subject' && (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredSubjects.map((subj) => {
                const count = allQuestions.filter((q) => q.subject === subj.id).length;
                return (
                  <button
                    key={subj.id}
                    onClick={() => openSubjectDetail(subj.id)}
                    className={`chorcha-btn text-left relative overflow-hidden rounded-[22px] p-3.5 h-[168px] flex flex-col justify-between bg-gradient-to-br ${subj.gradient} shadow-sm`}
                  >
                    <div className="relative z-10">
                      <h2 className="text-[17px] font-bold text-white leading-snug drop-shadow-xs">
                        {subj.shortName}
                      </h2>
                      <p className="text-[11px] text-white/85 mt-0.5 line-clamp-2 leading-tight">
                        {subj.subtitle}
                      </p>
                    </div>

                    {/* Decorative illustration bottom-right */}
                    <div className="absolute right-1 bottom-1 pointer-events-none">
                      <CardIllustration subject={subj.id} />
                    </div>

                    {/* Bottom-left white capsule with pencil + count */}
                    <div className="relative z-10 inline-flex items-center gap-1.5 bg-white text-slate-900 px-3 py-1 rounded-xl w-fit shadow-xs">
                      <Pencil className="w-3.5 h-3.5 text-slate-800" />
                      <span className="text-[13px] font-bold tabular-nums">{toBn(count)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. মডেল টেস্ট 2-Column Gradient Cards */}
          {filterMode === 'model' && (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredSets.map((setInfo) => {
                const count = setInfo.isPractical
                  ? 4
                  : allQuestions.filter((q) => q.set === setInfo.id).length;
                return (
                  <button
                    key={setInfo.id}
                    onClick={() => openSetDetail(setInfo.id)}
                    className={`chorcha-btn text-left relative overflow-hidden rounded-[22px] p-3.5 h-[168px] flex flex-col justify-between bg-gradient-to-br ${setInfo.gradient} shadow-sm`}
                  >
                    <div className="relative z-10">
                      <span className="text-[11px] font-medium text-white/85 block mb-0.5">
                        {toBn(setInfo.totalMarks)} নম্বর • {toBn(setInfo.durationMinutes)} মি.
                      </span>
                      <h2 className="text-[16px] font-bold text-white leading-snug">
                        {setInfo.shortTitle}
                      </h2>
                      <p className="text-[11px] text-white/85 mt-1 line-clamp-2 leading-tight">
                        {setInfo.subtitle}
                      </p>
                    </div>

                    <div className="relative z-10 inline-flex items-center gap-1.5 bg-white text-slate-900 px-3 py-1 rounded-xl w-fit shadow-xs">
                      <Pencil className="w-3.5 h-3.5 text-slate-800" />
                      <span className="text-[13px] font-bold tabular-nums">
                        {setInfo.isPractical ? '৪ কাজ' : toBn(count)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. প্রতিষ্ঠান ভিত্তিক Cards */}
          {filterMode === 'institution' && (
            <div className="space-y-3.5">
              {INSTITUTIONS.map((inst) => {
                const count = allQuestions.filter((q) => q.institution === inst.id).length;
                return (
                  <button
                    key={inst.id}
                    onClick={() => openInstitutionDetail(inst.id)}
                    className={`chorcha-btn w-full text-left relative overflow-hidden rounded-[22px] p-5 bg-gradient-to-br ${inst.gradient} text-white shadow-sm`}
                  >
                    <h2 className="text-[19px] font-bold mb-1">{inst.name}</h2>
                    <p className="text-xs text-white/90 mb-4 leading-relaxed max-w-[85%]">{inst.subtitle}</p>
                    <div className="inline-flex items-center gap-1.5 bg-white text-slate-900 px-3 py-1 rounded-xl shadow-xs">
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold tabular-nums">{toBn(count)} টি প্রশ্ন</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Live Question Matches when Searching */}
          {trimmedQuery && matchingQuestions.length > 0 && (
            <div className="pt-2 space-y-2.5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                প্রশ্ন মিলেছে ({toBn(matchingQuestions.length)} টি)
              </h3>
              {matchingQuestions.map((q) => {
                const isOpen = Boolean(revealedIds[q.id]);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleReveal(q.id)}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{q.question}</p>
                    {isOpen ? (
                      <p className="text-xs text-[#0B7A4B] dark:text-emerald-400 font-semibold mt-2">
                        উত্তর: {q.answer}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">উত্তর দেখতে ট্যাপ করুন</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Filter Bar (Chorcha Style, right above Bottom Nav) */}
      <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-3 py-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-20">
        <div className="flex items-center justify-between gap-2">
          {(
            [
              { id: 'model', label: 'মডেল টেস্ট' },
              { id: 'subject', label: 'বিষয় ভিত্তিক' },
              { id: 'institution', label: 'প্রতিষ্ঠান ভিত্তিক' },
            ] as const
          ).map((item) => {
            const active = filterMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilterMode(item.id)}
                className={`chorcha-btn flex-1 py-2.5 px-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all min-h-[42px] ${
                  active
                    ? 'bg-[#0B7A4B] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
