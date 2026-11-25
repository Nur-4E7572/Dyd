export type QuestionType = 'mcq' | 'short' | 'written' | 'translate';

export type SubjectId =
  | 'computer_basics'
  | 'internet_email'
  | 'hardware_security'
  | 'ai_ml'
  | 'genai_prompt'
  | 'ai_ethics'
  | 'ai_tools'
  | 'graphic_freelancing'
  | 'english'
  | 'ms_office';

export interface Question {
  id: string;
  subject: SubjectId;
  set: string; // e.g. "batch1_setA", "batch2_setA", "batch2_setB", "batch2_suggestion", "dinajpur_poly", "mcq_200", "written_30"
  institution?: string; // e.g. "dyd" | "dinajpur_poly"
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ: 4 options
  answer: string; // For MCQ: exact option string or index 0-3 (we store exact matching string or index)
  correctIndex?: number; // 0, 1, 2, 3 for MCQ
  explanation: string;
  marks: number;
}

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  shortName: string;
  subtitle: string;
  gradient: string;
  accentColor: string;
  iconBg: string;
}

export interface ExamSetInfo {
  id: string;
  title: string;
  shortTitle: string;
  batch: string;
  subtitle: string;
  durationMinutes: number;
  totalMarks: number;
  gradient: string;
  institution: 'dyd' | 'dinajpur_poly';
  isLive?: boolean;
  liveText?: string;
  countdownSeconds?: number;
  participants?: number;
  isPractical?: boolean;
}

export type ExamMode = 'mock' | 'practice';

export interface ExamSession {
  id: string;
  title: string;
  subtitle: string;
  mode: ExamMode;
  questions: Question[];
  durationMinutes: number;
  negativeMarking: boolean;
  startedAt: number;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedOptionIndex?: number; // for MCQ
  typedAnswer?: string; // for short/translate/written
  selfEval?: 'correct' | 'wrong'; // for short/translate/written
  isCorrect: boolean;
  isAttempted: boolean;
}

export interface ExamHistoryItem {
  id: string;
  title: string;
  subtitle: string;
  mode: ExamMode;
  dateISO: string;
  durationSecondsSpent: number;
  totalQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percentage: number;
  pointsEarned: number;
  negativeMarking: boolean;
  questionIds: string[];
  answers: Record<string, UserAnswerRecord>;
}

export interface UserProfile {
  name: string;
  subtitle: string;
  avatarVariant: number;
}

export interface UserSettings {
  negativeMarking: boolean;
  defaultDurationMinutes: number;
  defaultMarks: number;
  darkMode: boolean;
}

export interface DailyPointEntry {
  dateKey: string; // YYYY-MM-DD
  points: number;
}

export interface AppStorageData {
  profile: UserProfile;
  settings: UserSettings;
  bookmarks: string[];
  mistakes: string[];
  history: ExamHistoryItem[];
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  dailyPoints: Record<string, number>; // YYYY-MM-DD -> points
  practicalChecks: Record<string, boolean>;
  customQuestions: Question[];
  friends: { id: string; name: string; batch: string; points: number }[];
}
