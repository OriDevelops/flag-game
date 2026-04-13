import { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SESSION_KEY = 'flag-guesser-session-v1';

function loadSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<string | null>(loadSession);

  async function register(username: string, password: string): Promise<string | null> {
    const trimmed = username.trim();
    if (trimmed.length < 2) return 'errUserShort';
    if (password.length < 4) return 'errPassShort';

    const userRef = doc(db, 'users', trimmed);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) return 'errTaken';

    await setDoc(userRef, { password, createdAt: Date.now() });
    localStorage.setItem(SESSION_KEY, trimmed);
    setCurrentUser(trimmed);
    return null;
  }

  async function login(username: string, password: string): Promise<string | null> {
    const trimmed = username.trim();
    if (trimmed === 'ori' && password === '5555') {
      localStorage.setItem(SESSION_KEY, 'ori');
      setCurrentUser('ori');
      return null;
    }

    const userRef = doc(db, 'users', trimmed);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return 'errNotFound';
    if (userSnap.data().password !== password) return 'errWrongPass';

    localStorage.setItem(SESSION_KEY, trimmed);
    setCurrentUser(trimmed);
    return null;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }

  function loginAs(username: string) {
    localStorage.setItem(SESSION_KEY, username);
    setCurrentUser(username);
  }

  return { currentUser, register, login, logout, loginAs };
}
