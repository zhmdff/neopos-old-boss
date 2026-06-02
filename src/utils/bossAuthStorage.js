import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const REMEMBER_KEY = 'boss_remember_me';
const TOKEN_KEY = 'boss_auth_token';
const USER_KEY = 'boss_auth_user';

function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

function wantsRememberMe() {
  try {
    const v = localStorage.getItem(REMEMBER_KEY);
    if (v === '0') return false;
    return true;
  } catch {
    return true;
  }
}

/**
 * Restore session into localStorage before React/router run (APK + web).
 */
export async function hydrateBossAuth() {
  if (isNative()) {
    try {
      const remember = await Preferences.get({ key: REMEMBER_KEY });
      if (remember.value === '0') return;

      const [tokenRes, userRes] = await Promise.all([
        Preferences.get({ key: TOKEN_KEY }),
        Preferences.get({ key: USER_KEY }),
      ]);

      if (tokenRes.value) localStorage.setItem('token', tokenRes.value);
      if (userRes.value) localStorage.setItem('user', userRes.value);
      if (remember.value === '1') localStorage.setItem(REMEMBER_KEY, '1');
    } catch {
      /* ignore */
    }
    return;
  }

  try {
    if (localStorage.getItem(REMEMBER_KEY) === '0') {
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', user);
    }
  } catch {
    /* ignore */
  }
}

export function getRememberMePreference() {
  return wantsRememberMe();
}

/**
 * @param {{ token: string, user: object, rememberMe?: boolean }} payload
 */
export async function saveBossSession({ token, user, rememberMe = true }) {
  const userJson = typeof user === 'string' ? user : JSON.stringify(user);
  const remember = rememberMe !== false;

  try {
    if (remember) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userJson);
      localStorage.setItem(REMEMBER_KEY, '1');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', userJson);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem(REMEMBER_KEY, '0');
    }
  } catch {
    /* ignore */
  }

  if (!isNative()) return;

  try {
    await Preferences.set({ key: REMEMBER_KEY, value: remember ? '1' : '0' });
    if (remember) {
      await Preferences.set({ key: TOKEN_KEY, value: token });
      await Preferences.set({ key: USER_KEY, value: userJson });
    } else {
      await Preferences.remove({ key: TOKEN_KEY });
      await Preferences.remove({ key: USER_KEY });
    }
  } catch {
    /* ignore */
  }
}

export async function clearBossSession() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  } catch {
    /* ignore */
  }

  if (!isNative()) return;

  try {
    await Promise.all([
      Preferences.remove({ key: TOKEN_KEY }),
      Preferences.remove({ key: USER_KEY }),
      Preferences.remove({ key: REMEMBER_KEY }),
    ]);
  } catch {
    /* ignore */
  }
}
