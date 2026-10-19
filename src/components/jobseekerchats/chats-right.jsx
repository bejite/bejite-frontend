import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import image from '../../assets/Ellipse.png'; 


function ChatsRight({ onBack }) {
 

  return (
      <div className="bg-[#F5F5F5] h-full p-2">
        <aside className="bg-[#1A3E32] rounded-2xl h-full overflow-hidden">
          {/* Header */}
          <div className="bg-[#16730F] rounded-t-2xl">
            <div className="p-5">
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="flex items-center text-white hover:text-[#FFB547] transition lg:hidden"
              >
                <FaArrowLeft />
              </button>
            </div>
  
            {/* Profile Section */}
            <div className="flex flex-col items-center pb-6">
              <div className="relative -mt-10 rounded-full border-[5px] border-[#16730F]">
                <img
                  className="w-20 h-20 rounded-full object-cover"
                  src={image}
                 
                  loading="lazy"
                />
              </div>
              <div className="text-white text-center mt-3">
                <h1 className="text-lg font-semibold">Osakwe Prisca</h1>
                <p className="text-sm opacity-80">jobseeker</p>
              </div>
              <div className="w-36 mx-auto mt-4">
                <button
                  type="button"
                  className="bg-[#6B8E23] py-2 text-xs text-white w-full rounded-3xl hover:bg-[#5a7720] transition"
                  aria-label="View Profile"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
  
          {/* Contact + Links */}
          <div className="bg-[#16730F] px-6 py-6 space-y-6 h-full">
            {[
              { label: "Email", value: "osakweprsca@gmail.com" },
              { label: "Website", value: "https://linktree.com" },
            ].map((item, idx) => (
              <div key={idx}>
                <hr className="border-[#6B8E23] mb-2" />
                <p className="text-white text-sm break-words">{item.value}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    );
}

export default ChatsRight;