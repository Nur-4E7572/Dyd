import React, { useState } from 'react';
import {
  Check,
  Download,
  Moon,
  PlusCircle,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { Question, QuestionType, SubjectId, UserProfile, UserSettings } from '../types';
import { downloadStandaloneHtml, toBn } from '../utils/bengali';
import { StudentAvatar } from './Icons';
import { PWAInstallButton } from './PWAInstallBanner';

interface SettingsModalProps {
  profile: UserProfile;
  settings: UserSettings;
  allQuestions: Question[];
  onUpdateProfile: (p: UserProfile) => void;
  onUpdateSettings: (s: UserSettings) => void;
  onAddCustomQuestion: (q: Question) => void;
  onResetAllData: () => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  settings,
  allQuestions,
  onUpdateProfile,
  onUpdateSettings,
  onAddCustomQuestion,
  onResetAllData,
  onClose,
  onShowToast,
}) => {
  const [name, setName] = useState(profile.name);
  const [subtitle, setSubtitle] = useState(profile.subtitle);
  const [avatarVariant, setAvatarVariant] = useState(profile.avatarVariant);

  // Add Custom Question form state
  const [showAddQ, setShowAddQ] = useState(false);
  const [qSubject, setQSubject] = useState<SubjectId>('ai_ml');
  const [qType, setQType] = useState<QuestionType>('mcq');
  const [qText, setQText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);
  const [qAnswerText, setQAnswerText] = useState('');
  const [qExp, setQExp] = useState('');

  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: name.trim() || 'শিক্ষার্থী',
      subtitle: subtitle.trim() || 'যুব উন্নয়ন AI বেসিক কোর্স — ২০২৬',
      avatarVariant,
    });
    onShowToast('প্রোফাইল সেভ হয়েছে!');
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;

    if (qType === 'mcq') {
      const opts = [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()];
      if (opts.some((o) => !o)) {
        onShowToast('MCQ-এর ৪টি অপশনই পূরণ করুন।');
        return;
      }
      const newQ: Question = {
        id: `custom_${Date.now()}`,
        subject: qSubject,
        set: 'batch2_setA',
        institution: 'dyd',
        type: 'mcq',
        question: qText.trim(),
        options: opts,
        correctIndex: correctIdx,
        answer: opts[correctIdx],
        explanation: qExp.trim() || 'কাস্টম যুক্ত প্রশ্ন।',
        marks: 1,
      };
      onAddCustomQuestion(newQ);
    } else {
      if (!qAnswerText.trim()) {
        onShowToast('মডেল উত্তরটি লিখুন।');
        return;
      }
      const newQ: Question = {
        id: `custom_${Date.now()}`,
        subject: qSubject,
        set: 'written_30',
        institution: 'dyd',
        type: qType,
        question: qText.trim(),
        answer: qAnswerText.trim(),
        explanation: qExp.trim() || 'কাস্টম যুক্ত প্রশ্ন।',
        marks: qType === 'written' ? 4 : 1,
      };
      onAddCustomQuestion(newQ);
    }

    setQText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setQAnswerText('');
    setQExp('');
    setShowAddQ(false);
    onShowToast('নতুন প্রশ্ন প্রশ্নব্যাংকে যুক্ত হয়েছে!');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-enter w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-t-[28px] p-5 pb-8 max-h-[88vh] overflow-y-auto space-y-5"
      >
        <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1" />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">সেটিংস ও প্রশ্ন ব্যবস্থাপনা</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Edit */}
        <section className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">প্রোফাইল তথ্য</h3>
          <div className="flex items-center gap-3 justify-center py-1">
            {[0, 1, 2, 3].map((v) => (
              <button
                key={v}
                onClick={() => setAvatarVariant(v)}
                className={`rounded-full p-0.5 transition-all ${
                  avatarVariant === v ? 'ring-3 ring-[#0B7A4B] scale-105' : 'opacity-65'
                }`}
              >
                <StudentAvatar variant={v} size={46} />
              </button>
            ))}
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="আপনার নাম"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B7A4B]"
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="ব্যাচ বা প্রতিষ্ঠানের নাম"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B7A4B]"
          />
          <button
            onClick={handleSaveProfile}
            className="chorcha-btn w-full bg-[#0B7A4B] text-white font-bold text-sm py-2.5 rounded-xl min-h-[44px]"
          >
            প্রোফাইল সেভ করুন
          </button>
        </section>

        {/* Exam & Theme Settings */}
        <section className="space-y-2.5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">পরীক্ষা ও ডিসপ্লে সেটিংস</h3>

          {/* Dark Mode */}
          <button
            onClick={() => onUpdateSettings({ ...settings, darkMode: !settings.darkMode })}
            className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 min-h-[52px]"
          >
            <div className="flex items-center gap-2.5">
              {settings.darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">ডার্ক মোড</span>
            </div>
            <span
              className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                settings.darkMode ? 'bg-[#0B7A4B] justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </span>
          </button>

          {/* Negative Marking */}
          <button
            onClick={() => onUpdateSettings({ ...settings, negativeMarking: !settings.negativeMarking })}
            className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 min-h-[52px]"
          >
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">নেগেটিভ মার্কিং (-০.২৫)</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">ডিফল্ট অফ • ভুল MCQ-তে ০.২৫ কাটা যাবে</p>
            </div>
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                settings.negativeMarking
                  ? 'bg-[#0B7A4B] border-[#0B7A4B] text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
              }`}
            >
              {settings.negativeMarking && <Check className="w-4 h-4" />}
            </span>
          </button>
        </section>

        {/* Add New Custom Question */}
        <section className="space-y-2.5">
          <button
            onClick={() => setShowAddQ((p) => !p)}
            className="chorcha-btn w-full bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300 font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 min-h-[48px]"
          >
            <PlusCircle className="w-4 h-4" />
            {showAddQ ? 'ফর্ম বন্ধ করুন' : 'নতুন প্রশ্ন যোগ করুন'}
          </button>

          {showAddQ && (
            <form onSubmit={handleCreateQuestion} className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={qSubject}
                  onChange={(e) => setQSubject(e.target.value as SubjectId)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs font-semibold"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shortName}
                    </option>
                  ))}
                </select>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as QuestionType)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs font-semibold"
                >
                  <option value="mcq">MCQ</option>
                  <option value="short">সংক্ষিপ্ত</option>
                  <option value="translate">অনুবাদ</option>
                  <option value="written">লিখিত</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="প্রশ্নটি লিখুন..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />

              {qType === 'mcq' ? (
                <div className="space-y-2">
                  {[
                    { val: opt0, set: setOpt0, lbl: 'অপশন ক' },
                    { val: opt1, set: setOpt1, lbl: 'অপশন খ' },
                    { val: opt2, set: setOpt2, lbl: 'অপশন গ' },
                    { val: opt3, set: setOpt3, lbl: 'অপশন ঘ' },
                  ].map((o, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={correctIdx === idx}
                        onChange={() => setCorrectIdx(idx)}
                        className="accent-[#0B7A4B] w-4 h-4"
                      />
                      <input
                        type="text"
                        value={o.val}
                        onChange={(e) => o.set(e.target.value)}
                        placeholder={o.lbl}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  rows={2}
                  value={qAnswerText}
                  onChange={(e) => setQAnswerText(e.target.value)}
                  placeholder="মডেল উত্তর লিখুন..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                />
              )}

              <input
                type="text"
                value={qExp}
                onChange={(e) => setQExp(e.target.value)}
                placeholder="ব্যাখ্যা (ঐচ্ছিক)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
              />

              <button
                type="submit"
                className="chorcha-btn w-full bg-[#0B7A4B] text-white font-bold text-sm py-2.5 rounded-xl min-h-[44px]"
              >
                প্রশ্নব্যাংকে সেভ করুন
              </button>
            </form>
          )}
        </section>

        {/* Install PWA App, Export Standalone Single HTML & Reset */}
        <section className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <PWAInstallButton
            variant="settings"
            allQuestions={allQuestions}
            userName={profile.name}
            onShowToast={onShowToast}
          />

          <button
            onClick={() => {
              downloadStandaloneHtml(allQuestions, profile.name);
              onShowToast(`একক HTML ফাইল ডাউনলোড শুরু হয়েছে (${toBn(allQuestions.length)} টি প্রশ্নসহ)`);
            }}
            className="chorcha-btn w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Download className="w-4 h-4 text-[#0B7A4B]" />
            অফলাইন একক HTML ফাইল ডাউনলোড
          </button>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="chorcha-btn w-full text-rose-600 dark:text-rose-400 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 min-h-[40px]"
            >
              <Trash2 className="w-4 h-4" />
              সব প্রোগ্রেস ও হিস্ট্রি রিসেট করুন
            </button>
          ) : (
            <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">নিশ্চিতভাবে মুছে ফেলবেন?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  না
                </button>
                <button
                  onClick={() => {
                    onResetAllData();
                    setConfirmReset(false);
                    onShowToast('সব ডেটা রিসেট করা হয়েছে।');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
                >
                  হ্যাঁ, মুছুন
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
