import React, { useEffect, useMemo, useState } from 'react';
import { Archive, Bookmark, Gauge, Home, SquarePen } from 'lucide-react';
import { AIHelperModal } from './components/AIHelperModal';
import { ExamRunner } from './components/ExamRunner';
import { ExamTab } from './components/ExamTab';
import { HistoryTab } from './components/HistoryTab';
import { HomeTab } from './components/HomeTab';
import { PracticalChecklistModal } from './components/PracticalChecklistModal';
import { OfflineIndicator } from './components/PWAInstallBanner';
import { ProgressTab } from './components/ProgressTab';
import { QuestionBankTab } from './components/QuestionBankTab';
import { ResultView } from './components/ResultView';
import { SettingsModal } from './components/SettingsModal';
import { PRACTICAL_SECTIONS } from './data/practical';
import { QUESTIONS_BANK } from './data/questions';
import { SUBJECTS } from './data/subjects';
import {
  AppStorageData,
  ExamHistoryItem,
  ExamMode,
  ExamSession,
  Question,
  SubjectId,
  UserProfile,
  UserSettings,
} from './types';
import {
  DEFAULT_STORAGE,
  loadAppStorage,
  mergeAllQuestions,
  saveAppStorage,
  updateStreakAndPoints,
} from './utils/storage';

type TabId = 'home' | 'bank' | 'exam' | 'history' | 'progress';

