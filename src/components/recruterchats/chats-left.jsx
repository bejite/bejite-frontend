import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { FaSearch, FaTrash } from 'react-icons/fa';
import messagingService from '../../services/messagingService';
import { API_URL } from '../../config';
import { formatConversationPreview } from '../../utils/conversationPreview';
import { formatDisplayPersonName } from '../../utils/personDisplayName';
import DisplayNameWithBadge from '../DisplayNameWithBadge';
import { CHAT_CONVERSATION_UPDATED } from '../../utils/headerBadgeEvents';

const CONVERSATION_UPDATED = CHAT_CONVERSATION_UPDATED;
const PAGE_SIZE = 20;
let persistedListScrollTop = 0;

function mergeFirstPage(previous, firstPage) {
  const firstIds = new Set(firstPage.map((c) => String(c.id)));
  const oldest = firstPage[firstPage.length - 1];
  const oldestTime = oldest
    ? new Date(oldest.last_message_at || oldest.created_at || 0).getTime()
    : 0;

  const older = previous.filter((c) => {
    if (firstIds.has(String(c.id))) return false;
    const t = new Date(c.last_message_at || c.created_at || 0).getTime();
    return t < oldestTime;
  });

  return [...firstPage, ...older];
}

function ChatsLeft({ onSelectChat, selectedChat, onConversationHidden, isVisible = true }) {
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [hidingId, setHidingId] = useState(null);

  const listRef = useRef(null);
  const sentinelRef = useRef(null);
  const nextCursorRef = useRef(null);
  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const hiddenIdsRef = useRef(new Set());

  const applyPage = useCallback((page, { reset, silent } = {}) => {
    for (const c of page.conversations || []) {
      hiddenIdsRef.current.delete(String(c.id));
    }
    const incoming = page.conversations || [];

    nextCursorRef.current = page.nextCursor || null;
    hasMoreRef.current = Boolean(page.hasMore);
    setHasMore(Boolean(page.hasMore));

    setConversations((prev) => {
      if (reset) return mergeFirstPage(silent ? prev : [], incoming);
      const seen = new Set(prev.map((c) => String(c.id)));
      return [...prev, ...incoming.filter((c) => !seen.has(String(c.id)))];
    });
  }, []);

  const fetchFirstPage = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const page = await messagingService.getConversations({ limit: PAGE_SIZE });
      applyPage(page, { reset: true, silent });
      if (!silent) setError(null);
    } catch (err) {
      if (!silent) setError('Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [applyPage]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingMoreRef.current || !nextCursorRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await messagingService.getConversations({
        limit: PAGE_SIZE,
        cursor: nextCursorRef.current,
      });
      applyPage(page, { reset: false });
    } catch (err) {
      console.error('Error loading more conversations:', err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [applyPage]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  useLayoutEffect(() => {
    if (isVisible === false) {
      const el = listRef.current;
      if (el) persistedListScrollTop = el.scrollTop;
      return undefined;
    }
    const el = listRef.current;
    if (!el || loading) return undefined;
    el.scrollTop = persistedListScrollTop;
    return undefined;
  }, [isVisible, loading, conversations.length]);

  useEffect(() => {
    const onUpdate = () => fetchFirstPage(true);
    window.addEventListener(CONVERSATION_UPDATED, onUpdate);
    const interval = setInterval(() => fetchFirstPage(true), 12000);
    return () => {
      window.removeEventListener(CONVERSATION_UPDATED, onUpdate);
      clearInterval(interval);
    };
  }, [fetchFirstPage]);

  useEffect(() => {
    if (searchTerm.trim()) {
      handleUserSearch(searchTerm);
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const root = listRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || loading || isSearching || isVisible === false) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root, rootMargin: '96px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, isSearching, isVisible, hasMore, conversations.length, loadMore]);

  const handleUserSearch = async (query) => {
    if (!query.trim()) return;

    try {
      setSearchLoading(true);
      const users = await messagingService.searchUsers(query);
      setSearchResults(users || []);
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    try {
      const conversation = await messagingService.startConversation(String(user.id));
      hiddenIdsRef.current.delete(String(conversation.id));
      const page = await messagingService.getConversations({ limit: PAGE_SIZE });
      applyPage(page, { reset: true });

      const fullConversation = (page.conversations || []).find((c) => c.id === conversation.id)
        || await messagingService.getConversation(conversation.id).catch(() => null);

      onSelectChat(fullConversation || { ...conversation, other_user: user });

      setSearchTerm('');
      setIsSearching(false);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(`Failed to start conversation: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleHideConversation = async (event, conversation) => {
    event.stopPropagation();
    const id = String(conversation.id);
    const name = formatDisplayPersonName(conversation.other_user, 'this chat');
    const confirmed = window.confirm(
      `Remove ${name} from your chat list? Messages are kept and will reappear if you message each other again.`,
    );
    if (!confirmed) return;

    try {
      setHidingId(id);
      await messagingService.hideConversation(id);
      hiddenIdsRef.current.add(id);
      setConversations((prev) => prev.filter((c) => String(c.id) !== id));
      onConversationHidden?.(id);
    } catch (err) {
      console.error('Error hiding conversation:', err);
      setError(err.response?.data?.error || 'Failed to remove conversation');
    } finally {
      setHidingId(null);
    }
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

  const Avatar = ({ imageUrl, firstName, lastName, alt, sizeClass = 'w-12 h-12' }) => (
    imageUrl ? (
      <img
        src={imageUrl}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    ) : (
      <div className={`${sizeClass} rounded-full bg-[#556B1F] text-white font-semibold flex items-center justify-center shrink-0`}>
        {getInitials(firstName, lastName)}
      </div>
    )
  );

  return (
    <div className="bg-[#1A3E32] h-full flex flex-col overflow-hidden">
      <div className="p-3 sm:p-4 shrink-0">
        <div className="flex items-center bg-white rounded-full px-3 py-2 shadow-inner">
          <input
            className="w-full outline-none bg-transparent text-sm placeholder-gray-500 text-gray-800"
            placeholder="Search users to start a conversation"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 ml-2 shrink-0"></div>
          ) : (
            <FaSearch className="text-gray-500 ml-2 shrink-0" />
          )}
        </div>
      </div>

      <div
        ref={listRef}
        onScroll={() => {
          if (listRef.current) persistedListScrollTop = listRef.current.scrollTop;
        }}
        className="flex-1 overflow-y-auto overscroll-y-contain nfl-sidebar-scroll border-t border-[#556B1F]/60"
      >
        <div className="p-2 space-y-1">
          {loading && conversations.length === 0 && !isSearching ? (
            <div className="text-center text-white/70 py-6 text-sm">
              Loading conversations...
            </div>
          ) : error ? (
            <div className="text-center text-red-300 py-6 text-sm px-2">
              {error}
            </div>
          ) : isSearching ? (
            searchResults.length === 0 ? (
              <div className="text-center text-white/70 py-6 text-sm">
                {searchLoading ? 'Searching...' : 'No users found'}
              </div>
            ) : (
              searchResults.map((user) => {
                const displayName = formatDisplayPersonName(user, 'Unknown User');
                const profileImageRaw = user.profilePictureUrl || user.profilePhoto || user.profile_photo || '';
                const profileImage = getProfileImageUrl(profileImageRaw);

                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#556B1F]/30 cursor-pointer transition-colors w-full overflow-hidden"
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        imageUrl={profileImage}
                        firstName={user.firstName}
                        lastName={user.lastName}
                        alt={displayName}
                      />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-1 gap-2 w-full min-w-0 overflow-hidden">
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <DisplayNameWithBadge
                            user={user}
                            fallback={displayName}
                            badgeSize="xs"
                            badgePlacement="below"
                            className="items-start w-full min-w-0 overflow-hidden"
                            nameClassName="text-white text-sm font-medium truncate block w-full max-w-full"
                          />
                        </div>
                      </div>
                      <p className="text-white/70 text-xs truncate w-full max-w-full">
                        {user.jobTitle || 'Click to start conversation'}
                      </p>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            conversations.length === 0 ? (
              <div className="text-center text-white/70 py-6 text-xs sm:text-sm px-4">
                No conversations yet. Search for users above to start chatting!
              </div>
            ) : (
              <>
                {conversations.map((conversation) => {
                  const otherUser = conversation.other_user;
                  const displayName = formatDisplayPersonName(otherUser, 'Unknown User');
                  const profileImageRaw = otherUser?.profilePictureUrl || otherUser?.profilePhoto || otherUser?.profile_photo || '';
                  const profileImage = getProfileImageUrl(profileImageRaw);
                  const lastMessageTime = conversation.last_message_at ?
                    new Date(conversation.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                    '';
                  const unreadCount = conversation.unread_count || 0;
                  const isSelected = selectedChat && String(selectedChat.id) === String(conversation.id);
                  const isHiding = hidingId === String(conversation.id);

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => onSelectChat(conversation)}
                      className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150 w-full overflow-hidden ${
                        isSelected
                          ? 'bg-[#556B1F]/40 ring-1 ring-white/20'
                          : unreadCount > 0
                          ? 'bg-[#556B1F]/20 hover:bg-[#556B1F]/30'
                          : 'hover:bg-[#556B1F]/20'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar
                          imageUrl={profileImage}
                          firstName={otherUser?.firstName}
                          lastName={otherUser?.lastName}
                          alt={displayName}
                        />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] rounded-full h-4 font-extrabold w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-md ring-2 ring-[#1A3E32]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-2 mb-1 w-full min-w-0 overflow-hidden">
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <DisplayNameWithBadge
                              user={otherUser}
                              fallback={displayName}
                              badgeSize="xs"
                              badgePlacement="below"
                              className="items-start w-full min-w-0 overflow-hidden"
                              nameClassName={`text-sm truncate block w-full max-w-full ${unreadCount > 0 ? 'text-white font-bold' : 'text-white/95 font-medium'}`}
                            />
                          </div>
                          <span className={`text-[11px] shrink-0 whitespace-nowrap pl-1 ${unreadCount > 0 ? 'text-emerald-300 font-semibold' : 'text-white/60'}`}>
                            {lastMessageTime}
                          </span>
                        </div>
                        <p className={`text-xs truncate w-full max-w-full ${unreadCount > 0 ? 'text-white font-medium' : 'text-white/70'}`}>
                          {formatConversationPreview(conversation)}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove conversation with ${displayName}`}
                        disabled={isHiding}
                        onClick={(event) => handleHideConversation(event, conversation)}
                        className="shrink-0 p-2 rounded-full text-white/50 hover:text-red-300 hover:bg-black/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-40"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  );
                })}
                <div ref={sentinelRef} className="h-4" />
                {loadingMore && (
                  <div className="text-center text-white/60 py-3 text-xs">
                    Loading older conversations...
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatsLeft;
