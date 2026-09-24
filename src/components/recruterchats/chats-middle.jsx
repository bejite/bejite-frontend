import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FaArrowLeft, /* FaPhone, FaVideo, */ FaBars } from 'react-icons/fa';
import { toast } from 'react-toastify';
import messagingService from '../../services/messagingService';
import { API_URL } from '../../config';
import ChatMessageInput from '../chat/ChatMessageInput';
import ChatMessageBubble from '../chat/ChatMessageBubble';
import ChatDaySeparator from '../chat/ChatDaySeparator';
import { formatChatDayLabel, formatChatMessageTime, groupMessagesByDay } from '../../utils/chatTimeUtils';
import { formatDisplayPersonName } from '../../utils/personDisplayName';
import { toQuotePreview } from '../../utils/chatQuote';
import { notifyChatConversationUpdated } from '../../utils/headerBadgeEvents';

function messagesFingerprint(msgs) {
  return (msgs || [])
    .map(
      (msg) =>
        `${msg.id}:${msg.updated_at || ''}:${msg.is_deleted ? 1 : 0}:${msg.content || ''}:${msg.reply_to_message_id || ''}:${msg.reply_to?.is_deleted ? 1 : 0}`,
    )
    .join('|');
}

function escapeMessageId(messageId) {
  const value = String(messageId);
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function ChatsMiddle({ selectedChat, onShowChatList, onShowChatInfo }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const programmaticScrollRef = useRef(false);

  const isNearBottom = useCallback((threshold = 96) => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold
    );
  }, []);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Jump the messages pane instantly. Do not use scrollIntoView (it scrolls
    // the page on mobile) or CSS smooth scrolling (that animates from the top).
    programmaticScrollRef.current = true;
    container.scrollTop = container.scrollHeight;
  }, []);

  const handleMessagesScroll = () => {
    if (programmaticScrollRef.current) {
      programmaticScrollRef.current = false;
      stickToBottomRef.current = true;
      return;
    }
    stickToBottomRef.current = isNearBottom();
  };

  useEffect(() => {
    if (!selectedChat?.id) {
      setMessages([]);
      return;
    }

    stickToBottomRef.current = true;
    setMessages([]);
    setEditingMessageId(null);
    setReplyTo(null);
    fetchMessages(selectedChat.id);
    messagingService.markConversationRead(selectedChat.id).catch((err) => {
      console.error('Error marking conversation as read:', err);
    });
  }, [selectedChat?.id]);

  useEffect(() => {
    if (!selectedChat?.id || isRecordingVoice) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchMessages(selectedChat.id, true); // silent fetch
    }, 5000); // poll every 5 seconds

    return () => clearInterval(interval);
  }, [selectedChat?.id, isRecordingVoice]);

  useLayoutEffect(() => {
    if (!messages.length || loading) return;
    if (!stickToBottomRef.current) return;
    scrollToBottom();
  }, [messages, loading, selectedChat?.id, scrollToBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !messages.length || loading) return undefined;

    const pinIfNeeded = () => {
      if (stickToBottomRef.current) scrollToBottom();
    };

    const observer = new ResizeObserver(pinIfNeeded);
    const inner = container.firstElementChild;
    if (inner) observer.observe(inner);

    return () => observer.disconnect();
  }, [messages, loading, selectedChat?.id, scrollToBottom]);

  const fetchMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await messagingService.getMessages(conversationId);
      const next = (data || []).reverse();
      setMessages((prev) => {
        if (messagesFingerprint(prev) === messagesFingerprint(next)) {
          return prev;
        }
        return next;
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat?.id || sending) return;

    try {
      setSending(true);
      stickToBottomRef.current = true;
      await messagingService.sendMessage(
        selectedChat.id,
        message.trim(),
        null,
        null,
        replyTo?.id || null,
      );
      setMessage('');
      setReplyTo(null);
      await fetchMessages(selectedChat.id, true);
      notifyChatConversationUpdated();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Failed to send message',
      );
    } finally {
      setSending(false);
    }
  };

  const handleSendAttachment = async (url, caption = '', attachment = null) => {
    if (!selectedChat?.id || sending) {
      return;
    }

    try {
      setSending(true);
      stickToBottomRef.current = true;
      await messagingService.sendMessage(
        selectedChat.id,
        caption,
        url,
        attachment,
        replyTo?.id || null,
      );
      setMessage('');
      setReplyTo(null);
      await fetchMessages(selectedChat.id, true);
      notifyChatConversationUpdated();
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to send attachment';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId, content) => {
    if (!messageId || !content.trim() || savingEdit) return;

    try {
      setSavingEdit(true);
      await messagingService.editMessage(messageId, content.trim());
      setEditingMessageId(null);
      await fetchMessages(selectedChat.id, true);
      notifyChatConversationUpdated();
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to edit message';
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;
    if (!window.confirm('Delete this message?')) return;

    try {
      await messagingService.deleteMessage(messageId);
      if (editingMessageId === messageId) {
        setEditingMessageId(null);
      }
      if (replyTo?.id === messageId) {
        setReplyTo(null);
      }
      await fetchMessages(selectedChat.id, true);
      notifyChatConversationUpdated();
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to delete message';
      toast.error(msg);
    }
  };

  const handleStartReply = (msg) => {
    setEditingMessageId(null);
    setReplyTo(toQuotePreview(msg));
  };

  const handleQuoteClick = (messageId) => {
    const container = messagesContainerRef.current;
    if (!container || !messageId) return;
    const target = container.querySelector(
      `[data-message-id="${escapeMessageId(messageId)}"]`,
    );
    if (!target) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    container.scrollTop += targetRect.top - containerRect.top - 16;
    stickToBottomRef.current = isNearBottom();
  };

  const messageIds = useMemo(
    () => new Set(messages.map((msg) => String(msg.id))),
    [messages],
  );

  const messageDays = useMemo(() => groupMessagesByDay(messages), [messages]);

  const isOwnMessage = (msg) => {
    const currentUserId =
      currentUser?.id ||
      currentUser?.user_id ||
      currentUser?.userId ||
      currentUser?.sub ||
      currentUser?.authId;

    const selectedOtherUserId =
      selectedChat?.other_user?.id ||
      selectedChat?.other_user?.user_id ||
      selectedChat?.otherUserId;

    const messageSenderId =
      msg.sender_id || msg.user_id || msg.sender?.id || msg.senderId;

    if (currentUserId != null && messageSenderId != null) {
      return String(messageSenderId) === String(currentUserId);
    }
    if (selectedOtherUserId != null && messageSenderId != null) {
      return String(messageSenderId) !== String(selectedOtherUserId);
    }

    return (
      `${msg.firstName || msg.first_name || ''} ${msg.lastName || msg.last_name || ''}`.trim() ===
      `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()
    );
  };

  const getInitials = (firstName, lastName) => {
    const first = (firstName || '').trim().charAt(0).toUpperCase();
    const last = (lastName || '').trim().charAt(0).toUpperCase();
    return `${first}${last}` || 'U';
  };

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) {
      const baseUrl = API_URL || 'http://localhost:3001';
      return `${baseUrl}${imagePath}`;
    }
    return `${API_URL || 'http://localhost:3001'}${imagePath}`;
  };

  const selectedFirstName = selectedChat?.other_user?.firstName || '';
  const selectedLastName = selectedChat?.other_user?.lastName || '';
  const selectedFullName = formatDisplayPersonName(
    { firstName: selectedFirstName, lastName: selectedLastName },
    'Chat',
  );
  const selectedProfileImageRaw = selectedChat?.other_user?.profilePictureUrl || selectedChat?.other_user?.profilePhoto || '';
  const selectedProfileImage = getProfileImageUrl(selectedProfileImageRaw);

  if (!selectedChat) {
    return (
      <main className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-gray-100 items-center justify-center">
        <p className="text-[#16730F] text-sm md:text-base">Select a conversation to start chatting</p>
      </main>
    );
  }

  return (
    <main className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-gray-100">
      {/* Header */}
      <div className="bg-gray-200 shrink-0 flex items-center justify-between gap-2 px-3 py-3 sm:px-4 md:py-4 border-b border-gray-300">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <button
            onClick={onShowChatList}
            className="md:hidden shrink-0 text-gray-600 hover:text-gray-800 transition-colors p-1"
            aria-label="Back to conversations"
          >
            <FaArrowLeft />
          </button>
          {selectedProfileImage ? (
            <img
              src={selectedProfileImage}
              alt={selectedFullName}
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#556B1F] text-white text-xs sm:text-sm font-semibold flex items-center justify-center shrink-0">
              {getInitials(selectedFirstName, selectedLastName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base md:text-xl font-semibold text-[#16730F] truncate" title={selectedFullName}>
              {selectedFullName}
            </h1>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* <button className="bg-[#16730F] text-white p-2 rounded-full hover:bg-[#1a5c13] transition shadow-sm" title="Call">
            <FaPhone className="text-xs sm:text-sm" />
          </button>
          <button className="bg-[#16730F] text-white p-2 rounded-full hover:bg-[#1a5c13] transition shadow-sm" title="Video call">
            <FaVideo className="text-xs sm:text-sm" />
          </button> */}
          <button 
            onClick={onShowChatInfo}
            className="lg:hidden text-gray-600 hover:text-gray-800 transition-colors p-1.5 ml-1"
            aria-label="Toggle user details"
            title="View info"
          >
            <FaBars className="text-base" />
          </button>
        </div>
      </div>

  {/* Messages Area */}
  <div
    ref={messagesContainerRef}
    onScroll={handleMessagesScroll}
    data-chat-messages
    className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain nfl-scroll [overflow-anchor:none] p-3 md:p-5 bg-[#F7F7F7]"
  >
    {loading ? (
      <div className="text-center text-[#16730F] py-2 md:py-4">
        Loading messages...
      </div>
    ) : messages.length === 0 ? (
      <div className="text-center text-[#16730F] py-4 md:py-8">
        <p className="text-sm md:text-lg font-medium mb-2">No messages yet</p>
        <p className="text-xs md:text-sm">Start a conversation by sending a message.</p>
      </div>
    ) : (
      /* Messages Display */
      <div className="px-1 md:px-2">
        {messageDays.map((day) => (
          <section key={day.dayKey} className="relative">
            <ChatDaySeparator
              label={formatChatDayLabel(day.messages[0]?.created_at)}
            />
            {day.messages.map((msg) => {
          const senderName = formatDisplayPersonName(
            {
              firstName: msg.firstName ?? msg.first_name,
              lastName: msg.lastName ?? msg.last_name,
            },
            'User',
          );
          const messageTime = formatChatMessageTime(msg.created_at);
          const ownMessage = isOwnMessage(msg);
          const senderAvatar = getProfileImageUrl(
            msg.profilePictureUrl ||
              msg.profile_photo ||
              (!ownMessage
                ? selectedChat?.other_user?.profilePictureUrl ||
                  selectedChat?.other_user?.profilePhoto
                : null),
          );
          const senderInitials = getInitials(
            msg.firstName ?? msg.first_name,
            msg.lastName ?? msg.last_name,
          );

          return (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={ownMessage}
                senderName={senderName}
                senderHasVerifiedBadge={Boolean(msg.hasVerifiedBadge)}
                senderBadgeUser={
                  ownMessage
                    ? currentUser
                    : selectedChat?.other_user
                }
                senderAvatar={senderAvatar}
                senderInitials={senderInitials}
                messageTime={messageTime}
                editing={editingMessageId === msg.id}
                saving={savingEdit && editingMessageId === msg.id}
                onStartEdit={() => setEditingMessageId(msg.id)}
                onCancelEdit={() => setEditingMessageId(null)}
                onSaveEdit={(content) => handleEditMessage(msg.id, content)}
                onDelete={() => handleDeleteMessage(msg.id)}
                onReply={() => handleStartReply(msg)}
                onQuoteClick={handleQuoteClick}
                canJumpToQuote={messageIds.has(String(msg.reply_to?.id))}
              />
          );
            })}
          </section>
        ))}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
    )}
  </div>

  {selectedChat?.id ? (
    <ChatMessageInput
      key={selectedChat.id}
      message={message}
      setMessage={setMessage}
      onSend={handleSendMessage}
      onSendAttachment={handleSendAttachment}
      onRecordingChange={setIsRecordingVoice}
      sending={sending}
      disabled={!selectedChat?.id}
      replyTo={replyTo}
      onCancelReply={() => setReplyTo(null)}
    />
  ) : (
    <div className="shrink-0 p-4 text-center text-sm text-gray-500">
      Select a conversation to send messages
    </div>
  )}
</main>
  );
}

export default ChatsMiddle;