export default function App() {
  const [data, setData] = useState<AppStorageData>(() => loadAppStorage());
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [bankFilter, setBankFilter] = useState<'model' | 'subject' | 'institution'>('subject');

  // Fullscreen / overlay views
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [activeResult, setActiveResult] = useState<ExamHistoryItem | null>(null);
  const [showPractical, setShowPractical] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const allQuestions = useMemo(
    () => mergeAllQuestions(QUESTIONS_BANK, data.customQuestions),
    [data.customQuestions]
  );

  // Sync localStorage
  useEffect(() => {
    saveAppStorage(data);
  }, [data]);

  // Sync Dark Mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (data.settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [data.settings.darkMode]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  useEffect(() => {
    const onOfflineReady = () => {
      showToast('অফলাইন মোড প্রস্তুত! এখন ইন্টারনেট ছাড়াই পড়া যাবে।');
    };
    window.addEventListener('nur-offline-ready', onOfflineReady);
    return () => window.removeEventListener('nur-offline-ready', onOfflineReady);
  }, []);

  const handleNavigateTab = (tab: TabId, filter?: 'model' | 'subject' | 'institution') => {
    if (filter) setBankFilter(filter);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBookmark = (questionId: string) => {
    setData((prev) => {
      const exists = prev.bookmarks.includes(questionId);
      const nextBookmarks = exists
        ? prev.bookmarks.filter((id) => id !== questionId)
        : [questionId, ...prev.bookmarks];
      return { ...prev, bookmarks: nextBookmarks };
    });
  };

  const handleRemoveMistake = (questionId: string) => {
    setData((prev) => ({
      ...prev,
      mistakes: prev.mistakes.filter((id) => id !== questionId),
    }));
    showToast('ভুলের তালিকা থেকে সরানো হয়েছে।');
  };

  const handleStartExam = (
    title: string,
    subtitle: string,
    questions: Question[],
    mode: ExamMode,
    durationMinutes: number,
    negativeOverride?: boolean
  ) => {
    if (questions.length === 0) {
      showToast('এই সেটে কোনো প্রশ্ন পাওয়া যায়নি।');
      return;
    }
    setActiveResult(null);
    setShowPractical(false);
    setShowAiHelper(false);
    setActiveSession({
      id: `sess_${Date.now()}`,
      title,
      subtitle,
      mode,
      questions,
      durationMinutes,
      negativeMarking: negativeOverride ?? data.settings.negativeMarking,
      startedAt: Date.now(),
    });
    window.scrollTo({ top: 0 });
  };

  const handleFinishExam = (result: ExamHistoryItem, wrongIds: string[], correctedIds: string[]) => {
    setData((prev) => updateStreakAndPoints(prev, result.pointsEarned, result, wrongIds, correctedIds));
    setActiveSession(null);
    setActiveResult(result);
    window.scrollTo({ top: 0 });
  };

  const handlePracticeSubject = (subjectId: SubjectId) => {
    const subj = SUBJECTS.find((s) => s.id === subjectId);
    const qs = allQuestions.filter((q) => q.subject === subjectId);
    if (!subj || qs.length === 0) return;
    handleStartExam(subj.shortName, subj.name, qs, 'practice', Math.max(15, qs.length));
  };

  const handleTogglePracticalCheck = (stepId: string) => {
    setData((prev) => ({
      ...prev,
      practicalChecks: {
        ...prev.practicalChecks,
        [stepId]: !prev.practicalChecks[stepId],
      },
    }));
  };

  const handleResetPracticalChecks = () => {
    setData((prev) => ({ ...prev, practicalChecks: {} }));
    showToast('ব্যবহারিক চেকলিস্ট রিসেট করা হয়েছে।');
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setData((prev) => ({ ...prev, profile }));
  };

  const handleUpdateSettings = (settings: UserSettings) => {
    setData((prev) => ({ ...prev, settings }));
  };

  const handleAddCustomQuestion = (q: Question) => {
    setData((prev) => ({
      ...prev,
      customQuestions: [q, ...prev.customQuestions],
    }));
  };

  const handleAddFriend = (name: string, batch: string) => {
    setData((prev) => ({
      ...prev,
      friends: [
        ...prev.friends,
        {
          id: `fr_${Date.now()}`,
          name,
          batch,
          points: Number((Math.random() * 40 + 15).toFixed(1)),
        },
      ],
    }));
  };

  const handleResetAllData = () => {
    setData({ ...DEFAULT_STORAGE });
  };

  const practicalTotalCount = PRACTICAL_SECTIONS.reduce((acc, s) => acc + s.steps.length, 0);
  const practicalDoneCount = PRACTICAL_SECTIONS.flatMap((s) => s.steps).filter(
    (st) => data.practicalChecks[st.id]
  ).length;

  const isOverlayOpen = Boolean(activeSession || activeResult || showPractical || showAiHelper);

  return (
    <div className="min-h-[100dvh] w-full bg-[#EEF2F0] dark:bg-slate-950 flex justify-center">
      {/* Centered Phone-Size Container on Desktop, Full Width on Mobile */}
      <div className="w-full max-w-[430px] min-h-[100dvh] bg-white dark:bg-slate-950 shadow-[0_0_45px_rgba(15,23,42,0.08)] dark:shadow-none relative overflow-x-clip">
        {/* Offline Mode Status Banner */}
        <OfflineIndicator />

        {/* Global Toast */}
        {toastMsg && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-32px)] max-w-[390px] pointer-events-none flex justify-center">
            <div className="bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg text-center">
              {toastMsg}
            </div>
          </div>
        )}

        {/* Active Fullscreen Exam Runner */}
        {activeSession && (
          <ExamRunner
            session={activeSession}
            bookmarks={data.bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onFinish={handleFinishExam}
            onCancel={() => setActiveSession(null)}
          />
        )}

        {/* Result & Review Screen */}
        {!activeSession && activeResult && (
          <ResultView
            result={activeResult}
            allQuestions={allQuestions}
            bookmarks={data.bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onPracticeMistakes={(wrongQs) =>
              handleStartExam('ভুল প্রশ্ন অনুশীলন', activeResult.title, wrongQs, 'practice', 20)
            }
            onClose={() => setActiveResult(null)}
          />
        )}

        {/* Practical Exam Checklist Screen */}
        {!activeSession && !activeResult && showPractical && (
          <PracticalChecklistModal
            checks={data.practicalChecks}
            onToggleCheck={handleTogglePracticalCheck}
            onResetChecks={handleResetPracticalChecks}
            onClose={() => setShowPractical(false)}
          />
        )}

        {/* Offline AI Study Assistant Screen */}
        {!activeSession && !activeResult && !showPractical && showAiHelper && (
          <AIHelperModal allQuestions={allQuestions} onClose={() => setShowAiHelper(false)} />
        )}

        {/* Main 5 Tabs */}
        {!isOverlayOpen && (
          <>
            {activeTab === 'home' && (
              <HomeTab
                profile={data.profile}
                streak={data.streak}
                allQuestions={allQuestions}
                practicalDoneCount={practicalDoneCount}
                practicalTotalCount={practicalTotalCount}
                onNavigateTab={handleNavigateTab}
                onStartExam={handleStartExam}
                onOpenPractical={() => setShowPractical(true)}
                onOpenAiHelper={() => setShowAiHelper(true)}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'bank' && (
              <QuestionBankTab
                allQuestions={allQuestions}
                bookmarks={data.bookmarks}
                initialFilter={bankFilter}
                onToggleBookmark={handleToggleBookmark}
                onStartExam={handleStartExam}
                onOpenPractical={() => setShowPractical(true)}
              />
            )}

            {activeTab === 'exam' && (
              <ExamTab
                allQuestions={allQuestions}
                settings={data.settings}
                onStartExam={handleStartExam}
                onOpenPractical={() => setShowPractical(true)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                allQuestions={allQuestions}
                bookmarks={data.bookmarks}
                mistakes={data.mistakes}
                history={data.history}
                onToggleBookmark={handleToggleBookmark}
                onRemoveMistake={handleRemoveMistake}
                onStartPracticeList={(title, qs) => handleStartExam(title, 'হিস্ট্রি প্র্যাকটিস', qs, 'practice', 20)}
                onOpenExamResult={(item) => setActiveResult(item)}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressTab
                profile={data.profile}
                streak={data.streak}
                dailyPoints={data.dailyPoints}
                history={data.history}
                allQuestions={allQuestions}
                friends={data.friends}
                onAddFriend={handleAddFriend}
                onOpenSettings={() => setShowSettings(true)}
                onPracticeSubject={handlePracticeSubject}
                onShowToast={showToast}
              />
            )}

            {/* Chorcha-Style 5-Tab Fixed Bottom Navigation */}
            <nav
              aria-label="প্রধান নেভিগেশন"
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 z-30 px-1.5 pt-1.5 pb-2"
            >
              <div className="grid grid-cols-5 items-center">
                {(
                  [
                    { id: 'home', label: 'হোম', icon: Home },
                    { id: 'bank', label: 'প্রশ্নব্যাংক', icon: Archive },
                    { id: 'exam', label: 'পরীক্ষা', icon: SquarePen },
                    { id: 'history', label: 'হিস্ট্রি', icon: Bookmark },
                    { id: 'progress', label: 'প্রোগ্রেস', icon: Gauge },
                  ] as const
                ).map((item) => {
                  const active = activeTab === item.id;
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigateTab(item.id)}
                      className="chorcha-btn flex flex-col items-center justify-center gap-0.5 py-1 min-h-[54px] relative"
                    >
                      <span
                        className={`w-14 h-9 rounded-full flex items-center justify-center transition-colors ${
                          active ? 'bg-[#E4F2EC] dark:bg-emerald-950/70' : 'bg-transparent'
                        }`}
                      >
                        <IconComp
                          className={`w-[22px] h-[22px] transition-colors ${
                            active
                              ? 'text-[#0B7A4B] dark:text-emerald-400 stroke-[2.3]'
                              : 'text-slate-400 dark:text-slate-500 stroke-[1.9]'
                          }`}
                        />
                      </span>
                      <span
                        className={`text-[11px] leading-tight whitespace-nowrap ${
                          active
                            ? 'font-bold text-[#0B7A4B] dark:text-emerald-400'
                            : 'font-medium text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </>
        )}

        {/* Settings Sheet */}
        {showSettings && (
          <SettingsModal
            profile={data.profile}
            settings={data.settings}
            allQuestions={allQuestions}
            onUpdateProfile={handleUpdateProfile}
            onUpdateSettings={handleUpdateSettings}
            onAddCustomQuestion={handleAddCustomQuestion}
            onResetAllData={handleResetAllData}
            onClose={() => setShowSettings(false)}
            onShowToast={showToast}
          />
        )}
      </div>
    </div>
  );
}
