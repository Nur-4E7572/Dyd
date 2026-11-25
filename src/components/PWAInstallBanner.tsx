import React, { useState } from 'react';
import { CheckCircle2, Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { Question } from '../types';
import { downloadStandaloneHtml, toBn } from '../utils/bengali';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'compact' | 'settings';
  allQuestions: Question[];
  userName: string;
  onShowToast?: (msg: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'banner',
  allQuestions,
  userName,
  onShowToast,
}) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // When running as an installed standalone PWA, hide Home banner/compact button
  if (isInstalled && variant !== 'settings') {
    return null;
  }

  const handlePrimaryClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        onShowToast?.('Nur অ্যাপ সফলভাবে ইনস্টল হয়েছে!');
      }
      return;
    }
    setShowGuide(true);
  };

  const handleDownloadOfflineHtml = () => {
    downloadStandaloneHtml(allQuestions, userName);
    onShowToast?.(`অফলাইন একক HTML ফাইল ডাউনলোড হচ্ছে (${toBn(allQuestions.length)} টি প্রশ্ন)`);
    setShowGuide(false);
  };

  // Installed state inside Settings
  if (isInstalled && variant === 'settings') {
    return (
      <div className="w-full bg-[#F2FBF7] dark:bg-emerald-950/40 border border-[#CBEAD9] dark:border-emerald-800/60 rounded-2xl px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-[#0B7A4B] dark:text-emerald-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#065F46] dark:text-emerald-300">Nur অ্যাপ ইনস্টল করা আছে</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            ইন্টারনেট ছাড়াই সম্পূর্ণ {toBn(allQuestions.length)}টি প্রশ্ন অফলাইনে পড়া যাবে।
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0B7A4B] text-white rounded-[20px] p-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[15px] leading-snug">Nur অ্যাপ ইনস্টল করো</h3>
              <p className="text-[12px] text-white/80 leading-snug mt-0.5">
                ফোনের হোম স্ক্রিনে রাখো ও ইন্টারনেট ছাড়াই অফলাইনে পড়ো
              </p>
            </div>
          </div>
          <button
            onClick={handlePrimaryClick}
            className="chorcha-btn shrink-0 bg-white text-[#0B7A4B] font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs min-h-[40px] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {isInstallable ? 'ইনস্টল' : 'অ্যাপ নাও'}
          </button>
        </div>
      )}

      {variant === 'compact' && (
        <button
          onClick={handlePrimaryClick}
          className="chorcha-btn inline-flex items-center gap-1.5 bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold min-h-[38px]"
        >
          <Download className="w-3.5 h-3.5" />
          অ্যাপ ইনস্টল
        </button>
      )}

      {variant === 'settings' && (
        <button
          onClick={handlePrimaryClick}
          className="chorcha-btn w-full bg-[#0B7A4B] hover:bg-[#08613B] text-white font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 min-h-[48px] shadow-xs"
        >
          <Smartphone className="w-4 h-4" />
          {isInstallable ? 'ফোনে Nur অ্যাপ ইনস্টল করুন (অফলাইন)' : 'ফোনে অ্যাপ হিসেবে ইনস্টল করার নিয়ম'}
        </button>
      )}

      {/* Guided Install Modal (iOS Safari / Manual Browser / Offline HTML fallback) */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="sheet-enter w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-[28px] p-5 pb-7 shadow-2xl space-y-4"
          >
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1 sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0B7A4B] text-white flex items-center justify-center shrink-0 font-bold text-base">
                  Nur
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    অফলাইন অ্যাপ ইনস্টল গাইড
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ১,১০১টি প্রশ্ন ইন্টারনেট ছাড়াই চলবে
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-[#0B7A4B]" />
                  iPhone / iPad (Safari)-এ ইনস্টল:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[13px] leading-relaxed">
                  <li>
                    Safari ব্রাউজারের নিচে থাকা <strong>Share (↑)</strong> বাটনে ট্যাপ করুন।
                  </li>
                  <li>
                    নিচে স্ক্রল করে <strong>Add to Home Screen</strong> নির্বাচন করুন।
                  </li>
                  <li>
                    উপরে ডানে <strong>Add</strong> চাপলেই <strong>Nur</strong> অ্যাপ ফোনের হোম স্ক্রিনে চলে আসবে।
                  </li>
                </ol>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                <p className="font-bold text-slate-900 dark:text-white">Android / Chrome-এ অ্যাপ ইনস্টল:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-[13px] leading-relaxed">
                  {isInIframe && (
                    <li>
                      প্রথমে অ্যাপটির সরাসরি লিংক ফোনের <strong>Chrome ব্রাউজারে</strong> খুলুন।
                    </li>
                  )}
                  <li>
                    ব্রাউজারের উপরে ডানে <strong>⋮ (থ্রি-ডট মেনু)</strong> ট্যাপ করুন।
                  </li>
                  <li>
                    <strong>Install app</strong> বা <strong>Add to Home screen</strong> চাপুন।
                  </li>
                  <li>
                    ইনস্টল হয়ে গেলে ইন্টারনেট বন্ধ থাকলেও সম্পূর্ণ <strong>Nur</strong> অ্যাপ ও সব পরীক্ষা অফলাইনে চলবে!
                  </li>
                </ol>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                onClick={handleDownloadOfflineHtml}
                className="chorcha-btn w-full bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300 font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Download className="w-4 h-4" />
                অথবা অফলাইন HTML ফাইল সেভ করুন
              </button>

              <button
                onClick={() => setShowGuide(false)}
                className="chorcha-btn w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm py-3 rounded-2xl min-h-[44px]"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[65] w-[calc(100%-32px)] max-w-[398px] pointer-events-none flex justify-center"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-amber-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-lg">
        <WifiOff className="w-3.5 h-3.5 shrink-0" />
        <span>অফলাইন মোড — সব প্রশ্ন অফলাইনে চলছে</span>
      </div>
    </div>
  );
};
