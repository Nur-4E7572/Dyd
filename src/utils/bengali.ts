import { Question } from '../types';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BN_MONTHS = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
const BN_DAYS_SHORT = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const EN_DAYS_SINGLE = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MCQ_LETTERS = ['ক', 'খ', 'গ', 'ঘ'];

/** ইংরেজি সংখ্যাকে বাংলা অঙ্কে রূপান্তর করে (0-9 -> ০-৯) */
export function toBn(input: number | string): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/** সেকেন্ডকে বাংলা MM:SS অথবা HH : MM : SS ফরম্যাটে দেখায় */
export function formatTimerBn(totalSeconds: number, showHours = false): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => toBn(String(n).padStart(2, '0'));
  if (showHours || hrs > 0) {
    return `${pad(hrs)} : ${pad(mins)} : ${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/** YYYY-MM-DD লোকাল ডেট কী রিটার্ন করে */
export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** বাংলা সংক্ষিপ্ত তারিখ (যেমন: ২৪ নভে, ২০২৬) */
export function formatBnDate(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return `${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]}, ${toBn(d.getFullYear())}`;
}

/** চলতি সপ্তাহের ৭ দিনের তালিকা (রবি-শনি) */
export function getCurrentWeekDays(): {
  dateKey: string;
  dayNumBn: string;
  dayLetter: string;
  dayBn: string;
  monthBn: string;
  isToday: boolean;
  isFuture: boolean;
}[] {
  const now = new Date();
  const todayKey = getLocalDateKey(now);
  const dayOfWeek = now.getDay(); // 0=Sun..6=Sat
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(sunday);
    cur.setDate(sunday.getDate() + i);
    const key = getLocalDateKey(cur);
    days.push({
      dateKey: key,
      dayNumBn: toBn(cur.getDate()),
      dayLetter: EN_DAYS_SINGLE[cur.getDay()],
      dayBn: BN_DAYS_SHORT[cur.getDay()],
      monthBn: BN_MONTHS[cur.getMonth()],
      isToday: key === todayKey,
      isFuture: cur.getTime() > todayMidnight.getTime(),
    });
  }
  return days;
}

/** প্রশ্নের ধরনের বাংলা লেবেল */
export function getQuestionTypeLabel(type: Question['type']): string {
  switch (type) {
    case 'mcq':
      return 'বহুনির্বাচনি (MCQ)';
    case 'translate':
      return 'অনুবাদ';
    case 'short':
      return 'সংক্ষিপ্ত প্রশ্ন';
    case 'written':
      return 'লিখিত / রচনামূলক';
    default:
      return 'প্রশ্ন';
  }
}

/**
 * সম্পূর্ণ অফলাইন একক HTML ফাইল তৈরি করে ডাউনলোডের জন্য।
 * এর ফলে ইউজার নিজের সব প্রশ্নসহ একটি পোর্টেবল .html ফাইল সেভ করে রাখতে পারবেন।
 */
export function downloadStandaloneHtml(questions: Question[], userName: string): void {
  const safeJson = JSON.stringify(questions, null, 2).replace(/<\/script>/gi, '<\\/script>');
  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Nur — অফলাইন প্রশ্নব্যাংক ও পরীক্ষা প্রস্তুতি</title>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Hind Siliguri', sans-serif; }
  body { background: #EEF2F0; color: #0f172a; display: flex; justify-content: center; min-height: 100vh; }
  .app { width: 100%; max-width: 430px; background: #fff; min-height: 100vh; padding: 16px 16px 80px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
  .header { display: flex; align-items: center; justify-content: space-between; padding: 8px 0 16px; border-bottom: 1px solid #e2e8f0; margin-bottom: 16px; }
  .brand { font-size: 22px; font-weight: 700; color: #0B7A4B; }
  .chip { background: #E4F2EC; color: #0B7A4B; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
  .search { width: 100%; padding: 12px 16px; border-radius: 999px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 15px; margin-bottom: 14px; outline: none; }
  .card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 16px; margin-bottom: 12px; background: #fff; }
  .q-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; line-height: 1.5; }
  .opt { width: 100%; text-align: left; padding: 10px 12px; margin-bottom: 6px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; cursor: pointer; font-size: 14px; }
  .opt.correct { background: #dcfce7; border-color: #16a34a; color: #166534; font-weight: 600; }
  .opt.wrong { background: #fee2e2; border-color: #dc2626; color: #991b1b; }
  .ans-box { margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: #E4F2EC; color: #065f46; font-size: 14px; line-height: 1.5; }
  .btn { background: #0B7A4B; color: #fff; border: none; padding: 10px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 14px; }
</style>
</head>
<body>
<div class="app">
  <div class="header">
    <div class="brand">Nur AI</div>
    <div class="chip">${userName}</div>
  </div>
  <input id="qSearch" class="search" placeholder="প্রশ্ন খুঁজো..." oninput="render()" />
  <div id="list"></div>
</div>
<script>
/*
  ============================================================
  নতুন প্রশ্ন যোগ করার নিয়ম:
  নিচের QUESTIONS_BANK অ্যারের ভেতরে একই ফরম্যাটে নতুন অবজেক্ট যোগ করুন:
  {
    id: "custom_1",
    subject: "ai_ml",
    set: "batch2_setA",
    type: "mcq", // "mcq" | "short" | "written" | "translate"
    question: "আপনার প্রশ্ন এখানে লিখুন",
    options: ["অপশন ১", "অপশন ২", "অপশন ৩", "অপশন ৪"],
    correctIndex: 0,
    answer: "অপশন ১",
    explanation: "সংক্ষিপ্ত ব্যাখ্যা এখানে লিখুন",
    marks: 1
  }
  ============================================================
*/
const QUESTIONS_BANK = ${safeJson};
const BN = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const LETTERS = ['ক','খ','গ','ঘ'];
const toBn = (n) => String(n).replace(/\\d/g, d => BN[Number(d)]);

function render() {
  const term = document.getElementById('qSearch').value.toLowerCase();
  const filtered = QUESTIONS_BANK.filter(q => q.question.toLowerCase().includes(term) || (q.answer || '').toLowerCase().includes(term));
  const el = document.getElementById('list');
  el.innerHTML = filtered.map((q, idx) => {
    const opts = q.type === 'mcq' && q.options ? q.options.map((o, oi) =>
      '<button class="opt" onclick="check(this,' + oi + ',' + q.correctIndex + ',\\'' + q.id + '\\')">' + LETTERS[oi] + ') ' + o + '</button>'
    ).join('') : '<button class="btn" onclick="toggleAns(\\'' + q.id + '\\')">উত্তর দেখো</button>';
    return '<div class="card"><div class="q-title">' + toBn(idx+1) + '. ' + q.question + '</div>' + opts +
      '<div id="ans_' + q.id + '" class="ans-box" style="display:none"><strong>সঠিক উত্তর:</strong> ' + q.answer + '<br/>' + (q.explanation || '') + '</div></div>';
  }).join('');
}
function check(btn, picked, correct, id) {
  const parent = btn.parentElement;
  const btns = parent.querySelectorAll('.opt');
  btns.forEach((b, i) => {
    if (i === correct) b.classList.add('correct');
    else if (i === picked) b.classList.add('wrong');
  });
  document.getElementById('ans_' + id).style.display = 'block';
}
function toggleAns(id) {
  const box = document.getElementById('ans_' + id);
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
}
render();
</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nur-ai-exam-prep.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
