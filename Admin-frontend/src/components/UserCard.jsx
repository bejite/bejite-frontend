import { FaCheck } from "react-icons/fa";

const UserCard = ({ user, isAdded, onAdd }) => (
  <div className="px-4 py-3 w-full">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full sm:w-[300px] text-center sm:text-left">
        <div className="flex justify-center sm:justify-start mb-2 sm:mb-0">
          <img
            className="rounded-full w-12 h-12 object-cover"
            src={user.img}
            alt={user.name}
          />
        </div>
        <div className="flex flex-col items-center sm:items-start justify-center">
          <p className="text-lg sm:text-[20px] font-bold text-[#16730F]">
            {user.name}
          </p>
          <p className="text-[#1A3E32] text-sm sm:text-base mt-1">
            {user.role}
          </p>
        </div>
      </div>

      <div
        className={`flex justify-center items-center gap-2 rounded-3xl px-4 py-1.5 shadow-2xl cursor-pointer w-full sm:w-28 mx-auto sm:mx-0 ${
          isAdded ? "bg-[#E0E0E040]" : "bg-[#16730F]"
        }`}
        onClick={() => onAdd(user.id)}
      >
        {isAdded ? (
          <>
            <FaCheck className="text-[#1A3E32] text-xs" />
            <p className="text-[#1A3E32] font-medium">Added</p>
          </>
        ) : (
          <>
            <p className="text-white font-bold text-lg">+</p>
            <p className="text-white font-medium">Add</p>
          </>
        )}
      </div>
    </div>
  </div>
);

export default UserCard;
