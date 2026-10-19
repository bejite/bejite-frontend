import React from 'react';
import { getAuthorProfileImageUrl } from '../../utils/profileImageUtils';
import DisplayNameWithBadge from '../DisplayNameWithBadge';

const RequestCard = ({ request, type, onAccept, onReject, onCancel, onViewProfile }) => {
  const user = type === 'incoming' ? request.requester : request.recipient;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-xl min-w-0">
      <button
        type="button"
        onClick={() => onViewProfile?.(user?.id)}
        className="flex items-center gap-3 sm:gap-4 min-w-0 text-left hover:opacity-90 w-full sm:w-auto"
      >
        <img
          src={getAuthorProfileImageUrl(user)}
          alt={user?.name}
          className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[#1A3E32] text-sm sm:text-base truncate hover:text-[#16730F]">
            <DisplayNameWithBadge user={user} fallback={user?.name} badgeSize="xs" />
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.jobTitle || 'Professional'}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {type === 'incoming' ? 'Wants to connect' : 'Request sent'}
          </p>
        </div>
      </button>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
        {type === 'incoming' ? (
          <>
            <button
              type="button"
              onClick={() => onAccept(request.id, user?.name)}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-[#16730F] text-white rounded-lg hover:bg-[#145a0c] transition-colors text-sm font-medium"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => onReject(request.id, user?.name)}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              Decline
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onCancel(request.id, user?.name)}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200 sm:border-0"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestCard;