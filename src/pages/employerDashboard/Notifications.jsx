import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import NewsFeedHeader from '../../components/NewsFeedHeader'
import { API_URL } from '../../config'
import NewsFeedLayout from '../../components/layout/NewsFeedLayout'
import { getPostDetailPath } from '../../utils/postNavigation'
import FeedLoadMoreButton from '../../components/FeedLoadMoreButton'
import { markAllNotificationsRead, markNotificationRead } from '../../services/notificationService'
import { trackPartnerEventClick } from '../../services/verifiedBadgeApi'
import { getUser } from '../../utils/tokenManager'
import { getRecruiterIdUploadPath } from '../../utils/recruiterProfilePaths'
import { classifyNavigationTarget } from '../../utils/safeNavigate'

const NOTIFICATIONS_PAGE_SIZE = 20
const INVITATIONS_PAGE_SIZE = 50

const INVITATION_STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
]

const Notifications = () => {
  const navigate = useNavigate()
  const reduxUser = useSelector((state) => state.auth?.user)
  const user = useMemo(() => reduxUser || getUser() || {}, [reduxUser])
  const isRecruiter = ['recruiter', 'employer'].includes(
    String(user.role || '').toLowerCase(),
  )

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [invitations, setInvitations] = useState([])
  const [invitationsLoading, setInvitationsLoading] = useState(false)
  const [invitationsLoadingMore, setInvitationsLoadingMore] = useState(false)
  const [invitationsError, setInvitationsError] = useState('')
  const [invitationsHasMore, setInvitationsHasMore] = useState(false)
  const [invitationsPage, setInvitationsPage] = useState(1)
  const [invitationStatusFilter, setInvitationStatusFilter] = useState('all')
  const [showInvitations, setShowInvitations] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchInvitations = useCallback(async (pageNum = 1, append = false, statusFilter = invitationStatusFilter) => {
    try {
      if (append) {
        setInvitationsLoadingMore(true)
      } else {
        setInvitationsLoading(true)
      }
      setInvitationsError('')

      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('token')

      if (!token) {
        setInvitationsError('Please log in to view interview invitations')
        return
      }

      const endpoint = isRecruiter ? 'employer' : 'candidate'
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(INVITATIONS_PAGE_SIZE),
      })
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const response = await fetch(
        `${API_URL}/api/interview-invitations/${endpoint}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch interview invitations')
      }

      const nextInvitations = data.data || []
      setInvitations((prev) => (append ? [...prev, ...nextInvitations] : nextInvitations))

      const pagination = data.pagination
      setInvitationsHasMore(Boolean(pagination && pagination.page < pagination.pages))
      setInvitationsPage(pageNum)
    } catch (err) {
      console.error('Error fetching invitations:', err)
      setInvitationsError(err.message)
      if (!append) {
        setInvitations([])
      }
    } finally {
      setInvitationsLoading(false)
      setInvitationsLoadingMore(false)
    }
  }, [invitationStatusFilter, isRecruiter])

  useEffect(() => {
    if (!showInvitations) return
    fetchInvitations(1, false, invitationStatusFilter)
  }, [showInvitations, invitationStatusFilter, fetchInvitations])

  const pendingInvitationCount = useMemo(
    () => invitations.filter((invitation) => invitation.status === 'pending').length,
    [invitations],
  )

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('token')

      if (!token) {
        setError('Please log in to view notifications')
        return
      }

      const response = await fetch(
        `${API_URL}/api/notifications?page=${pageNum}&limit=${NOTIFICATIONS_PAGE_SIZE}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notifications')
      }

      const newNotifications = data.data || []
      setNotifications((prev) => (append ? [...prev, ...newNotifications] : newNotifications))

      const pagination = data.pagination
      setHasMore(Boolean(pagination && pagination.page < pagination.pages))
      setPage(pageNum)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreNotifications = () => {
    if (loadingMore || !hasMore) return
    fetchNotifications(page + 1, true)
  }

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId)

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  const handleNotificationClick = (notification) => {
    // Mark as read in the background so navigation is not delayed on mobile
    if (!notification.is_read) {
      void markAsRead(notification.id)
    }

    // Check if it's an interview invitation - try multiple approaches
    let invitationId = null;
    let parsedData = null;

    // Try parsing the data field
    if (notification.data) {
      try {
        parsedData = typeof notification.data === 'string'
          ? JSON.parse(notification.data)
          : notification.data;
        invitationId = parsedData?.invitation_id;
        console.log('Parsed data:', parsedData);
      } catch (e) {
        console.error('Error parsing notification data:', e);
      }
    }

    const partnerEventId =
      notification.entity_type === 'partner_event' && notification.entity_id
        ? String(notification.entity_id)
        : parsedData?.eventId != null
          ? String(parsedData.eventId)
          : null;

    if (partnerEventId) {
      void trackPartnerEventClick(partnerEventId).catch(() => {
        /* ignore analytics failures */
      });
    }

    // Connection posted — open news feed at the post
    if (notification.type === 'connection_post') {
      const postId = parsedData?.postId
      if (postId) {
        navigate(getPostDetailPath(postId))
        return
      }
      navigate('/news-feed')
      return
    }

    // Connection or platform job listing — open job vacancy page
    if (notification.type === 'connection_job' || notification.type === 'new_job') {
      const jobId = parsedData?.jobId
      if (jobId) {
        navigate(`/job-vacancy?jobId=${encodeURIComponent(jobId)}`)
        return
      }
      navigate('/job-vacancy')
      return
    }

    // Post engagement — open news feed at the post
    if (
      notification.type === 'post_liked' ||
      notification.type === 'post_commented' ||
      notification.type === 'post_shared' ||
      notification.type === 'post_saved' ||
      notification.type === 'mention'
    ) {
      const postId = parsedData?.postId
      if (postId) {
        navigate(getPostDetailPath(postId))
        return
      }
      navigate('/news-feed')
      return
    }

    if (notification.type === 'platform_announcement') {
      const url = parsedData?.url || notification.link
      if (url) {
        const target = classifyNavigationTarget(url)
        if (target.kind === 'external') {
          window.location.href = target.url
          return
        }
        if (target.kind === 'internal') {
          navigate(target.path)
          return
        }
      }
      return
    }

    // Connection request/accepted or new follower — open network page
    if (
      notification.type === 'connection_request' ||
      notification.type === 'connection_accepted' ||
      notification.type === 'user_followed'
    ) {
      navigate('/connection')
      return
    }

    if (notification.type === 'birthday') {
      navigate('/milestones')
      return
    }

    if (notification.type === 'birthday_wish') {
      const senderId = parsedData?.fromUserId || parsedData?.userId
      if (senderId) {
        navigate(`/user-profile/${senderId}`)
        return
      }
      navigate('/milestones')
      return
    }

    // New message — open the conversation in chats
    if (notification.type === 'new_message') {
      const conversationId =
        parsedData?.conversationId ||
        (notification.entity_type === 'conversation' ? notification.entity_id : null)
      if (conversationId) {
        navigate(`/chats?conversation=${encodeURIComponent(conversationId)}`)
        return
      }
      navigate('/chats')
      return
    }

    // If we found an invitation ID, show the modal
    if (invitationId) {
      setSelectedNotification({
        ...notification,
        data: parsedData || { invitation_id: invitationId }
      })
      return
    }

    // Also check if type is interview_invite and try to extract ID from message or other fields
    if (notification.type === 'interview_invite') {
      // Try to extract from message if data is not available
      const match = notification.message?.match(/ID[:\s]+(\d+)/i) ||
        notification.message?.match(/invitation[\s#]+(\d+)/i);
      if (match) {
        setSelectedNotification({
          ...notification,
          data: { invitation_id: match[1] }
        })
        return
      }

      // If still no ID, still show modal but without pre-filled data
      console.log('No invitation ID found, but showing modal anyway');
    }

    if (
      notification.type === 'badge_approved' ||
      notification.type === 'badge_rejected'
    ) {
      const url = parsedData?.url || notification.link
      if (url && String(url).startsWith('http')) {
        const path = String(url).replace(/^https?:\/\/[^/]+/, '') || '/notifications'
        navigate(path)
        return
      }
      if (url) {
        navigate(String(url))
        return
      }
      navigate(notification.type === 'badge_approved' ? '/badge-holder' : getRecruiterIdUploadPath(user))
    }
  }

  const handleAccept = async (invitationId) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/interview-invitations/${invitationId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      // Update notification in list
      setNotifications(prev =>
        prev.map(n => n.id === selectedNotification.id
          ? { ...n, type: 'invite_accepted', title: 'Invitation Accepted' }
          : n)
      )
      setSelectedNotification(null)
      alert('You have accepted the interview invitation!')
      fetchInvitations(1, false, invitationStatusFilter)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDecline = async (invitationId) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/interview-invitations/${invitationId}/decline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invitation')
      }

      // Update notification in list
      setNotifications(prev =>
        prev.map(n => n.id === selectedNotification.id
          ? { ...n, type: 'invite_declined', title: 'Invitation Declined' }
          : n)
      )
      setSelectedNotification(null)
      alert('You have declined the interview invitation.')
      fetchInvitations(1, false, invitationStatusFilter)
    } catch (err) {
      alert(err.message)
    }
  }

  const getInvitationStatusClasses = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatInvitationTime = (timeValue) => {
    if (!timeValue) return 'N/A'
    return new Date(`2000-01-01T${timeValue}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'interview_invite':
        return '📅'
      case 'invite_accepted':
        return '✅'
      case 'invite_declined':
        return '❌'
      case 'connection_post':
        return '📝'
      case 'connection_job':
      case 'new_job':
        return '💼'
      case 'post_liked':
        return '❤️'
      case 'post_commented':
        return '💬'
      case 'post_shared':
        return '🔁'
      case 'post_saved':
        return '🔖'
      case 'mention':
        return '🏷️'
      case 'platform_announcement':
        return '📢'
      case 'connection_request':
        return '🤝'
      case 'connection_accepted':
        return '✅'
      case 'user_followed':
        return '👤'
      case 'birthday':
      case 'birthday_wish':
        return '🎂'
      case 'badge_approved':
        return '✅'
      case 'badge_rejected':
        return '❌'
      default:
        return '🔔'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div>
        <NewsFeedHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16730F]"></div>
            <p className="text-[#16730F] mt-4">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 min-w-0 overflow-x-hidden">
        <div className="flex items-center justify-between gap-3 mb-4 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#16730F] truncate">
            Notifications
          </h1>
          {!showInvitations && notifications.some((n) => !n.is_read) && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="shrink-0 text-xs sm:text-sm font-medium text-[#16730F] hover:underline whitespace-nowrap"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Equal-width segmented control — short labels on narrow screens so recruiter copy doesn't overflow */}
        <div
          role="tablist"
          aria-label="Notification views"
          className="flex w-full gap-1.5 p-1 mb-5 rounded-xl bg-gray-200/80 min-w-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!showInvitations}
            onClick={() => setShowInvitations(false)}
            className={`flex-1 min-w-0 px-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
              !showInvitations
                ? 'bg-[#16730F] text-white shadow-sm'
                : 'text-gray-700 hover:bg-white/70'
            }`}
          >
            Notifications
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={showInvitations}
            onClick={() => setShowInvitations(true)}
            className={`flex-1 min-w-0 px-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${
              showInvitations
                ? 'bg-[#16730F] text-white shadow-sm'
                : 'text-gray-700 hover:bg-white/70'
            }`}
          >
            <span className="truncate">Invitations</span>
            {pendingInvitationCount > 0 && (
              <span
                className={`shrink-0 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  showInvitations
                    ? 'bg-white text-[#16730F]'
                    : 'bg-red-500 text-white'
                }`}
              >
                {pendingInvitationCount}
              </span>
            )}
          </button>
        </div>

          {/* Interview Invitations View */}
          {showInvitations ? (
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-1">
                {isRecruiter ? 'Invitations you sent' : 'Invitations you received'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">
                {isRecruiter
                  ? 'Track pending, accepted, declined, and expired invites.'
                  : 'View invites sent to you and respond to pending ones.'}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {INVITATION_STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setInvitationStatusFilter(filter.value)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      invitationStatusFilter === filter.value
                        ? 'bg-[#16730F] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {invitationsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm">
                  {invitationsError}
                </div>
              )}

              {invitationsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16730F]"></div>
                  <p className="text-[#16730F] mt-4">Loading interview invitations...</p>
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">📅</p>
                  <p className="text-gray-500 mt-2">
                    {invitationStatusFilter === 'all'
                      ? 'No interview invitations yet'
                      : `No ${invitationStatusFilter} interview invitations`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 min-w-0">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 min-w-0 overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <h3 className="font-medium text-[#16730F] text-sm sm:text-base break-words min-w-0 flex-1">
                          {invitation.job_title || 'Interview Invitation'}
                        </h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium shrink-0 ${getInvitationStatusClasses(invitation.status)}`}
                        >
                          {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                        {isRecruiter ? (
                          <>
                            To: {invitation.first_name} {invitation.last_name}
                            {invitation.candidate_title ? ` · ${invitation.candidate_title}` : ''}
                          </>
                        ) : (
                          <>
                            From: {invitation.employer_first_name}{' '}
                            {invitation.employer_last_name}
                            {invitation.company_name && ` (${invitation.company_name})`}
                          </>
                        )}
                      </p>
                      <div className="mt-2 text-xs sm:text-sm text-gray-500 space-y-0.5 break-words">
                        <p>
                          <strong>Date:</strong>{' '}
                          {new Date(invitation.interview_date).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Time:</strong>{' '}
                          {formatInvitationTime(invitation.interview_time)}
                        </p>
                        <p>
                          <strong>Type:</strong>{' '}
                          {invitation.interview_type === 'online'
                            ? 'Online (Video Call)'
                            : 'In-Person'}
                        </p>
                        {invitation.interview_type === 'online' &&
                          invitation.meeting_link && (
                            <p>
                              <strong>Link:</strong>{' '}
                              <a
                                href={invitation.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline break-all"
                              >
                                {invitation.meeting_link}
                              </a>
                            </p>
                          )}
                        {invitation.interview_type === 'offline' && invitation.venue && (
                          <p>
                            <strong>Venue:</strong> {invitation.venue}
                          </p>
                        )}
                        {invitation.message && (
                          <p className="mt-1">
                            <strong>Message:</strong> {invitation.message}
                          </p>
                        )}
                        {invitation.status === 'pending' && invitation.expires_at && (
                          <p className="mt-1 text-red-500">
                            Expires: {new Date(invitation.expires_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {!isRecruiter && invitation.status === 'pending' && (
                        <div className="flex gap-2 sm:gap-3 mt-3">
                          <button
                            type="button"
                            onClick={() => handleDecline(invitation.id)}
                            className="flex-1 py-2 px-3 border-2 border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAccept(invitation.id)}
                            className="flex-1 py-2 px-3 bg-[#16730F] text-white rounded-lg text-sm font-medium hover:bg-[#125a0c] transition-colors"
                          >
                            Accept
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <FeedLoadMoreButton
                    hasMore={invitationsHasMore}
                    loading={invitationsLoadingMore}
                    onLoadMore={() =>
                      fetchInvitations(
                        invitationsPage + 1,
                        true,
                        invitationStatusFilter,
                      )
                    }
                    label="Load more invitations"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Notifications View */
            <div className="min-w-0">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm">
                  {error}
                </div>
              )}

              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">🔔</p>
                  <p className="text-gray-500 mt-2">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3 min-w-0">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full min-w-0 text-left p-3 sm:p-4 rounded-lg cursor-pointer transition-colors select-none [-webkit-tap-highlight-color:transparent] touch-manipulation active:bg-gray-50 ${notification.is_read
                        ? 'bg-white border border-gray-200'
                        : 'bg-[#16730F]/5 border-l-4 border-[#16730F]'
                        }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-xl sm:text-2xl pointer-events-none shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#16730F] text-sm sm:text-base break-words">
                            {notification.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                            {notification.message}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-[#16730F] rounded-full shrink-0 mt-1.5"></span>
                        )}
                      </div>
                    </button>
                  ))}
                  <FeedLoadMoreButton
                    hasMore={hasMore}
                    loading={loadingMore}
                    onLoadMore={loadMoreNotifications}
                    label="Load more"
                  />
                </div>
              )}
            </div>
          )}
      </div>

        {/* Interview Invitation Modal */}
        {selectedNotification && selectedNotification.type === 'interview_invite' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto nfl-scroll scroll-smooth">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-[#16730F] mb-4">Interview Invitation</h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-600 mb-2 break-words">{selectedNotification.message}</p>
                  {selectedNotification.data?.interview_date && (
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Date:</strong> {new Date(selectedNotification.data.interview_date).toLocaleDateString()}
                    </p>
                  )}
                  {selectedNotification.data?.interview_time && (
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>Time:</strong> {selectedNotification.data.interview_time}
                    </p>
                  )}
                  {selectedNotification.data?.interview_type && (
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>Type:</strong> {selectedNotification.data.interview_type === 'online' ? 'Online' : 'In-Person'}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Expires: {selectedNotification.data?.expires_at ? new Date(selectedNotification.data.expires_at).toLocaleString() : '72 hours from now'}
                  </p>
                </div>

                {selectedNotification.data?.invitation_id ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDecline(selectedNotification.data.invitation_id)}
                      className="flex-1 py-3 px-4 border-2 border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(selectedNotification.data.invitation_id)}
                      className="flex-1 py-3 px-4 bg-[#16730F] text-white rounded-xl font-medium hover:bg-[#125a0c] transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-red-500 text-sm">
                    Unable to load invitation details. Please try again later.
                  </p>
                )}

                <button
                  onClick={() => setSelectedNotification(null)}
                  className="mt-3 w-full py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </NewsFeedLayout>
  )
}

export default Notifications
