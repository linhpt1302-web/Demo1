/**
 * Generates a clean, consistent avatar URL or fallback for a member
 */
export function getMemberAvatar(avatarUrl?: string, fullName?: string): string {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }
  const cleanName = encodeURIComponent(fullName || 'Pickleball Player');
  return `https://ui-avatars.com/api/?name=${cleanName}&background=0D9488&color=fff&bold=true&rounded=true`;
}

/**
 * Image error handler fallback
 */
export function handleAvatarError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fullName?: string
) {
  const target = e.currentTarget;
  const cleanName = encodeURIComponent(fullName || 'Player');
  target.onerror = null; // prevent infinite loop
  target.src = `https://ui-avatars.com/api/?name=${cleanName}&background=0D9488&color=fff&bold=true&rounded=true`;
}
