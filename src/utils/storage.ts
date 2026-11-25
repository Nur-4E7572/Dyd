import { AppStorageData, ExamHistoryItem, Question, UserProfile, UserSettings } from '../types';
import { getLocalDateKey } from './bengali';

const STORAGE_KEY = 'chorcha_ai_dyd_v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'শিক্ষার্থী',
  subtitle: 'যুব উন্নয়ন AI বেসিক কোর্স — ২০২৬',
  avatarVariant: 0,
};

export const DEFAULT_SETTINGS: UserSettings = {
  negativeMarking: false,
  defaultDurationMinutes: 45,
  defaultMarks: 40,
  darkMode: false,
};

export const DEFAULT_STORAGE: AppStorageData = {
  profile: DEFAULT_PROFILE,
  settings: DEFAULT_SETTINGS,
  bookmarks: [],
  mistakes: [],
  history: [],
  streak: 0,
  lastActiveDate: null,
  dailyPoints: {},
  practicalChecks: {},
  customQuestions: [],
  friends: [
    { id: 'f1', name: 'রাফি আহমেদ', batch: '২য় ব্যাচ — ঢাকা', points: 48.5 },
    { id: 'f2', name: 'তাসনিম জাহান', batch: '২য় ব্যাচ — দিনাজপুর', points: 62.0 },
  ],
};

export function loadAppStorage(): AppStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STORAGE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STORAGE,
      ...parsed,
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      dailyPoints: parsed.dailyPoints && typeof parsed.dailyPoints === 'object' ? parsed.dailyPoints : {},
      practicalChecks: parsed.practicalChecks && typeof parsed.practicalChecks === 'object' ? parsed.practicalChecks : {},
      customQuestions: Array.isArray(parsed.customQuestions) ? parsed.customQuestions : [],
      friends: Array.isArray(parsed.friends) ? parsed.friends : DEFAULT_STORAGE.friends,
    };
  } catch {
    return { ...DEFAULT_STORAGE };
  }
}

export function saveAppStorage(data: AppStorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage quota errors gracefully
  }
}

export function updateStreakAndPoints(
  data: AppStorageData,
  pointsEarned: number,
  examRecord: ExamHistoryItem,
  newWrongIds: string[],
  correctedIds: string[]
): AppStorageData {
  const todayKey = getLocalDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);

  let nextStreak = data.streak;
  if (data.lastActiveDate === todayKey) {
    nextStreak = Math.max(1, data.streak);
  } else if (data.lastActiveDate === yesterdayKey) {
    nextStreak = data.streak + 1;
  } else {
    nextStreak = 1;
  }

  const nextDaily = { ...data.dailyPoints };
  nextDaily[todayKey] = Number(((nextDaily[todayKey] || 0) + pointsEarned).toFixed(2));

  // Merge mistakes: add newWrongIds, remove correctedIds if they practiced and got them right
  const mistakeSet = new Set(data.mistakes);
  correctedIds.forEach((id) => mistakeSet.delete(id));
  newWrongIds.forEach((id) => mistakeSet.add(id));

  return {
    ...data,
    streak: nextStreak,
    lastActiveDate: todayKey,
    dailyPoints: nextDaily,
    mistakes: Array.from(mistakeSet),
    history: [examRecord, ...data.history].slice(0, 60),
  };
}

export function getTotalPoints(dailyPoints: Record<string, number>): number {
  return Number(
    Object.values(dailyPoints)
      .reduce((acc, v) => acc + (Number(v) || 0), 0)
      .toFixed(1)
  );
}

export function computeUserRank(totalPoints: number, examsCount: number): string {
  if (examsCount === 0 && totalPoints === 0) return '—';
  if (totalPoints >= 150) return 'শীর্ষ ৫%';
  if (totalPoints >= 80) return 'শীর্ষ ১৫%';
  if (totalPoints >= 40) return 'শীর্ষ ৩০%';
  if (totalPoints >= 15) return 'সেরা ৫০%';
  return 'নতুন শিক্ষার্থী';
}

export function mergeAllQuestions(base: Question[], custom: Question[]): Question[] {
  return [...custom, ...base];
}
