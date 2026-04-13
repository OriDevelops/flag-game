import { useState, FormEvent } from 'react';
import { Language } from '../types';
import { Translations } from '../i18n';
interface Props {
  onRegister: (username: string, password: string) => string | null;
  onLogin:    (username: string, password: string) => string | null;
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
}
type Tab = 'login' | 'register';
export function AuthScreen({ onRegister, onLogin, lang, setLang, t }: Props) {
  const [tab,      setTab]      = useState<Tab>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorKey, setErrorKey] = useState('');
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorKey('');
    const err = tab === 'register'
      ? onRegister(username, password)
      : onLogin(username, password);
    if (err) setErrorKey(err);
  }
  function switchTab(t: Tab) {
    setTab(t);
    setErrorKey('');
    setUsername('');
    setPassword('');
  }
  const errorMsg = errorKey ? (t[errorKey as keyof Translations] as string) ?? errorKey : '';
  return (
    <div className="screen auth-screen" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div className="auth-card">
        <div className="auth-emoji">🌍</div>
        <h1 className="auth-title">{t.appName}</h1>
        <div className="lang-toggle">
          <button className={`lang-btn ${lang === 'en' ? 'lang-btn--active' : ''}`} onClick={() => setLang('en')} type="button">EN</button>
          <button className={`lang-btn ${lang === 'he' ? 'lang-btn--active' : ''}`} onClick={() => setLang('he')} type="button">עב</button>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'auth-tab--active' : ''}`} onClick={() => switchTab('login')} type="button">{t.login}</button>
          <button className={`auth-tab ${tab === 'register' ? 'auth-tab--active' : ''}`} onClick={() => switchTab('register')} type="button">{t.register}</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-username">{t.usernameLabel}</label>
            <input id="auth-username" className="auth-input" type="text" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" autoFocus />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">{t.passwordLabel}</label>
            <input id="auth-password" className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={tab === 'register' ? 'new-password' : 'current-password'} />
          </div>
          {errorMsg && <p className="auth-error">{errorMsg}</p>}
          <button className="btn btn--primary btn--large auth-submit" type="submit">
            {tab === 'register' ? t.createAccount : t.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}
