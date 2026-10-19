import { React, useState } from "react";
import ChatPageHeader from "../../components/ChatPageHeader";
import {
  ChevronLeft,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Smile,
  Plus,
  Paperclip,
  Mic,
  Send,
} from 'lucide-react';
import employer1 from '../../assets/user2.png';
import employer2 from '../../assets/user4.png';
import image from '../../assets/image.png';

export default function SentInvite() {
  const employers = [
    { id: 1, name: 'Okpata Favour', lastMessage: 'Hi Prisca Okeke', avatar: employer1, jobTitle: 'Recruiter', email: 'okpata.favour@example.com', phone: '+234 8012345678', linktree: 'https://linktree.com/okpata', status: 'Offline' },
    { id: 2, name: 'Quadson Pritex', lastMessage: 'Hey...', avatar: employer2, jobTitle: 'Marketing Specialist', email: 'quadson.pritex@example.com', phone: '+234 9212345678', linktree: 'https://linktree.com/quadson', status: 'Online' },
  ]

  const [activeChatState, setActiveChatState] = useState(null);
  const activeChat = employers.find(employer => employer.id === activeChatState);


  const [acceptedInvite, setAcceptedInvite] = useState(false);

  const [isDisabled, setIsDisabled] = useState(true);

  const handleInvite = () => {
    setAcceptedInvite(true)
    setIsDisabled(false);
  }

  const headerIcons = {
    hasInvitations: true,
    hasInactiveChats: true,
  }

  return (
    <>
      <ChatPageHeader config={headerIcons} />
      <main className="flex flex-col h-screen p-2.5">
        <section className="flex gap-2">
          {/* Sidebar */}
          <div className="p-2  bg-neutral-200">
            <div className="w-65 bg-[#1A3E32] text-white flex flex-col p-4 h-screen">
              <div className="flex items-center gap-2 mb-4">
                <ChevronLeft size={20} color="#556B1F" />
                <h2 className="text-xl font-semibold text-[#556B1F]">Invitations</h2>
              </div>
              {/*Search */}
              <div className="flex items-center px-3 py-2 mb-4 bg-white rounded-xl">
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#1A3E32] text-sm"
                />
                <Search size={16} color="#1A3E32" />
              </div>
              {/*Active Employers*/}
              <div className="flex gap-3">
                {
                  employers
                    .filter(employer => employer.status === 'Online')
                    .map(employer => (
                      <div className="relative">
                        <img src={employer.avatar}
                          alt={employer.name}
                          className="object-cover w-12 h-12 rounded-full" />
                        <span className="absolute bottom-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full left-7"></span>
                        <p className="absolute text-[7px]">{employer.name}</p>
                      </div>
                    ))
                }
                <div className="relative w-12 h-12 p-3 bg-black rounded-full">
                  <Search />
                  <p className="text-[7px] absolute top-12 text-center right-0">See More Employers</p>
                </div>
              </div>
              {/* Divider*/}
              <div className=" border-t-2 border-[#16730F] mt-9 mb-5"></div>
              {/*Invites List */}
              <div className="flex flex-col gap-3 overflow-y-auto nfl-scroll scroll-smooth">
                {
                  employers.map(employer => (
                    <div
                      key={employer.id}
                      className={`flex items-center gap-3 cursor-pointer  p-2 rounded-2xl ${activeChatState === employer.id ? 'bg-[#2d5a2d]' : 'hover:bg-[#1f523c]'}`}
                      onClick={() => setActiveChatState(employer.id)}
                    >
                      <img
                        src={employer.avatar}
                        alt={employer.name}
                        className="w-12 h-12 rounded-full" />
                      <div className="font-medium">
                        <p className="text-[12px]">{employer.name}</p>
                        <p className="text-[8px] text-[#16730F]">{employer.lastMessage}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
          {/*Chat Window*/}
          {
            activeChat ?
              (
                <div className="bg-neutral-200 w-3xl text-[#2d5a2d] flex flex-col h-screen">
                  <div className="flex items-center justify-between p-4 bg-[#6B8E2340] shadow">
                    {/* Chat Header */}
                    <div className="flex items-center gap-3">
                      <img
                        src={activeChat.avatar}
                        alt={activeChat.name}
                        className="object-cover w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-[#16730F]">
                          {activeChat.name}
                          <span className="bg-[#556B1F] rounded-full w-2 h-2 inline-block ml-1"></span>
                        </h3>
                        <p className="text-sm text-[#556B1F]">online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Phone className="text-gray-600 hover:text-[#143d2a] cursor-pointer" />
                      <Video className="text-gray-600 hover:text-[#143d2a] cursor-pointer" />
                      <MoreHorizontal className="text-gray-600 hover:text-[#143d2a] cursor-pointer" />
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 p-6 overflow-y-auto nfl-scroll scroll-smooth text-[#16730F]">
                    {!acceptedInvite ? (
                      <div>
                        <p className="text-2xl font-semibold text-center">You've been invited for an interview!</p>
                        <p className="font-medium text-[10px] text-center">{activeChat.name} has invited you for an interview as a Graphics Designer on July 20th, 9:00am. Please respond within 72 hours. If no response, this invite will be automatically declined</p>
                      </div>
                    ) : (
                      <div>
                        <img
                          src="../../assets/images/verified.png"
                          className="w-[50px] m-auto" />
                        <p className="text-2xl font-semibold text-center">You've accepted the invitation!!!</p>
                        <p className="font-medium text-[10px] text-center">You can now start a conversation with {activeChat.name}.</p>
                      </div>

                    )}
                    <div className="flex items-center gap-2 mt-10 text-[#556B1F]">
                      <img
                        src={activeChat.avatar}
                        alt={activeChat.name}
                        className="w-8 h-8 rounded-full" />
                      <span className="text-[12px] font-medium">{activeChat.name}</span>
                    </div>
                    <div className="relative p-4 mt-3 text-sm text-gray-800 rounded-lg rounded-tl-none shadow max-w-96 bg-neutral-300 rounded-tr-2xl rounded-br-2xl rounded-bl-3xl">
                      <p>Hi Prisca Osakwe, Great news! You've been shortlisted for the Graphics Designer position. We'd love to meet you during an interview on July 20th, 9:00am via https://meet.google.com/yqt-vbte-amu. Kindly confirm your availability. We're excited to learn more about you!</p>
                    </div>
                    <span className="text-[#556B1F] font-medium text-[8px] absolute left-[570px] mt-2">SAT AT 11:06 AM</span>
                    {!acceptedInvite && <div className="flex items-center gap-8 text-white m-15 ">
                      <button className="bg-[#16730F] w-[220px] rounded-sm p-3 hover:bg-[#16730fab] cursor-pointer"
                        onClick={handleInvite}>Accept</button>
                      <button className="bg-[#EB5757] w-[220px] rounded-sm p-3 hover:bg-[#eb5757c7] cursor-pointer">Decline</button>
                    </div>}

                  </div>
                  {/* Message Input */}
                  <div className="flex items-center w-full px-4 py-2 mx-auto bg-gray-200 border border-[#16730F] rounded-2xl">
                    {/* Left icons */}
                    <div className="flex items-center space-x-2">
                      <button className="text-black hover:text-green-600">
                        <Smile size={22} />
                      </button>
                      <button className="text-black hover:text-green-600">
                        <Plus size={22} />
                      </button>
                    </div>

                    {/* Input */}
                    <input
                      type="text"
                      placeholder="Type a message"
                      // 'setNewMessage' is not defined && 'handleSendMessage' is not defined
                      // onChange={(e) => setNewMessage(e.target.value)}
                      // onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 ml-3 text-green-700 bg-transparent placeholder-[#16730F] focus:outline-none"
                      disabled={isDisabled}
                    />

                    {/* Right icons */}
                    <div className="flex items-center space-x-3">
                      <button className="text-black hover:text-green-600">
                        <Paperclip size={22} />
                      </button>
                      <button className="text-black hover:text-green-600">
                        <Mic size={22} />
                      </button>
                      <button
                        className="p-2 text-yellow-400 bg-green-900 rounded-full hover:bg-green-800"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>

                </div>
              )
              :
              (
                <div className="flex flex-col items-center justify-center flex-1 text-center text-[#2d5a2d]">
                  {/*Inactive Chat*/}
                  <img src={image} />
                  <p className="mb-2 text-2xl font-bold">No Conversation Selected</p>
                  <p className="text-gray-600">Choose a conversation on the left to view or respond to messages.</p>
                </div>

              )
          }
          {/* Profile Panel */}
          {activeChat &&
            <div className="p-2 bg-neutral-200">
              <div className="bg-[#16730F] h-screen w-65 p-8 rounded-t-3xl flex flex-col items-center text-white">
                <img src={activeChat.avatar}
                  alt={activeChat.name}
                  className="rounded-full w-17 h-17 object-cover object-center" />
                <p className="font-medium text-[16px] mt-6">{activeChat.name}</p>
                <p className="font-normal text-[11px]">Employer</p>
                <button className="w-[100px] p-3 rounded-3xl font-bold text-[10px] bg-[#6B8E23] hover:bg-[#6a8e23c0] mt-6 mb-10 cursor-pointer">View Profile</button>

                <div className="w-full">
                  <div className="mb-4 border border-[#6B8E23]"></div>
                  <p className="font-normal text-[11px] p-3">{activeChat.email}</p>
                  <div className="mb-4 border border-[#6B8E23]"></div>
                  <p className="font-normal text-[11px] p-3">{activeChat.phone}</p>
                  <div className="mb-4 border border-[#6B8E23]"></div>
                  <p className="font-normal text-[11px] p-3">{activeChat.linktree}</p>
                </div>

              </div>
            </div>
          }
        </section>
      </main>
    </>
  )
}

