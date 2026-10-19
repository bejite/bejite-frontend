import { RiHome5Line } from "react-icons/ri";
import { IoChatbubblesOutline } from "react-icons/io5";
import { CiBellOn } from "react-icons/ci";
import { LuUserRoundSearch } from "react-icons/lu";
import { GrSync } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { PiBriefcaseBold } from "react-icons/pi";

export default function ChatPageHeader({ config }) {
  const navigate = useNavigate();

  function handleClick(path) {
    navigate(path);
  }

  const spanCircles =
    "items-center p-1 border-[#16730F] border-2 rounded-full h-7 w-7 sm:h-9 sm:w-9 cursor-pointer";
  const iconStyle = "w-4 h-4 text-[#16730F] sm:w-6 sm:h-6 m-auto";

  return (
    <header className="bg-[#F5F5F5] w-full relative z-50 p-3.5">
      <div className="max-w-[1440px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-3 sm:gap-4">
        <img
          src="/assets/images/logo.png"
          alt="Logo"
          className="h-10 md:h-14 lg:h-16"
        />
        <div className="flex items-center gap-10">
          <div className="flex justify-between gap-2">
            <span className={spanCircles}>
              <RiHome5Line
                className={iconStyle}
                onClick={() => handleClick("/post-page")}
              />
            </span>
            {config.hasInvites && (
              <div className="relative flex items-center mr-7 sm:mr-11">
                <span className="items-center p-1 border-[#1A3E32] border-2 rounded-full h-7 w-7 sm:h-9 sm:w-9 z-50 bg-white cursor-pointer">
                  <PiBriefcaseBold
                    className="text-[#1A3E32] w-4 h-4 sm:w-6 sm:h-6 m-auto font-bold"
                    onClick={() => handleClick("/candidate-search-page")}
                  />
                </span>
                <span className=" w-9 h-5 sm:w-14 bg-[#1A3E32] rounded-full absolute left-7 text-white font-medium text-[8px] text-center p-1 px-2 -z-50">
                  Invites
                </span>
              </div>
            )}
            {config.hasActiveChats && (
              <div className="relative flex items-center mr-7 sm:mr-9">
                <span className="items-center p-1 border-[#1A3E32] border-2 rounded-full h-7 w-7 sm:h-9 sm:w-9 z-50 bg-white cursor-pointer">
                  <IoChatbubblesOutline className="text-[#1A3E32] w-4 h-4 sm:w-6 sm:h-6 m-auto font-bold" />
                </span>
                <span
                  className={` w-8 h-5 sm:w-12 sm:h-5 bg-[#1A3E32] rounded-full absolute left-6 text-white font-medium text-[8px] text-center p-1 -z-50`}
                >
                  Chats
                </span>
              </div>
            )}
            {config.hasInactiveChats && (
              <span className={spanCircles}>
                <IoChatbubblesOutline
                  className={iconStyle}
                  onClick={() => handleClick("/chats")}
                />
              </span>
            )}

            <span className={spanCircles}>
              <CiBellOn
                className={iconStyle}
                onClick={() => handleClick("/notification")}
              />
            </span>
            {config.hasInvitations && (
              <div className="relative flex items-center mr-7 sm:mr-11">
                <span className="items-center p-1 border-[#1A3E32] border-2 rounded-full h-7 w-7 sm:h-9 sm:w-9 z-50 bg-white cursor-pointer">
                  <PiBriefcaseBold
                    className="text-[#1A3E32] w-4 h-4 sm:w-6 sm:h-6 m-auto font-bold"
                    onClick={() => handleClick("/candidate-search-page")}
                  />
                </span>
                <span className=" w-9 h-5 sm:w-14 bg-[#1A3E32] rounded-full absolute left-7 text-white font-medium text-[8px] text-center p-1 px-2 -z-50">
                  Invitations
                </span>
              </div>
            )}
            {config.hasUserSearch && (
              <span className={spanCircles}>
                <LuUserRoundSearch
                  className={iconStyle}
                  onClick={() => handleClick("/candidate-search-page")}
                />
              </span>
            )}
            <span className={spanCircles}>
              <GrSync
                className={iconStyle}
                onClick={() => handleClick("/news-feed")}
              />
            </span>
          </div>
          <div className="flex items-center gap-3 ">
            <div className="rounded-full bg-[#a7a1a1] w-8 sm:w-21 relative">
              <img
                src="/src/assets/user1.png"
                alt="Employer"
                className="rounded-full w-14 h-15 sm:w-20 sm:h-21"
              />

              <span className=" w-2.5 h-2.5 sm:w-5 sm:h-5 bg-[#6B8E23] absolute rounded-full border-white border-3 bottom-1.5 right-1.5"></span>
            </div>
            <div>
              <p className="text-[#16730F] font-semibold text-[14px]">
                Okpata Favour
              </p>
              <p className="text-[#1A3E32] font-normal text-[10px]">Employer</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
