import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaComment } from 'react-icons/fa';
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

  const { sendRequest, connectLabel, connectDisabled, status } = useCandidateConnect(
    normalizedUserId,
    displayName,
  );
  const [messaging, setMessaging] = useState(false);

  if (!normalizedUserId || isSelf) return null;

  const handleConnect = () => {
    if (status.pendingIncoming) {
      navigate('/connection');
      return;
    }
    if (!connectDisabled) {
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

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mt-4 w-full max-w-md sm:max-w-none mx-auto sm:mx-0">
      <button
        type="button"
        onClick={handleConnect}
        disabled={connectDisabled}
        className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-colors ${
          connectDisabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#16730F] hover:bg-[#145a0c]'
        }`}
      >
        <FaUserPlus className="shrink-0" />
        <span className="truncate">{connectLabel}</span>
      </button>
      <button
        type="button"
        onClick={handleMessage}
        disabled={messaging}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-full text-sm font-semibold text-[#16730F] border-2 border-[#16730F] bg-white hover:bg-[#16730F]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaComment className="shrink-0" />
        {messaging ? 'Opening...' : 'Message'}
      </button>
    </div>
  );
}
