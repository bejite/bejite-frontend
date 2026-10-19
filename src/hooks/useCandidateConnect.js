import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as connectionsApi from '../services/connectionsApi';
import * as followsApi from '../services/followsApi';
import { getUser } from '../utils/tokenManager';
import { resolveRecruiterMode } from '../utils/recruiterProfilePaths';

/**
 * Connect (people) or Follow (corporate pages) depending on target/viewer.
 */
export function useCandidateConnect(userId, displayName = '') {
  const normalizedUserId =
    userId != null && userId !== '' ? String(userId) : null;

  const viewer = getUser();
  const viewerIsCorporate =
    String(viewer?.role || '').toLowerCase() === 'recruiter' &&
    resolveRecruiterMode(viewer) === 'corporate';

  const [status, setStatus] = useState({
    loading: Boolean(normalizedUserId),
    isConnected: false,
    pendingOutgoing: false,
    pendingIncoming: false,
    incomingRequestId: null,
    outgoingRequestId: null,
    unavailable: false,
    isCorporate: false,
    viewerIsCorporate,
    isFollowing: false,
    canFollow: false,
    followerCount: 0,
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!normalizedUserId) {
      setStatus({
        loading: false,
        isConnected: false,
        pendingOutgoing: false,
        pendingIncoming: false,
        incomingRequestId: null,
        outgoingRequestId: null,
        unavailable: false,
        isCorporate: false,
        viewerIsCorporate,
        isFollowing: false,
        canFollow: false,
        followerCount: 0,
      });
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus((prev) => ({ ...prev, loading: true }));
      try {
        const follow = await followsApi.getFollowStatus(normalizedUserId);
        if (cancelled) return;

        if (follow?.isCorporate) {
          setStatus({
            loading: false,
            isConnected: false,
            pendingOutgoing: false,
            pendingIncoming: false,
            incomingRequestId: null,
            outgoingRequestId: null,
            unavailable: false,
            isCorporate: true,
            viewerIsCorporate: Boolean(follow.viewerIsCorporate),
            isFollowing: Boolean(follow.isFollowing),
            canFollow: Boolean(follow.canFollow),
            followerCount: Number(follow.followerCount) || 0,
          });
          return;
        }

        const data = await connectionsApi.getConnectionStatus(normalizedUserId);
        if (cancelled) return;
        setStatus({
          loading: false,
          isConnected: Boolean(data?.isConnected),
          pendingOutgoing: Boolean(data?.pendingOutgoing),
          pendingIncoming: Boolean(data?.pendingIncoming),
          incomingRequestId: data?.incomingRequestId || null,
          outgoingRequestId: data?.outgoingRequestId || null,
          unavailable: false,
          isCorporate: false,
          viewerIsCorporate: Boolean(data?.viewerIsCorporate) || viewerIsCorporate,
          isFollowing: false,
          canFollow: false,
          followerCount: 0,
        });
      } catch (error) {
        if (!cancelled) {
          const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            '';
          const unavailable =
            error?.response?.status === 404 &&
            /user not found/i.test(message);
          setStatus({
            loading: false,
            isConnected: false,
            pendingOutgoing: false,
            pendingIncoming: false,
            incomingRequestId: null,
            outgoingRequestId: null,
            unavailable,
            isCorporate: false,
            viewerIsCorporate,
            isFollowing: false,
            canFollow: false,
            followerCount: 0,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [normalizedUserId, viewerIsCorporate]);

  const sendRequest = useCallback(async () => {
    if (!normalizedUserId || sending) return;
    if (status.viewerIsCorporate) {
      toast.info(
        "Corporate pages don't connect or follow others. Others can follow you.",
      );
      return;
    }

    setSending(true);
    try {
      if (status.isCorporate) {
        if (status.isFollowing) {
          await followsApi.unfollowUser(normalizedUserId);
          toast.success(
            displayName ? `Unfollowed ${displayName}` : 'Unfollowed',
          );
          setStatus((prev) => ({
            ...prev,
            isFollowing: false,
            followerCount: Math.max(0, (prev.followerCount || 1) - 1),
          }));
        } else {
          const result = await followsApi.followUser(normalizedUserId);
          toast.success(
            displayName
              ? `You are now following ${displayName}`
              : 'You are now following this page',
          );
          setStatus((prev) => ({
            ...prev,
            isFollowing: true,
            followerCount:
              typeof result?.followerCount === 'number'
                ? result.followerCount
                : (prev.followerCount || 0) + 1,
          }));
        }
        return;
      }

      const result = await connectionsApi.sendConnectionRequest(normalizedUserId);
      if (result?.connected) {
        toast.success(
          displayName
            ? `You are now connected with ${displayName}`
            : 'You are now connected',
        );
        setStatus((prev) => ({
          ...prev,
          isConnected: true,
          pendingOutgoing: false,
          pendingIncoming: false,
          incomingRequestId: null,
          outgoingRequestId: null,
          unavailable: false,
        }));
      } else {
        toast.success(
          displayName
            ? `Connection request sent to ${displayName}`
            : 'Connection request sent',
        );
        setStatus((prev) => ({
          ...prev,
          pendingOutgoing: true,
          outgoingRequestId: result?.requestId || prev.outgoingRequestId,
          unavailable: false,
        }));
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (status.isCorporate
          ? 'Failed to update follow'
          : 'Failed to send connection request');
      if (error?.response?.status === 404 && /user not found/i.test(message)) {
        setStatus((prev) => ({ ...prev, unavailable: true }));
        toast.error('This profile cannot receive connections yet.');
      } else {
        toast.error(message);
      }
    } finally {
      setSending(false);
    }
  }, [
    normalizedUserId,
    displayName,
    sending,
    status.isCorporate,
    status.isFollowing,
    status.viewerIsCorporate,
  ]);

  const acceptRequest = useCallback(async () => {
    if (!normalizedUserId || sending || status.isCorporate) return false;

    setSending(true);
    try {
      if (status.incomingRequestId) {
        await connectionsApi.acceptConnectionRequest(status.incomingRequestId);
      } else {
        await connectionsApi.acceptConnectionRequestFromUser(normalizedUserId);
      }
      toast.success(
        displayName
          ? `You are now connected with ${displayName}`
          : 'Connection request accepted',
      );
      setStatus((prev) => ({
        ...prev,
        isConnected: true,
        pendingOutgoing: false,
        pendingIncoming: false,
        incomingRequestId: null,
        outgoingRequestId: null,
        unavailable: false,
      }));
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to accept connection request',
      );
      return false;
    } finally {
      setSending(false);
    }
  }, [
    normalizedUserId,
    status.incomingRequestId,
    status.isCorporate,
    displayName,
    sending,
  ]);

  const hideNetworkCta = Boolean(status.viewerIsCorporate);

  const connectLabel = !normalizedUserId
    ? 'No account'
    : status.loading
      ? status.isCorporate
        ? 'Follow'
        : 'Connect'
      : hideNetworkCta
        ? 'Companies use Follow'
        : status.isCorporate
          ? status.isFollowing
            ? 'Following'
            : status.unavailable
              ? 'Unavailable'
              : 'Follow'
          : status.isConnected
            ? 'Connected'
            : status.pendingOutgoing
              ? 'Pending'
              : status.pendingIncoming
                ? 'Accept'
                : status.unavailable
                  ? 'Unavailable'
                  : 'Connect';

  const connectDisabled =
    !normalizedUserId ||
    status.loading ||
    sending ||
    hideNetworkCta ||
    status.unavailable ||
    (status.isCorporate
      ? !status.canFollow && !status.isFollowing
      : status.isConnected || status.pendingOutgoing);

  return {
    sendRequest,
    acceptRequest,
    connectLabel,
    connectDisabled,
    sending,
    status,
  };
}

export default useCandidateConnect;
