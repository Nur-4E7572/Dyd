import { Question, QuestionType, SubjectId } from '../../types';

export type McqTuple = [
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  set?: string
];

export type NonMcqTuple = [
  type: Exclude<QuestionType, 'mcq'>,
  question: string,
  answer: string,
  explanation: string,
  marks?: number,
  set?: string
];

export function buildMcqBank(
  prefix: string,
  subject: SubjectId,
  defaultSet: string,
  items: McqTuple[]
): Question[] {
  return items.map(([question, options, correctIndex, explanation, customSet], idx) => ({
    id: `${prefix}_${idx + 1}`,
    subject,
    set: customSet || defaultSet,
    institution: 'dyd',
    type: 'mcq',
    question,
    options,
    correctIndex,
    answer: options[correctIndex],
    explanation,
    marks: 1,
  }));
}

export function buildNonMcqBank(
  prefix: string,
  subject: SubjectId,
  defaultSet: string,
  items: NonMcqTuple[]
): Question[] {
  return items.map(([type, question, answer, explanation, marks = 1, customSet], idx) => ({
    id: `${prefix}_${idx + 1}`,
    subject,
    set: customSet || defaultSet,
    institution: 'dyd',
    type,
    question,
    answer,
    explanation,
    marks,
  }));
}
