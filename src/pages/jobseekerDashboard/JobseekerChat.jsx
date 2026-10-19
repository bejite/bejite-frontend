import React from 'react'
import { useState } from 'react'
import NewsFeedHeader from '../../components/NewsFeedHeader'
import ChatsRight from '../../components/recruterchats/chats-right'
import ChatsLeft from '../../components/recruterchats/chats-left'
import ChatsMiddle from '../../components/recruterchats/chats-middle'

function JobseekerChat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentView, setCurrentView] = useState('chatList'); // 'chatList', 'chatView', 'chatInfo'

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setCurrentView('chatView');
  };

  const handleConversationHidden = (conversationId) => {
    if (selectedChat && String(selectedChat.id) === String(conversationId)) {
      setSelectedChat(null);
      setCurrentView('chatList');
    }
  };

  const showChatList = () => {
    setCurrentView('chatList');
  };

  const showChatInfo = () => {
    setCurrentView('chatInfo');
  };

  const showChatView = () => {
    setCurrentView('chatView');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <NewsFeedHeader />

      <div className="flex-1 min-h-0 w-full overflow-hidden p-2 sm:p-4 flex flex-col">
        <div className="flex-1 min-h-0 w-full max-w-screen-xl mx-auto flex flex-col overflow-hidden">
          {/* Phone: single-panel navigation */}
          <div className="md:hidden flex-1 min-h-0 flex flex-col overflow-hidden">
            {currentView === 'chatList' && (
              <div className="bg-[#1A3E32] rounded-xl overflow-hidden flex-1 min-h-0 shadow-sm">
                <ChatsLeft
                  onSelectChat={handleSelectChat}
                  selectedChat={selectedChat}
                  onConversationHidden={handleConversationHidden}
                />
              </div>
            )}

            {currentView === 'chatView' && (
              <div className="bg-white rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col shadow-sm">
                <ChatsMiddle
                  selectedChat={selectedChat}
                  onShowChatList={showChatList}
                  onShowChatInfo={showChatInfo}
                />
              </div>
            )}

            {currentView === 'chatInfo' && (
              <div className="bg-[#F5F5F5] rounded-xl overflow-hidden flex-1 min-h-0 shadow-sm">
                <ChatsRight
                  selectedChat={selectedChat}
                  onBack={showChatView}
                />
              </div>
            )}
          </div>

          {/* Tablet: conversation list + messages side by side */}
          <div className="hidden md:grid lg:hidden grid-cols-[minmax(240px,300px)_1fr] gap-3 flex-1 min-h-0 overflow-hidden">
            <div className="bg-[#1A3E32] rounded-xl overflow-hidden min-h-0 h-full shadow-sm">
              <ChatsLeft
                onSelectChat={handleSelectChat}
                selectedChat={selectedChat}
                onConversationHidden={handleConversationHidden}
              />
            </div>

            <div className="relative bg-white rounded-xl overflow-hidden min-h-0 h-full flex flex-col shadow-sm">
              <ChatsMiddle
                selectedChat={selectedChat}
                onShowChatList={showChatList}
                onShowChatInfo={showChatInfo}
              />
              {currentView === 'chatInfo' && (
                <div className="absolute inset-0 z-40 bg-[#F5F5F5] rounded-xl overflow-hidden min-h-0 shadow-lg">
                  <ChatsRight
                    selectedChat={selectedChat}
                    onBack={showChatView}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Desktop: list + messages + profile */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(260px,320px)_1fr_minmax(240px,300px)] gap-4 flex-1 min-h-0 overflow-hidden">
            <div className="bg-[#1A3E32] rounded-xl overflow-hidden min-h-0 h-full shadow-sm">
              <ChatsLeft
                onSelectChat={handleSelectChat}
                selectedChat={selectedChat}
                onConversationHidden={handleConversationHidden}
              />
            </div>

            <div className="bg-white rounded-xl overflow-hidden min-h-0 h-full flex flex-col shadow-sm">
              <ChatsMiddle
                selectedChat={selectedChat}
                onShowChatList={showChatList}
                onShowChatInfo={showChatInfo}
              />
            </div>

            <div className="bg-[#F5F5F5] rounded-xl overflow-hidden min-h-0 h-full shadow-sm">
              <ChatsRight
                selectedChat={selectedChat}
                onBack={showChatView}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobseekerChat;