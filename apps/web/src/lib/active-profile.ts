/**
 * The id of the profile the user is currently working on.
 *
 * The app is single-user and local-first, so the active profile lives in
 * localStorage rather than in a session on a server. Pages that are not
 * addressed by an explicit /profile/:id fall back to this value.
 */
const STORAGE_KEY = 'ocp.activeProfileId';

export function getActiveProfileId(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value && value.trim() !== '' ? value : null;
  } catch {
    // localStorage can be unavailable (private mode, disabled storage).
    return null;
  }
}

export function setActiveProfileId(profileId: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, profileId);
  } catch {
    // Losing the shortcut is acceptable; explicit /profile/:id URLs still work.
  }
}

export function clearActiveProfileId(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
