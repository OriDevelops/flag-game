export interface Achievement {
  id: string;
  emoji: string;
  nameEn: string;
  nameHe: string;
  descEn: string;
  descHe: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_correct', emoji: '⭐', nameEn: 'First Star', nameHe: 'כוכב ראשון', descEn: 'First correct answer', descHe: 'תשובה נכונה ראשונה' },
  { id: 'score_50',      emoji: '🥉', nameEn: 'Bronze',     nameHe: 'ארד',        descEn: 'Reach 50 points',   descHe: '50 נקודות' },
  { id: 'score_200',     emoji: '🥈', nameEn: 'Silver',     nameHe: 'כסף',        descEn: 'Reach 200 points',  descHe: '200 נקודות' },
  { id: 'score_1000',    emoji: '🥇', nameEn: 'Gold',       nameHe: 'זהב',        descEn: 'Reach 1000 points', descHe: '1000 נקודות' },
  { id: 'streak_3',      emoji: '🔥', nameEn: 'On Fire',    nameHe: 'בוער',       descEn: '3-day streak',      descHe: '3 ימים ברצף' },
  { id: 'streak_7',      emoji: '🌊', nameEn: 'Unstoppable',nameHe: 'בלתי נעצר', descEn: '7-day streak',      descHe: '7 ימים ברצף' },
  { id: 'flags_50',      emoji: '🌍', nameEn: 'Explorer',   nameHe: 'חוקר',       descEn: '50 flags done',     descHe: '50 דגלים' },
  { id: 'flags_all',     emoji: '🏆', nameEn: 'World Master',nameHe: 'אלוף העולם',descEn: 'All flags done',    descHe: 'כל הדגלים' },
  { id: 'companies_50',  emoji: '💼', nameEn: 'Business Pro', nameHe: 'עסקן',         descEn: '50 logos done',      descHe: '50 חברות' },
  { id: 'companies_all', emoji: '🏢', nameEn: 'Logo Master',  nameHe: 'אלוף הסמלים', descEn: 'All logos done',     descHe: 'כל החברות' },
];
