
import React from 'react';

const UserProfilePanel = ({ onViewMainProfile }) => {
  return (
    <div className="max-w-3xl m-auto px-4 py-6 bg-[#F5F5F5] mt-3">
      <ProfileHeader onViewMainProfile={onViewMainProfile} />
      <ActivitiesSection />
      <PostCard />
    </div>
  );
};

const ProfileHeader = ({ onViewMainProfile }) => {
  return (
    <div className="max-w-3xl mx-auto rounded-2xl p-10 bg-[#FFFFFF]">
      <div className="p-2 m-auto flex justify-center items-center gap-8">
        <ProfileImageSection />
        <ProfileStatsSection onViewMainProfile={onViewMainProfile} />
      </div>
      <MoreOptionsButton />
    </div>
  );
};

const ProfileImageSection = () => {
  return (
    <div >
      <div className="relative p-4">
        <div className="rounded-full w-[100px] h-[100px] overflow-hidden">
          <img
            src="/assets/images/photo_placeholder.png"
            alt="Osakwe Prisca profile"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="absolute w-4 h-4 bg-[#6B8E23] rounded-full border-2 border-white top-24 left-23"></span>
      </div>
      <div className=" ">
        <p className="text-[#6B8E23] font-semibold text-[13px]">Graphics Designer</p>
        <p className="text-[7px] font-semibold text-[#556B1F]">@Lagos, Nigeria</p>
      </div>
    </div>
  );
};

const ProfileStatsSection = ({ onViewMainProfile }) => {
  return (
    <div className="mt-4 flex items-center justify-center gap-4">
      <ProfileInfo onViewMainProfile={onViewMainProfile} />
      <ConnectionInfo />
    </div>
  );
};

const ProfileInfo = ({ onViewMainProfile }) => {
  return (
    <div className="flex flex-col items-center ml-[-34px] p-2  mt-6 ">
      <div className=' w-full '>
        <p className="text-[#6B8E23] ml-1 font-semibold text-[13px]">Osakwe Prisca</p>
        <p className="text-[6px]  ml-1 font-semibold text-[#556B1F]">Jobseeker</p>
      </div>
      <div className="text-start  w-full">
        <p className="text-[#556B1F] ml-2 text-[16px] font-medium">100</p>
        <p className="text-[#556B1F] ml-2 text-[16px] font-medium">Post</p>
      </div>
      <button
        onClick={onViewMainProfile}
        className="bg-[#556B1F] text-[8px] text-white p-1 max- w-[150px] rounded-3xl mt-1"
      >
        View Profile
      </button>
    </div>
  );
};

const ConnectionInfo = () => {
  return (
    <div className="flex flex-col items-center p-2  mt-12">
      <div className="text-center">
        <p className="text-[#556B1F] text-[16px] font-medium">202</p>
        <p className="text-[#556B1F] text-[16px] font-medium">Connections</p>
      </div>
      <button className="bg-[#556B1F] flex gap-2 justify-center text-[8px] items-center text-white p-1 w-[140px] rounded-3xl mt-1">
        <img src="/assets/images/Send_Submit.svg" alt="Send icon" className="w-3 h-3" />
        Message
      </button>
    </div>
  );
};

const MoreOptionsButton = () => {
  return (
    <span className="relative left-155 bottom-24">
      <img src="/assets/images/more.svg" alt="More options" />
    </span>
  );
};

const ActivitiesSection = () => {
  return (
    <>
      <p className="text-[13px] text-[#6B8E23] font-bold mb-2">Activities</p>
      <div className="max-w-3xl mx-auto rounded-2xl p-4 shadow-2xl">
        <div className="flex gap-10 text-[13px]">
          <ActivityButton text="Posts" />
          <ActivityButton text="Photos" />
          <ActivityButton text="Videos" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto my-8 border-t-1 border-[#16730F]" />
    </>
  );
};

const ActivityButton = ({ text }) => {
  return (
    <button className="text-[#FFFFFF] bg-[#556B1F] p-1 w-28 rounded-2xl">
      {text}
    </button>
  );
};

const PostCard = () => {
  return (
    <div className="bg-white p-6 max-w-3xl mx-auto rounded-2xl space-y-6">
      <PostHeader />
      <PostContent />
      <PostImage />
      <PostActions />
    </div>
  );
};

const PostHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
      <div className="flex items-center gap-4">
        <img
          src="/assets/images/photo_placeholder.png"
          alt="profile"
          className="rounded-full w-[60px] h-[60px] object-cover object-center"
        />
        <div>
          <p className="font-semibold text-[11px] text-lg text-[#16730F]">Osakwe Prisca</p>
          <p className="text-[#1A3E32] text-[8px] text-sm">Posted 12 minutes ago</p>
        </div>
      </div>
      <img
        src="assets/images/more.svg"
        alt="more"
        className="w-4 h-4 self-end sm:self-auto"
      />
    </div>
  );
};

const PostContent = () => {
  return (
    <div>
      <p className="text-black text-[10px]">
        🚀 HIRING JUST GOT SMARTER | WELCOME TO BEJITE.COM....
      </p>
      <p className="text-[#16730F80] text-sm mt-1 cursor-pointer">See more</p>
    </div>
  );
};

const PostImage = () => {
  return (
    <div>
      <img
        src="assets/images/bejiteAdvert.png"
        alt="Advert"
        className="w-full rounded-xl"
      />
    </div>
  );
};

const PostActions = () => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      <div className="flex gap-6  ">
        <PostAction icon="assets/images/heart.svg" text="Like" />
        <PostAction icon="assets/images/message-text.svg" text="Comment" />
        <PostAction icon="/assets/images/frame-saved.svg" text="Saved" />
      </div>
      <PostAction icon="/assets/images/send.svg" text="Share" />
    </div>
  );
};

const PostAction = ({ icon, text }) => {
  return (
    <div className="flex flex-col items-center">
      <img src={icon} alt={text} />
      <p className="text-[#1A3E32] text-[10px] text-sm">{text}</p>
    </div>
  );
};

export default UserProfilePanel;
