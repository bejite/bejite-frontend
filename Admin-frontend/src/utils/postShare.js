import { toast } from 'react-toastify';
import { sharePost } from '../services/postsApi';

export function getPostShareUrl(postId) {
  return `${window.location.origin}/news-feed?post=${encodeURIComponent(postId)}`;
}

/**
 * Record a share on the server.
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

export function openShareWindow(url) {
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
}

export function getSocialShareUrl(platform, postUrl) {
  const encoded = encodeURIComponent(postUrl);
  switch (platform) {
    case 'whatsapp':
      return `https://wa.me/?text=${encoded}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    case 'x':
      return `https://twitter.com/intent/tweet?url=${encoded}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encoded}`;
    default:
      return postUrl;
  }
}
