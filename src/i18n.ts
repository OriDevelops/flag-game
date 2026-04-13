export type Language = 'en' | 'he';

export interface Translations {
  appName: string;
  appNameCompanies: string;
  chooseRegion: string;
  totalScore: string;
  allCountries: string;
  africa: string;
  americas: string;
  asia: string;
  europe: string;
  countries: string;
  flagsLabel: string;
  completed: string;
  login: string;
  register: string;
  usernameLabel: string;
  passwordLabel: string;
  createAccount: string;
  signIn: string;
  logout: string;
  nextFlag: string;
  nextCompany: string;
  seeResults: string;
  tryAgain: string;
  correctLabel: string;
  wrongPos: string;
  notInWord: string;
  livesLeft: (n: number) => string;
  skippedMsg: string;
  answerWas: string;
  correctMsg: (pts: number) => string;
  playAgain: string;
  mainMenu: string;
  hint: string;
  hintCost: string;
  revealWord: string;
  revealCost: string;
  skip: string;
  goBack: string;
  home: string;
  needPts: string;
  rule1: string;
  rule2: string;
  rule3: string;
  rule4: string;
  rule5: string;
  errUserShort: string;
  errPassShort: string;
  errTaken: string;
  errNotFound: string;
  errWrongPass: string;
  ratingMaster: string;
  ratingExpert: string;
  ratingGood: string;
  ratingStudy: string;
  ratingPractice: string;
  accuracy: string;
  points: string;
  countriesRound: string;
  companiesRound: string;
  chooseCategory: string;
  modeCountries: string;
  modeCompanies: string;
  companiesCount: string;
  catAll: string;
  catTech: string;
  catAuto: string;
  catFood: string;
  catFashion: string;
  catFinance: string;
  catMedia: string;
  catRetail: string;
  catEnergy: string;
  catPharma: string;
  catTransport: string;
}

