import useVerifiedBadgeSync from '../hooks/useVerifiedBadgeSync';

/** Global badge sync — mount once inside AuthBootstrap. */
export default function VerifiedBadgeSync() {
  useVerifiedBadgeSync();
  return null;
}
