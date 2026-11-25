import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Grid2x2,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
  XCircle,
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { ExamHistoryItem, ExamSession, UserAnswerRecord } from '../types';
import { formatTimerBn, getQuestionTypeLabel, MCQ_LETTERS, toBn } from '../utils/bengali';

interface ExamRunnerProps {
  session: ExamSession;
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onFinish: (result: ExamHistoryItem, wrongIds: string[], correctedIds: string[]) => void;
  onCancel: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  session,
  bookmarks,
  onToggleBookmark,
  onFinish,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswerRecord>>({});
  const [revealedShortIds, setRevealedShortIds] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(session.durationMinutes * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const totalQs = session.questions.length;
  const currentQ = session.questions[currentIndex];
  const currentAns = answers[currentQ.id];
  const isBookmarked = bookmarks.includes(currentQ.id);
  const isPractice = session.mode === 'practice';

  const subjectLabel = useMemo(() => {
    const found = SUBJECTS.find((s) => s.id === currentQ.subject);
    return found ? found.shortName : currentQ.subject;
  }, [currentQ.subject]);

  const submitExam = () => {
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;
    const wrongIds: string[] = [];
    const correctedIds: string[] = [];

    session.questions.forEach((q) => {
      totalMarks += q.marks;
      const rec = answers[q.id];
      if (!rec || !rec.isAttempted) {
        unansweredCount += 1;
      } else if (rec.isCorrect) {
        correctCount += 1;
        obtainedMarks += q.marks;
        correctedIds.push(q.id);
      } else {
        wrongCount += 1;
        wrongIds.push(q.id);
        if (session.negativeMarking && q.type === 'mcq') {
          obtainedMarks -= 0.25;
        }
      }
    });

    obtainedMarks = Math.max(0, Number(obtainedMarks.toFixed(2)));
    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
    const pointsEarned = Number(Math.max(1, obtainedMarks * 1.2).toFixed(1));

    const result: ExamHistoryItem = {
      id: `exam_${Date.now()}`,
      title: session.title,
      subtitle: session.subtitle,
      mode: session.mode,
      dateISO: new Date().toISOString(),
      durationSecondsSpent: elapsedSeconds,
      totalQuestions: totalQs,
      totalMarks,
      obtainedMarks,
      correctCount,
      wrongCount,
      unansweredCount,
      percentage,
      pointsEarned,
      negativeMarking: session.negativeMarking,
      questionIds: session.questions.map((q) => q.id),
      answers,
    };

    onFinish(result, wrongIds, correctedIds);
  };

  // Timer tick
  useEffect(() => {
    const t = setInterval(() => {
      setElapsedSeconds((e) => e + 1);
      if (!isPractice) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(t);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [isPractice]);

  // Auto-submit when mock timer hits 0
  useEffect(() => {
    if (!isPractice && secondsLeft === 0) {
      submitExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isPractice]);

  const handleSelectMcq = (optionIndex: number) => {
    if (isPractice && currentAns?.isAttempted) return; // Lock after immediate feedback in practice
    const isCorrect = optionIndex === currentQ.correctIndex;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        selectedOptionIndex: optionIndex,
        isCorrect,
        isAttempted: true,
      },
    }));
  };

  const handleSelfEval = (evalResult: 'correct' | 'wrong') => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] || { questionId: currentQ.id }),
        questionId: currentQ.id,
        selfEval: evalResult,
        isCorrect: evalResult === 'correct',
        isAttempted: true,
      },
    }));
  };

  const handleTypedAnswer = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] || {
          questionId: currentQ.id,
          isCorrect: false,
          isAttempted: false,
        }),
        typedAnswer: val,
      },
    }));
  };

  const answeredCount = Object.values(answers).filter((a) => a.isAttempted).length;
  const progressPct = Math.round(((currentIndex + 1) / totalQs) * 100);
  const lowTime = !isPractice && secondsLeft <= 300;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F7FAF8] dark:bg-slate-950">
      {/* Top Sticky Exam Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="chorcha-btn w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0"
            aria-label="পরীক্ষা থেকে বের হোন"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Timer or Practice label */}
          {!isPractice ? (
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold tabular-nums ${
                lowTime
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                  : 'bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimerBn(secondsLeft)}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300">
              দ্রুত প্র্যাকটিস মোড
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums px-2">
              {toBn(currentIndex + 1)}/{toBn(totalQs)}
            </span>
            <button
              onClick={() => onToggleBookmark(currentQ.id)}
              className={`chorcha-btn w-10 h-10 rounded-full flex items-center justify-center border ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              aria-label="প্রশ্ন বুকমার্ক করুন"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0B7A4B] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 px-4 py-4 pb-32 space-y-4">
        {/* Question Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[22px] p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="font-semibold text-[#0B7A4B] dark:text-emerald-400">{subjectLabel}</span>
            <div className="flex items-center gap-1.5 tabular-nums">
              <span>{getQuestionTypeLabel(currentQ.type)}</span>
              <span>·</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{toBn(currentQ.marks)} নম্বর</span>
            </div>
          </div>

          <h2 className="text-[17px] font-bold text-slate-900 dark:text-white leading-relaxed">
            {toBn(currentIndex + 1)}. {currentQ.question}
          </h2>
        </div>

        {/* MCQ Options */}
        {currentQ.type === 'mcq' && currentQ.options && (
          <div className="space-y-2.5">
            {currentQ.options.map((opt, oi) => {
              const isSelected = currentAns?.selectedOptionIndex === oi;
              const isCorrectOpt = oi === currentQ.correctIndex;
              const showFeedback = isPractice && currentAns?.isAttempted;

              let cardClass =
                'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-[#0B7A4B]/60';
              let letterClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

              if (showFeedback) {
                if (isCorrectOpt) {
                  cardClass =
                    'bg-[#E4F2EC] dark:bg-emerald-950/60 border-[#0B7A4B] text-[#065F46] dark:text-emerald-200 font-semibold';
                  letterClass = 'bg-[#0B7A4B] text-white';
                } else if (isSelected && !isCorrectOpt) {
                  cardClass =
                    'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-200 font-semibold';
                  letterClass = 'bg-rose-600 text-white';
                }
              } else if (isSelected) {
                cardClass =
                  'bg-[#E4F2EC] dark:bg-emerald-950/50 border-[#0B7A4B] text-[#065F46] dark:text-emerald-200 font-semibold shadow-xs';
                letterClass = 'bg-[#0B7A4B] text-white';
              }

              return (
                <button
                  key={oi}
                  onClick={() => handleSelectMcq(oi)}
                  className={`chorcha-btn w-full text-left border-2 rounded-[18px] p-3.5 flex items-center gap-3 min-h-[56px] transition-all ${cardClass}`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${letterClass}`}
                  >
                    {MCQ_LETTERS[oi]}
                  </span>
                  <span className="flex-1 text-[15px] leading-snug">{opt}</span>
                  {showFeedback && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-[#0B7A4B] shrink-0" />}
                  {showFeedback && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Short / Translate / Written Self-Evaluation */}
        {currentQ.type !== 'mcq' && (
          <div className="space-y-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] p-4 space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                নিজের উত্তর লিখে চর্চা করুন (ঐচ্ছিক):
              </label>
              <textarea
                rows={currentQ.type === 'written' ? 4 : 2}
                value={currentAns?.typedAnswer || ''}
                onChange={(e) => handleTypedAnswer(e.target.value)}
                placeholder={
                  currentQ.type === 'translate'
                    ? 'অনুবাদটি এখানে লিখুন...'
                    : 'সংক্ষেপে মূল উত্তরটি এখানে লিখুন...'
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B7A4B]"
              />

              <button
                onClick={() => setRevealedShortIds((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                className="chorcha-btn w-full bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300 font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Eye className="w-4 h-4" />
                {revealedShortIds[currentQ.id] ? 'মডেল উত্তর লুকাও' : 'মডেল উত্তর দেখো'}
              </button>
            </div>

            {revealedShortIds[currentQ.id] && (
              <div className="bg-white dark:bg-slate-900 border border-[#0B7A4B]/40 rounded-[20px] p-4 space-y-3 shadow-xs">
                <div>
                  <p className="text-xs font-bold text-[#0B7A4B] dark:text-emerald-400 mb-1">মডেল উত্তর:</p>
                  <p className="text-[15px] font-semibold text-slate-900 dark:text-white whitespace-pre-line leading-relaxed">
                    {currentQ.answer}
                  </p>
                </div>

                {currentQ.explanation && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl leading-relaxed">
                    <span className="font-bold">ব্যাখ্যা:</span> {currentQ.explanation}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 text-center">
                    আমি কি পেরেছি? (স্ব-মূল্যায়ন করুন)
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleSelfEval('correct')}
                      className={`chorcha-btn py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 border min-h-[44px] ${
                        currentAns?.selfEval === 'correct'
                          ? 'bg-[#0B7A4B] text-white border-[#0B7A4B]'
                          : 'bg-[#F2FBF7] dark:bg-emerald-950/40 text-[#0B7A4B] dark:text-emerald-300 border-[#CBEAD9] dark:border-emerald-800'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      হ্যাঁ, পেরেছি
                    </button>
                    <button
                      onClick={() => handleSelfEval('wrong')}
                      className={`chorcha-btn py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 border min-h-[44px] ${
                        currentAns?.selfEval === 'wrong'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      না, আবার পড়ব
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instant Explanation in Practice Mode for MCQ */}
        {isPractice && currentQ.type === 'mcq' && currentAns?.isAttempted && (
          <div
            className={`rounded-[20px] p-4 border text-sm space-y-1.5 ${
              currentAns.isCorrect
                ? 'bg-[#F2FBF7] dark:bg-emerald-950/40 border-[#0B7A4B]/40 text-[#065F46] dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <p className="font-bold flex items-center gap-1.5">
              {currentAns.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#0B7A4B]" /> চমৎকার! সঠিক উত্তর।
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" /> সঠিক উত্তর: {currentQ.answer}
                </>
              )}
            </p>
            {currentQ.explanation && (
              <p className="text-slate-700 dark:text-slate-300 text-[13px] leading-relaxed">
                <span className="font-semibold">ব্যাখ্যা:</span> {currentQ.explanation}
              </p>
            )}
          </div>
        )}
      </main>

      {/* Bottom Sticky Controls */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-3 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="chorcha-btn px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center gap-1 disabled:opacity-40 min-h-[46px]"
          >
            <ChevronLeft className="w-4 h-4" />
            আগের
          </button>

          <button
            onClick={() => setShowNavigator(true)}
            className="chorcha-btn px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center gap-1.5 min-h-[46px] tabular-nums"
            aria-label="প্রশ্ন নেভিগেটর"
          >
            <Grid2x2 className="w-4 h-4 text-[#0B7A4B]" />
            <span>{toBn(answeredCount)}/{toBn(totalQs)}</span>
          </button>

          {currentIndex < totalQs - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalQs - 1, i + 1))}
              className="chorcha-btn flex-1 py-2.5 px-3 rounded-xl bg-[#0B7A4B] text-white font-bold text-sm flex items-center justify-center gap-1 min-h-[46px]"
            >
              পরের
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="chorcha-btn flex-1 py-2.5 px-3 rounded-xl bg-[#0B7A4B] text-white font-bold text-sm flex items-center justify-center gap-1.5 min-h-[46px]"
            >
              <Send className="w-4 h-4" />
              জমা দাও
            </button>
          )}

          {currentIndex < totalQs - 1 && (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="chorcha-btn px-3.5 py-2.5 rounded-xl bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300 font-bold text-sm min-h-[46px] whitespace-nowrap"
            >
              জমা দাও
            </button>
          )}
        </div>
      </footer>

      {/* Question Navigator Sheet */}
      {showNavigator && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowNavigator(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="sheet-enter w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-t-[28px] p-5 max-h-[75vh] flex flex-col"
          >
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">প্রশ্ন নেভিগেটর</h3>
              <button
                onClick={() => setShowNavigator(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0B7A4B]" /> উত্তর দেওয়া ({toBn(answeredCount)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" /> দাগানো
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" /> বাকি ({toBn(totalQs - answeredCount)})
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 overflow-y-auto pb-4">
              {session.questions.map((q, idx) => {
                const isAns = Boolean(answers[q.id]?.isAttempted);
                const isBm = bookmarks.includes(q.id);
                const isCur = idx === currentIndex;

                let cls = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                if (isBm) cls = 'bg-amber-400 text-slate-900 font-bold';
                else if (isAns) cls = 'bg-[#0B7A4B] text-white font-bold';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowNavigator(false);
                    }}
                    className={`h-11 rounded-xl text-sm tabular-nums transition-transform active:scale-95 ${cls} ${
                      isCur ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900' : ''
                    }`}
                  >
                    {toBn(idx + 1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowSubmitConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] bg-white dark:bg-slate-900 rounded-[24px] p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">পরীক্ষা জমা দেবেন?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">জমা দেওয়ার সাথে সাথেই ফলাফল দেখতে পারবেন</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-center bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-3 tabular-nums">
              <div>
                <p className="text-lg font-bold text-[#0B7A4B] dark:text-emerald-400">{toBn(answeredCount)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">উত্তর দিয়েছেন</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{toBn(totalQs - answeredCount)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">উত্তর বাকি</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="chorcha-btn flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm min-h-[46px]"
              >
                ফিরে যাও
              </button>
              <button
                onClick={submitExam}
                className="chorcha-btn flex-1 py-3 rounded-xl bg-[#0B7A4B] text-white font-bold text-sm min-h-[46px]"
              >
                হ্যাঁ, জমা দাও
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] bg-white dark:bg-slate-900 rounded-[24px] p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">পরীক্ষা বাতিল করবেন?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">এখন বের হলে এই পরীক্ষার উত্তর সেভ হবে না।</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="chorcha-btn flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm min-h-[46px]"
              >
                চালিয়ে যাও
              </button>
              <button
                onClick={onCancel}
                className="chorcha-btn flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm min-h-[46px]"
              >
                বের হও
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