/** All UI strings in both languages */
export const T: { en: Translations; he: Translations } = {
  en: {
    appName: 'Guess the Flag',
    appNameCompanies: 'Guess the Logo',
    chooseRegion: 'Choose a region to start',
    totalScore: 'Total Score',
    allCountries: 'All Countries',
    africa: 'Africa',
    americas: 'Americas',
    asia: 'Asia',
    europe: 'Europe',
    countries: 'countries',
    flagsLabel: 'flags',
    completed: 'completed',
    login: 'Login',
    register: 'Register',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    createAccount: 'Create Account',
    signIn: 'Sign In',
    logout: 'Logout',
    nextFlag: 'Next Flag →',
    nextCompany: 'Next Company →',
    seeResults: 'See Results',
    tryAgain: 'Try Again',
    correctLabel: 'correct',
    wrongPos: 'wrong position',
    notInWord: 'not in word',
    livesLeft: (n: number) => `${n} ${n === 1 ? 'life' : 'lives'} remaining`,
    skippedMsg: 'Skipped! It was:',
    answerWas: 'The answer was:',
    correctMsg: (pts: number) => `Correct! +${pts} point${pts !== 1 ? 's' : ''}!`,
    playAgain: 'Continue',
    mainMenu: '← Main Menu',
    hint: 'Hint',
    hintCost: '5',
    revealWord: 'Reveal',
    revealCost: '15',
    skip: 'Skip',
    goBack: 'Prev Flag',
    home: '← Home',
    needPts: 'Need 5 pts to use hint',
    rule1: 'Fill all the blanks — the game checks automatically',
    rule2: 'Green = right letter, right position',
    rule3: 'Yellow = right letter, wrong position',
    rule4: 'Red = letter not in word',
    rule5: '3 lives per flag · 💡 Hint costs 5 pts · ⏭️ Skip anytime',
    errUserShort: 'Username must be at least 2 characters',
    errPassShort: 'Password must be at least 4 characters',
    errTaken: 'Username already taken',
    errNotFound: 'User not found',
    errWrongPass: 'Incorrect password',
    ratingMaster: 'Geography Master!',
    ratingExpert: 'Flag Expert!',
    ratingGood: 'Good Job!',
    ratingStudy: 'Keep Studying!',
    ratingPractice: 'Keep Practising!',
    accuracy: 'accuracy',
    points: 'points',
    countriesRound: 'Countries in this round:',
    companiesRound: 'Companies in this round:',
    chooseCategory: 'Choose a category',
    modeCountries: 'Countries',
    modeCompanies: 'Companies',
    companiesCount: 'companies',
    catAll: 'All Companies',
    catTech: 'Tech',
    catAuto: 'Automotive',
    catFood: 'Food & Drink',
    catFashion: 'Fashion',
    catFinance: 'Finance',
    catMedia: 'Media',
    catRetail: 'Retail',
    catEnergy: 'Energy',
    catPharma: 'Pharma',
    catTransport: 'Transport',
  },
  he: {
    appName: 'נחש את הדגל',
    appNameCompanies: 'נחש את הסמל',
    chooseRegion: 'בחר קטגוריה',
    totalScore: 'ניקוד כולל',
    allCountries: 'כל העולם',
    africa: 'אפריקה',
    americas: 'אמריקה',
    asia: 'אסיה',
    europe: 'אירופה',
    countries: 'מדינות',
    flagsLabel: 'דגלים',
    completed: 'הושלם',
    login: 'התחברות',
    register: 'הרשמה',
    usernameLabel: 'שם משתמש',
    passwordLabel: 'סיסמה',
    createAccount: 'צור חשבון',
    signIn: 'התחבר',
    logout: 'התנתק',
    nextFlag: 'דגל הבא →',
    nextCompany: 'חברה הבאה →',
    seeResults: 'ראה תוצאות',
    tryAgain: 'נסה שוב',
    correctLabel: 'נכון',
    wrongPos: 'מיקום שגוי',
    notInWord: 'לא במילה',
    livesLeft: (n: number) => `נותרו ${n} חיים`,
    skippedMsg: 'דילגת! התשובה הייתה:',
    answerWas: 'התשובה הייתה:',
    correctMsg: (pts: number) => `כל הכבוד! +${pts} נקודות`,
    playAgain: 'המשך',
    mainMenu: '← תפריט ראשי',
    hint: 'רמז',
    hintCost: '5',
    revealWord: 'גלה מילה',
    revealCost: '15',
    skip: 'דלג',
    goBack: 'דגל קודם',
    home: '← בית',
    needPts: 'צריך 5 נקודות לרמז',
    rule1: 'מלא את כל הריקים — המשחק יבדוק אוטומטית',
    rule2: 'ירוק = אות נכונה במיקום נכון',
    rule3: 'צהוב = אות נכונה במיקום שגוי',
    rule4: 'אדום = אות לא קיימת במילה',
    rule5: '3 חיים לדגל · 💡 רמז עולה 5 נקודות · ⏭️ אפשר לדלג',
    errUserShort: 'שם משתמש חייב להכיל לפחות 2 תווים',
    errPassShort: 'סיסמה חייבת להכיל לפחות 4 תווים',
    errTaken: 'שם המשתמש כבר תפוס',
    errNotFound: 'משתמש לא נמצא',
    errWrongPass: 'סיסמה שגויה',
    ratingMaster: '!אלוף גאוגרפיה',
    ratingExpert: '!מומחה דגלים',
    ratingGood: '!כל הכבוד',
    ratingStudy: '!תמשיך ללמוד',
    ratingPractice: '!תמשיך להתאמן',
    accuracy: 'דיוק',
    points: 'נקודות',
    countriesRound: ':מדינות בסיבוב זה',
    companiesRound: ':חברות בסיבוב זה',
    chooseCategory: 'בחר קטגוריה',
    modeCountries: 'מדינות',
    modeCompanies: 'חברות',
    companiesCount: 'חברות',
    catAll: 'כל החברות',
    catTech: 'טכנולוגיה',
    catAuto: 'רכב',
    catFood: 'אוכל ושתייה',
    catFashion: 'אופנה',
    catFinance: 'פיננסים',
    catMedia: 'מדיה',
    catRetail: 'קמעונאות',
    catEnergy: 'אנרגיה',
    catPharma: 'פארמה',
    catTransport: 'תחבורה',
  },
};
