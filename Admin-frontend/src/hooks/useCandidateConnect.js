import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as connectionsApi from '../services/connectionsApi';

/**
 * Connection request state for a candidate (jobseeker User id).
 */
export function useCandidateConnect(userId, displayName = '') {
  const normalizedUserId =
    userId != null && userId !== '' ? String(userId) : null;

  const [status, setStatus] = useState({
    loading: Boolean(normalizedUserId),
    isConnected: false,
    pendingOutgoing: false,
    pendingIncoming: false,
    unavailable: false,
  });
  const [sending, setSending] = useState(false);

  const [prevUserId, setPrevUserId] = useState(normalizedUserId);

  if (normalizedUserId !== prevUserId) {
    setPrevUserId(normalizedUserId);
    setStatus({
      loading: Boolean(normalizedUserId),
      isConnected: false,
      pendingOutgoing: false,
      pendingIncoming: false,
      unavailable: false,
    });
  }

  useEffect(() => {
    if (!normalizedUserId) return;

    let cancelled = false;

    (async () => {
      setStatus((prev) => ({ ...prev, loading: true }));
      try {
        const data = await connectionsApi.getConnectionStatus(normalizedUserId);
        if (!cancelled) {
          setStatus({
            loading: false,
            isConnected: Boolean(data?.isConnected),
            pendingOutgoing: Boolean(data?.pendingOutgoing),
            pendingIncoming: Boolean(data?.pendingIncoming),
            unavailable: false,
          });
        }
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
            unavailable,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [normalizedUserId]);

  const sendRequest = useCallback(async () => {
    if (!normalizedUserId || sending) return;

    setSending(true);
    try {
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
          unavailable: false,
        }));
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to send connection request';
      if (error?.response?.status === 404 && /user not found/i.test(message)) {
        setStatus((prev) => ({ ...prev, unavailable: true }));
        toast.error('This profile cannot receive connections yet.');
      } else {
        toast.error(message);
      }
    } finally {
      setSending(false);
    }
  }, [normalizedUserId, displayName, sending]);

  const connectLabel = !normalizedUserId
    ? 'No account'
    : status.loading
      ? 'Connect'
      : status.isConnected
        ? 'Connected'
        : status.pendingOutgoing
          ? 'Pending'
          : status.pendingIncoming
            ? 'Respond in Connections'
            : status.unavailable
              ? 'Unavailable'
              : 'Connect';

  const connectDisabled =
    !normalizedUserId ||
    status.loading ||
    sending ||
    status.isConnected ||
    status.pendingOutgoing ||
    status.pendingIncoming ||
    status.unavailable;

  return {
    sendRequest,
    connectLabel,
    connectDisabled,
    sending,
    status,
  };
}

export default useCandidateConnect;
