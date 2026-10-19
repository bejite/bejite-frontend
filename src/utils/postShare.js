import { toast } from 'react-toastify';
import { sharePost, unsharePost } from '../services/postsApi';

export function getPostShareUrl(postId) {
  return `${window.location.origin}/p/${encodeURIComponent(postId)}`;
}

export function isPublicShareablePost(post) {
  return post?.visibility === 'public' && post?.status === 'published';
}

export function buildPostShareText(post) {
  const authorName =
    post?.author?.name?.trim() ||
    [post?.author?.firstName, post?.author?.lastName].filter(Boolean).join(' ').trim() ||
    'Someone on Bejite';

  const body = String(post?.body || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (body) {
    const snippet = body.length > 120 ? `${body.slice(0, 117).trimEnd()}...` : body;
    return `${authorName}: ${snippet}`;
  }

  return `Check out ${authorName}'s post on Bejite`;
}

/**
 * Record a share on the server (used by external share).
 */
export async function recordPostShare(postId) {
  try {
    await sharePost(postId);
    return true;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.error || err.response?.data?.message;
    if (status !== 409) {
      toast.error(message || 'Failed to share post');
      throw err;
    }
    return true;
  }
}

/**
 * Toggle an in-app repost. Returns the next sharedByMe state.
 * @param {string} postId
 * @param {boolean} currentlyShared
 * @param {string|null} [quote]
 * @param {string|null} [scheduledAt] - ISO timestamp for scheduled repost
 * @returns {Promise<{ shared: boolean, scheduled: boolean }>}
 */
export async function togglePostRepost(
  postId,
  currentlyShared,
  quote = null,
  scheduledAt = null,
) {
  try {
    if (currentlyShared) {
      await unsharePost(postId);
      toast.success('Repost removed');
      return { shared: false, scheduled: false };
    }
    const data = await sharePost(postId, quote, scheduledAt);
    const scheduled = Boolean(scheduledAt) || Boolean(data?.share?.scheduledAt && !data?.share?.liveAt);
    toast.success(
      scheduled
        ? 'Repost scheduled'
        : 'Post reposted to your network',
    );
    return { shared: true, scheduled };
  } catch (err) {
    const message = err.response?.data?.error || err.response?.data?.message;
    toast.error(message || (currentlyShared ? 'Failed to undo repost' : 'Failed to repost'));
    throw err;
  }
}

export async function copyPostLink(postId) {
  const url = getPostShareUrl(postId);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard.');
    } else {
      toast.success('Share link ready.');
    }
  } catch {
    toast.success('Share link ready.');
  }
  return url;
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent || "",
  );
}

export { isMobileDevice };

/** Open an external share/intent URL (WhatsApp, Facebook, etc.). */
export function openExternalShare(url) {
  if (!url) return;

  if (isMobileDevice()) {
    window.location.assign(url);
    return;
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function openShareWindow(url) {
  openExternalShare(url);
}

export function openWhatsAppShare(message) {
  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  openExternalShare(shareUrl);
}

export function getSocialShareUrl(platform, postUrl, { text, title } = {}) {
  const encodedUrl = encodeURIComponent(postUrl);
  const shareText = text || title || 'Check out this post on Bejite';
  const encodedText = encodeURIComponent(shareText);

  switch (platform) {
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'x':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    default:
      return postUrl;
  }
}
