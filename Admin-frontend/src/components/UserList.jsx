import UserCard from "./UserCard";

const UserList = ({ users, addedUsers, onAdd }) => (
  <div className="w-full mt-10 max-w-3xl bg-[#E0E0E040] rounded-t-3xl border-[#E0E0E040] max-h-[400px] overflow-y-auto nfl-scroll scroll-smooth">
    {users.map((user) => (
      <UserCard
        key={user.id}
        user={user}
        isAdded={addedUsers.includes(user.id)}
        onAdd={onAdd}
      />
    ))}
  </div>
);

export default UserList;
