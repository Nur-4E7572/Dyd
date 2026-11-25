import React from 'react';
import { ArrowLeft, Check, FileCode2, Lightbulb, RotateCcw } from 'lucide-react';
import { PRACTICAL_EXAM_META, PRACTICAL_SECTIONS } from '../data/practical';
import { toBn } from '../utils/bengali';

interface PracticalChecklistModalProps {
  checks: Record<string, boolean>;
  onToggleCheck: (stepId: string) => void;
  onResetChecks: () => void;
  onClose: () => void;
}

export const PracticalChecklistModal: React.FC<PracticalChecklistModalProps> = ({
  checks,
  onToggleCheck,
  onResetChecks,
  onClose,
}) => {
  const allSteps = PRACTICAL_SECTIONS.flatMap((s) => s.steps);
  const doneCount = allSteps.filter((s) => checks[s.id]).length;
  const totalCount = allSteps.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Estimate practical score out of 10 based on section completion
  const estimatedMarks = Number(
    PRACTICAL_SECTIONS.reduce((acc, sec) => {
      const secDone = sec.steps.filter((st) => checks[st.id]).length;
      return acc + (secDone / sec.steps.length) * sec.marks;
    }, 0).toFixed(1)
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 pb-10 page-enter">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onClose}
            className="chorcha-btn w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shrink-0"
            aria-label="বন্ধ করুন"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">ব্যবহারিক পরীক্ষা চেকলিস্ট</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{PRACTICAL_EXAM_META.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onResetChecks}
          className="chorcha-btn p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          title="সব রিসেট করুন"
          aria-label="চেকলিস্ট রিসেট করুন"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Progress Summary Banner */}
        <section className="bg-gradient-to-br from-[#065F46] via-[#0B7A4B] to-[#13945D] text-white rounded-[22px] p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between tabular-nums">
            <div>
              <p className="text-xs text-emerald-100">মোট নম্বর: {toBn(PRACTICAL_EXAM_META.fullMarks)} • সময়: {toBn(PRACTICAL_EXAM_META.durationMinutes)} মিনিট</p>
              <h2 className="text-xl font-bold mt-0.5">
                সম্পন্ন: {toBn(doneCount)}/{toBn(totalCount)} ধাপ ({toBn(pct)}%)
              </h2>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded-2xl text-center">
              <p className="text-lg font-bold leading-none">{toBn(estimatedMarks)}</p>
              <p className="text-[10px] text-emerald-100">সম্ভাব্য নম্বর</p>
            </div>
          </div>

          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </section>

        {/* General Instructions */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">পরীক্ষার সাধারণ নির্দেশনা</h3>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
            {PRACTICAL_EXAM_META.instructions.map((ins, i) => (
              <li key={i}>{ins}</li>
            ))}
          </ul>
        </section>

        {/* 4 Practical Sections */}
        {PRACTICAL_SECTIONS.map((sec) => {
          const secDone = sec.steps.filter((s) => checks[s.id]).length;
          return (
            <section
              key={sec.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[22px] p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#0B7A4B] dark:text-emerald-400">
                    {sec.numberBn} · {toBn(sec.marks)} নম্বর
                  </span>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{sec.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  {toBn(secDone)}/{toBn(sec.steps.length)}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{sec.description}</p>

              {sec.fileNameRule && (
                <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 font-mono">
                  <FileCode2 className="w-4 h-4 text-[#0B7A4B] shrink-0" />
                  <span className="truncate">ফাইলের নাম: {sec.fileNameRule}</span>
                </div>
              )}

              {/* Excel Data Table & Formula Helper */}
              {sec.excelPreview && (
                <div className="space-y-2.5">
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs text-left tabular-nums">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <tr>
                          {sec.excelPreview.headers.map((h) => (
                            <th key={h} className="px-2.5 py-2 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sec.excelPreview.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-2.5 py-2 text-slate-700 dark:text-slate-300">
                                {typeof cell === 'number' ? toBn(cell) : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-[#F2FBF7] dark:bg-emerald-950/30 border border-[#CBEAD9] dark:border-emerald-800/50 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-bold text-[#065F46] dark:text-emerald-300 mb-1">প্রয়োজনীয় Excel ফর্মুলা:</p>
                    {sec.excelPreview.formulas.map((f) => (
                      <div key={f.label} className="flex items-center justify-between text-xs gap-2">
                        <span className="text-slate-600 dark:text-slate-400">{f.label}:</span>
                        <code className="font-mono font-bold text-[#0B7A4B] dark:text-emerald-300">{f.formula}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Checklist Steps */}
              <div className="space-y-2 pt-1">
                {sec.steps.map((step) => {
                  const isDone = Boolean(checks[step.id]);
                  return (
                    <button
                      key={step.id}
                      onClick={() => onToggleCheck(step.id)}
                      className={`chorcha-btn w-full text-left p-3 rounded-2xl border flex items-start gap-3 transition-colors min-h-[50px] ${
                        isDone
                          ? 'bg-[#E4F2EC]/80 dark:bg-emerald-950/50 border-[#0B7A4B]/50'
                          : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                          isDone
                            ? 'bg-[#0B7A4B] border-[#0B7A4B] text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold leading-snug ${
                            isDone
                              ? 'line-through text-slate-500 dark:text-slate-400'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {step.text}
                        </p>
                        {step.hint && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{step.hint}</span>
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
