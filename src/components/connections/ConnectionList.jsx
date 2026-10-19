import React from 'react';
import { FaUserFriends } from 'react-icons/fa';
import ConnectionCard from './ConnectionCard';

const ConnectionList = ({
  connections,
  onRemoveConnection,
  searchQuery,
  onViewProfile,
  totalCount,
  variant = 'connections',
  showRemoveButton = true,
}) => {
  // Ensure connections is an array
  const connectionsArray = Array.isArray(connections) ? connections : [];
  const filteredConnections = connectionsArray.filter(conn =>
    conn.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFollowers = variant === 'followers';

  if (filteredConnections.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-2">
        <FaUserFriends className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">
          {(totalCount ?? connections.length) === 0
            ? isFollowers
              ? 'No followers yet'
              : 'No connections yet'
            : isFollowers
              ? 'No followers found'
              : 'No connections found'}
        </h3>
        <p className="text-gray-500">
          {(totalCount ?? connections.length) === 0
            ? isFollowers
              ? 'People who follow your company page will appear here'
              : 'Start building your network by sending connection requests'
            : 'Try adjusting your search terms'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredConnections.map((connection) => (
        <ConnectionCard
          key={connection.id}
          user={connection}
          onViewProfile={onViewProfile}
          onRemove={
            showRemoveButton && onRemoveConnection
              ? () => onRemoveConnection(connection.id, connection.name)
              : undefined
          }
          showRemoveButton={Boolean(showRemoveButton && onRemoveConnection)}
        />
      ))}
    </div>
  );
};

export default ConnectionList;
