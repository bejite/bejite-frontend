import { toast } from 'react-toastify';
import { openShareWindow } from './postShare';

export function buildInviteMessage(user, customText) {
  if (customText?.trim()) return customText.trim();

  const name = user?.firstName?.trim() || user?.name?.split?.(' ')?.[0];
  if (name) {
    return `Hey! ${name} invited you to join Bejite — the platform for job seekers and recruiters. Sign up and connect with opportunities today!`;
  }

  return 'Hey! Join me on Bejite — the platform for job seekers and recruiters. Sign up and connect with opportunities today!';
}

export function buildInviteUrl(userId) {
  const base = `${window.location.origin}/signup`;
  if (!userId) return base;
  return `${base}?ref=${encodeURIComponent(userId)}`;
}

export function getInviteShareUrl(platform, { message, url }) {
  const text = encodeURIComponent(message);
  const link = encodeURIComponent(url);
  const full = encodeURIComponent(`${message}\n\n${url}`);

  switch (platform) {
    case 'whatsapp':
      return `https://wa.me/?text=${full}`;
    case 'telegram':
      return `https://t.me/share/url?url=${link}&text=${text}`;
    case 'x':
      return `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${link}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;
    case 'email':
      return `mailto:?subject=${encodeURIComponent('Join me on Bejite')}&body=${full}`;
    default:
      return url;
  }
}

export async function copyInviteLink(message, url) {
  const text = `${message}\n\n${url}`;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      toast.success('Invite message copied to clipboard.');
    } else {
      toast.success('Invite message ready to share.');
    }
  } catch {
    toast.success('Invite message ready to share.');
  }
  return text;
}

export async function shareInvite(platform, { message, url }) {
  if (platform === 'copy') {
    await copyInviteLink(message, url);
    return;
  }

  if (platform === 'native' && navigator.share) {
    try {
      await navigator.share({
        title: 'Join me on Bejite',
        text: message,
        url,
      });
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error('Could not open share menu.');
      }
    }
    return;
  }

  if (platform === 'email') {
    window.location.href = getInviteShareUrl('email', { message, url });
    return;
  }

  openShareWindow(getInviteShareUrl(platform, { message, url }));
}

export function canUseNativeShare() {
  return typeof navigator !== 'undefined' && Boolean(navigator.share);
}
