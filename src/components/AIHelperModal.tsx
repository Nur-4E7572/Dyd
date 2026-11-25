import React, { useRef, useState } from 'react';
import { ArrowLeft, Bot, Send, Sparkles } from 'lucide-react';
import { QUICK_REVISION_GLOSSARY } from '../data/subjects';
import { Question } from '../types';
import { toBn } from '../utils/bengali';

interface AIHelperModalProps {
  allQuestions: Question[];
  onClose: () => void;
}

interface ChatMsg {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

const SUGGESTIONS = [
  'AI Hallucination কী?',
  'Prompt লেখার নিয়ম কী?',
  'Excel ফর্মুলা বলো',
  'RGB ও CMYK পার্থক্য',
  'Phishing ও 2FA কী?',
  'Overfitting কী?',
];

export const AIHelperModal: React.FC<AIHelperModalProps> = ({ allQuestions, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `আসসালামু আলাইকুম! আমি Nur AI সহায়ক।\n\nযুব উন্নয়ন AI বেসিক কোর্সের ${toBn(allQuestions.length)}টি প্রশ্ন, সংজ্ঞা, অনুবাদ ও ব্যবহারিক পরীক্ষার ফর্মুলা থেকে যেকোনো কিছু জিজ্ঞেস করতে পারো।`,
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const generateAnswer = (query: string): string => {
    const qLower = query.toLowerCase().trim();
    const tokens = qLower.split(/\s+/).filter((w) => w.length > 1);

    // 1. Check quick revision glossary first
    const glossaryMatch = QUICK_REVISION_GLOSSARY.find((item) =>
      item.keywords.some((kw) => qLower.includes(kw))
    );

    // 2. Score matching questions in the bank
    const scored = allQuestions
      .map((q) => {
        const hay = `${q.question} ${q.answer} ${q.explanation}`.toLowerCase();
        let score = 0;
        if (hay.includes(qLower)) score += 6;
        tokens.forEach((t) => {
          if (hay.includes(t)) score += 2;
        });
        return { q, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (glossaryMatch && scored.length > 0) {
      const related = scored
        .map((s, i) => `${toBn(i + 1)}. ${s.q.question}\nউত্তর: ${s.q.answer}`)
        .join('\n\n');
      return `${glossaryMatch.term}:\n${glossaryMatch.definition}\n\nপ্রশ্নব্যাংক থেকে প্রাসঙ্গিক প্রশ্ন:\n${related}`;
    }

    if (glossaryMatch) {
      return `${glossaryMatch.term}:\n${glossaryMatch.definition}`;
    }

    if (scored.length > 0) {
      return scored
        .map(
          (s, i) =>
            `${toBn(i + 1)}. প্রশ্ন: ${s.q.question}\nসঠিক উত্তর: ${s.q.answer}${
              s.q.explanation ? `\nব্যাখ্যা: ${s.q.explanation}` : ''
            }`
        )
        .join('\n\n');
    }

    return 'এই বিষয়ে সরাসরি প্রশ্নব্যাংকে কিছু পাওয়া যায়নি। নিচের যেকোনো শব্দ লিখে চেষ্টা করো: AI, Prompt, Hallucination, Excel, Phishing, RGB, CMYK, Voice Change, SEO বা Freelancing।';
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text) return;

    const userMsg: ChatMsg = { id: `u_${Date.now()}`, sender: 'user', text };
    const botReply: ChatMsg = { id: `b_${Date.now() + 1}`, sender: 'bot', text: generateAnswer(text) };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput('');
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 page-enter">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="chorcha-btn w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
          aria-label="ফিরে যাও"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Nur AI সহায়ক</h1>
          <p className="text-xs text-[#0B7A4B] dark:text-emerald-400 font-semibold">অফলাইন স্টাডি অ্যাসিস্ট্যান্ট</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-36">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-[20px] px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                m.sender === 'user'
                  ? 'bg-[#0B7A4B] text-white rounded-br-md font-medium'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md shadow-2xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick Chips + Input Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pt-2 pb-3 px-3 space-y-2 z-30">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="chorcha-btn shrink-0 inline-flex items-center gap-1 bg-[#E4F2EC] dark:bg-emerald-950/60 text-[#0B7A4B] dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full min-h-[34px]"
            >
              <Sparkles className="w-3 h-3" />
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="যেকোনো টপিক বা প্রশ্ন লিখো..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B7A4B]"
          />
          <button
            type="submit"
            className="chorcha-btn w-11 h-11 rounded-full bg-[#0B7A4B] text-white flex items-center justify-center shrink-0"
            aria-label="পাঠান"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
