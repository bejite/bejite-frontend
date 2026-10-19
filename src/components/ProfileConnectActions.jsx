import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaComment } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCandidateConnect } from '../hooks/useCandidateConnect';
import messagingService from '../services/messagingService';
import { getUser } from '../utils/tokenManager';

export default function ProfileConnectActions({ userId, displayName }) {
  const navigate = useNavigate();
  const currentUser = getUser();
  const normalizedUserId =
    userId != null && userId !== '' ? String(userId) : null;
  const isSelf =
    normalizedUserId &&
    currentUser?.id != null &&
    String(currentUser.id) === normalizedUserId;

  const { sendRequest, acceptRequest, connectLabel, connectDisabled, status, sending } =
    useCandidateConnect(normalizedUserId, displayName);
  const [messaging, setMessaging] = useState(false);

  if (!normalizedUserId || isSelf) return null;

  const isStatusLoading = Boolean(status.loading);
  const showConnectSpinner = isStatusLoading || sending;
  const hideConnectButton = Boolean(status.viewerIsCorporate);
  const isFollowingState = Boolean(status.isCorporate && status.isFollowing);
  const isConnectedState = Boolean(!status.isCorporate && status.isConnected);
  const isPendingState = Boolean(status.pendingOutgoing);
  /** Active/settled network states use outline styling so they don't look like Follow/Connect. */
  const isSettledNetworkState =
    isFollowingState || isConnectedState || isPendingState;

  const handleConnect = async () => {
    if (hideConnectButton || isStatusLoading || sending) return;
    if (status.pendingIncoming) {
      await acceptRequest();
      return;
    }
    // Following stays clickable (unfollow). Connected/Pending stay gated by connectDisabled.
    if (isFollowingState || !connectDisabled) {
      sendRequest();
    }
  };

  const handleMessage = async () => {
    if (messaging) return;
    try {
      setMessaging(true);
      const conversation = await messagingService.startConversation(normalizedUserId);
      navigate('/chats', {
        state: { openConversationId: conversation?.id },
      });
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Could not start conversation';
      toast.error(msg);
    } finally {
      setMessaging(false);
    }
  };

  const connectButtonClass = isStatusLoading
    ? 'bg-[#16730F]/80 text-white cursor-wait border-2 border-transparent'
    : isSettledNetworkState
      ? 'bg-white text-[#16730F] border-2 border-[#16730F] hover:bg-[#16730F]/10'
      : connectDisabled
        ? 'bg-gray-400 text-white cursor-not-allowed border-2 border-transparent'
        : 'bg-[#16730F] text-white border-2 border-transparent hover:bg-[#145a0c]';

  return (
    <div
      className={`mt-4 grid gap-2 sm:gap-3 w-full max-w-lg mx-auto sm:mx-0 min-w-0 ${
        hideConnectButton
          ? 'grid-cols-1'
          : 'grid-cols-1 min-[420px]:grid-cols-2'
      }`}
    >
      {!hideConnectButton && (
        <button
          type="button"
          onClick={handleConnect}
          disabled={
            isStatusLoading ||
            (!isFollowingState && connectDisabled)
          }
          aria-busy={showConnectSpinner}
          aria-pressed={isFollowingState || isConnectedState}
          className={`inline-flex w-full min-h-[44px] items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${connectButtonClass}`}
        >
          {showConnectSpinner ? (
            <span
              className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-t-transparent ${
                isSettledNetworkState ? 'border-[#16730F]' : 'border-white'
              }`}
              aria-hidden="true"
            />
          ) : (
            <>
              {isFollowingState || isConnectedState ? (
                <FaUserCheck className="shrink-0" />
              ) : (
                <FaUserPlus className="shrink-0" />
              )}
              <span className="truncate">{connectLabel}</span>
            </>
          )}
          {showConnectSpinner && (
            <span className="sr-only">Loading connection status</span>
          )}
        </button>
      )}
      <button
        type="button"
        onClick={handleMessage}
        disabled={messaging}
        aria-busy={messaging}
        className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-sm font-semibold text-[#16730F] border-2 border-[#16730F] bg-white hover:bg-[#16730F]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {messaging ? (
          <span
            className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#16730F] border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          <FaComment className="shrink-0" />
        )}
        <span>Message</span>
      </button>
    </div>
  );
}
