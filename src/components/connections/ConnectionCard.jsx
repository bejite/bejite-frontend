import React from 'react';
import { getAuthorProfileImageUrl } from '../../utils/profileImageUtils';
import DisplayNameWithBadge from '../DisplayNameWithBadge';

const ConnectionCard = ({ user, onRemove, onViewProfile, showRemoveButton = false }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-xl min-w-0">
    <button
      type="button"
      onClick={() => onViewProfile?.(user?.id)}
      className="flex items-center gap-3 sm:gap-4 min-w-0 text-left hover:opacity-90 w-full sm:w-auto"
    >
      <img
        src={getAuthorProfileImageUrl(user)}
        alt={user.name}
        className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[#1A3E32] text-sm sm:text-base truncate hover:text-[#16730F]">
          <DisplayNameWithBadge user={user} fallback={user.name} badgeSize="xs" />
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 truncate">
          {user.jobTitle || 'Professional'}
        </p>
      </div>
    </button>
    {showRemoveButton && (
      <button
        type="button"
        onClick={onRemove}
        className="w-full sm:w-auto shrink-0 px-4 py-2.5 min-h-[44px] text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200 sm:border-0"
      >
        Remove
      </button>
    )}
  </div>
);

export default ConnectionCard;