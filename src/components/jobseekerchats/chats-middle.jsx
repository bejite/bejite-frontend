import React, { useState } from 'react';
import { FaArrowLeft, /* FaPhone, FaVideo, */ FaBars } from 'react-icons/fa';
import image from '../../assets/Ellipse.png'; 

function ChatsMiddle({ onShowChatList, onShowChatInfo }) {
  const [_, setAgreed] = useState(false);
  const [message, setMessage] = useState('');

  const handleAccept = () => {
    setAgreed(true);
  };


  return (
   <main className="w-full h-full flex flex-col bg-gray-100">
      {/* Header */}
     <div className="bg-gray-200 flex items-center justify-between px-4 py-7 ">
        <div className="flex items-center gap-3">
          <button
            onClick={onShowChatList}
            className="lg:hidden text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft />
          </button>
        
          <div>
            <h1 className="text-[#16730F] text-xl font-medium">Osakwe Prisca</h1>
            <p className="text-sm text-gray-600">
            online
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* <button className="bg-[#16730F] text-white p-2 rounded-full hover:bg-[#1a5c13] transition">
            <FaPhone className="text-sm" />
          </button>
          <button className="bg-[#16730F] text-white p-2 rounded-full hover:bg-[#1a5c13] transition">
            <FaVideo className="text-sm" />
          </button> */}
          <button 
            onClick={onShowChatInfo}
            className="lg:hidden text-gray-600 hover:text-gray-800 transition-colors ml-2"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto nfl-scroll scroll-smooth p-4">
       
        {/* Message Bubble */}
        <div className="flex justify-center mb-6">
          <div className="max-w-[600px]">
             <div className="flex flex-col items-start"> 
             <div className="flex items-center gap-3">
                       <img
                         src={image}
                         alt="profile"
                         className="w-10 h-10 rounded-full flex-shrink-0"
                       />
                     </div>
           
                     {/* Message Bubble */}
                     <div className="bg-gray-200 p-6 mt-3 rounded-2xl rounded-tl-none text-sm">
                       <p className="text-[#1A3E32] font-medium">
                         Hi Prisca Osakwe,<br />
                         Great news! You've been shortlisted for the Graphics Designer position.
                         We’d love to meet you during an interview on July 20th, 9:00am via{" "}
                         https://meet.google.com/yqt-vbte-amu. Kindly confirm your availability.
                         We're excited to learn more about you!
                       </p>
                     </div>
            </div>

           <div className="mt-4">
              <h1 className='text-sm text-gray-700 font-semibold'>JOB ROLE</h1>
              <p className='text-left text-[#16730F] text-sm font-semibold'>GRAPHIC DESIGNER</p>


               <h1 className='text-sm text-gray-700 font-semibold mt-5'>DATE/TIME SENT</h1>
              <p className='text-left text-[#16730F] text-sm font-semibold'>15th July,  1:50pm UTC</p>
           </div>
           
            <div className='mt-3'>

            
             <h1 className='text-left'>status:</h1>
              <div className="flex gap-3 mt-4 ">
                 <button
                  
                  className=" bg-[#FFB547] text-[#16730F] px-8 py-2 rounded-md  transition"
                >
                  waiting
                </button>

                <button
                  onClick={handleAccept}
                  className="border-[#16730F] border-2 text-[#16730F] px-8 py-2 rounded-md  transition"
                >
                  Accepted
                </button>
                <button className="border-[#EB5757] border-2 text-[#EB5757] px-8 py-2 rounded-md  transition">
                  Expired
                </button>
              </div>
              </div>
              
           
          </div>
        </div>
      </div>

       {/* Message Input */}
  <div className="p-4 bg-gray-100 ">
    <div className="flex flex-col gap-2 border border-gray-300 rounded-2xl px-4 py-3 bg-gray-100 shadow-sm">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="text-gray-500 hover:text-green-600 text-lg"
            aria-label="Add emoji"
          >
            😊
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-green-600 text-lg"
            aria-label="Attach file"
          >
            ＋
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="text-gray-500 hover:text-green-600 text-lg"
            aria-label="Record voice"
          >
            🎤
          </button>
          <button
            type="button"
            className="bg-gray-700 hover:bg-green-600 text-white rounded-full p-2 transition"
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
        </div>
      </div>
    </main>
  );
}

export default ChatsMiddle;