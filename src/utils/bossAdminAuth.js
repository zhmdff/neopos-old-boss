/** Boss panel (/boss) — yalnız admin rolü olan JWT istifadəçiləri. */
export function parseStoredBossUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isBossPanelAdmin(user) {
  if (!user || typeof user !== 'object') return false;
  if (user.isAdmin === true || user.IsAdmin === true) return true;
  if (user.roleIsAdmin === true || user.RoleIsAdmin === true) return true;
  return false;
}
