import { LuSend } from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

export default function InterviewInvite() {
  const navigate = useNavigate();

  function handleClick(path) {
    navigate(path);
  }

  return (
    <section className="bg-[#D9D9D9] h-full p-2.5">
      <p className="text-[#16730F] font-medium text-2xl text-center mt-10 text-[20px]">
        Send Interview Invite
      </p>

      <p className="text-[#16730F] font-normal text-center text-[15px]">
        Choose a quick message from Bejite or write your own to invite this
        candidate for an interview.
      </p>

      <div className="mt-3 border border-black bg-neutral-200 rounded-xl w-[300px] sm:w-[600px] md:w-[750px] h-[450px] sm:h-[400px] m-auto p-4 text-[15px]">
        <div className="bg-[#6B8E23] text-white font-medium  md:text-2xl sm:w-[450px] w-[250px] text-center p-3 rounded-2xl mb-4 m-auto mt-3.5">
          Osakwe Prisca
        </div>

        <div className="bg-[#6B8E23] text-white font-medium md:text-2xl sm:w-[450px] w-[250px] m-auto text-center p-3 rounded-2xl mb-4">
          Graphics Designer
        </div>

        <div className="text-[#556B1F] mt-5 text-center">
          <p>Enter Interview Date and Time</p>

          <div className="flex flex-col items-center justify-center gap-5 mt-4 mb-4 sm:flex-row">
            <input
              type="date"
              className="w-[200px] sm:w-[230px] h-[50px] border-[#16730F] border rounded-2xl outline-none cursor-text p-2 "
            />

            <input
              type="time"
              className="w-[200px] sm:w-[230px] h-[50px] border-[#16730F] border rounded-2xl outline-none cursor-text p-2"
            />
          </div>

          <p>Interview Mode (Physical Address or Link)</p>

          <input
            type="text"
            placeholder="Enter Interview Mode"
            className="w-[270px] sm:w-[500px] h-[50px] border-[#16730F] border rounded-2xl outline-none cursor-text p-2 mb-5 mt-3"
          />
        </div>
      </div>
      <p className="text-center text-[#16730F] font-normal mt-3.5">
        Choose at least 1 customized template
      </p>

      <div className="bg-[#556B1F] w-[300px] sm:w-[600px] md:w-[750px] h-[150px] m-auto rounded-2xl text-white flex items-center p-6 font-medium text-[10px] sm:text-[13px]">
        <input type="checkbox" className="mr-3 rounded-sm h-9 w-9" />
        <p>
          Hello Prisca Osakwe,
          <br />
          We've reviewed your application for the position of{" "}
          <b className="text-[#FFB547]">Graphics Designer</b> and we'd like to
          invite you to an interview scheduled for{" "}
          <b className="text-[#FFB547]">20th July, 9:00am</b>. <br /> The
          interview will take place via{" "}
          <b>
            <a
              href="https://meet.google.com/yqt-vbte-amu"
              className="text-[#FFB547]"
            >
              https://meet.google.com/yqt-vbte-amu
            </a>
          </b>
          . Please confirm your availability to proceed. <br />
          Looking forward to speaking with you.
        </p>
      </div>

      <div className="bg-[#556B1F] w-[300px] sm:w-[600px] md:w-[750px] h-[150px] m-auto rounded-2xl text-white flex items-center p-5 font-medium mt-5 text-[10px] sm:text-[13px]">
        <input type="checkbox" className="mr-3 rounded-sm h-11 w-11" />
        <p>
          Hi Prisca Osakwe,
          <br />
          Great news! You've been shortlisted for the{" "}
          <b className="text-[#FFB547]">Graphics Designer</b> position. We'd
          love to meet you during an interview on{" "}
          <b className="text-[#FFB547]">20th July, 9:00am</b> via{" "}
          <b>
            <a
              href="https://meet.google.com/yqt-vbte-amu"
              className="text-[#FFB547]"
            >
              https://meet.google.com/yqt-vbte-amu
            </a>
          </b>
          . <br /> Kindly confirm your availability. We're excited to learn more
          about you!
        </p>
      </div>
      <p className="text-center text-[#6B8E23] font-medium mt-4 text-[13px]">
        <span className="inline-block w-[100px] sm:w-[250px] border border-black mr-1"></span>
        OR
        <span className="inline-block w-[100px] sm:w-[250px] border border-black ml-1"></span>
      </p>

      <div className="mt-3 border border-black bg-neutral-200 rounded-xl w-[300px] sm:w-[600px] md:w-[750px] h-[200px] m-auto p-3 text-[#556B1F] text-center">
        <p className="mt-2 mb-2">Enter your custom message</p>

        <input
          type="text"
          placeholder="Write your own message"
          className="bg-[#556B1F] w-[270px] sm:w-[550px] md:w-[700px] h-[120px] rounded-2xl text-white p-5 font-medium outline-none"
        />
      </div>

      <div className="flex items-center justify-center gap-5 mt-9">
        <div
          className="bg-[#1A3E32] flex w-2xs text-[#FFB547] items-center justify-center gap-2 p-3 rounded-2xl cursor-pointer"
          onClick={() => handleClick("/employee-sent-invite")}
        >
          <LuSend />
          Send
        </div>
        <div className="border-[#EB5757] border-2 flex w-2xs items-center justify-center text-[#EB5757] gap-2 rounded-2xl p-3 cursor-pointer">
          <RxCross1 />
          Cancel
        </div>
      </div>
    </section>
  );
}
