import { Navigate, useLocation } from "react-router-dom";

export default function MessagesToChatsRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/chats${search}`} replace />;
}
