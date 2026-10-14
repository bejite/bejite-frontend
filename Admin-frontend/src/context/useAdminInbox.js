import { useContext } from "react";
import { AdminInboxContext } from "./adminInboxContext";

export function useAdminInbox() {
  const context = useContext(AdminInboxContext);
  if (!context) {
    throw new Error("useAdminInbox must be used within AdminInboxProvider");
  }
  return context;
}
