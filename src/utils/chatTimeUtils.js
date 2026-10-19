function parseChatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Local calendar day key (YYYY-MM-DD) for grouping chat messages. */
export function chatDayKey(dateString) {
  const date = parseChatDate(dateString);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * WhatsApp-style day label for the in-thread separator.
 * Today / Yesterday / weekday (last 7 days) / 25 August / 25 August 2025
 */
export function formatChatDayLabel(dateString, now = new Date()) {
  const date = parseChatDate(dateString);
  if (!date) return "";

  const diffDays = Math.round(
    (startOfLocalDay(now) - startOfLocalDay(date)) / 86400000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** Group messages so each day's chip can stick only inside that day. */
export function groupMessagesByDay(messages) {
  const groups = [];
  for (const message of messages || []) {
    const dayKey = chatDayKey(message.created_at) || "_";
    const last = groups[groups.length - 1];
    if (last && last.dayKey === dayKey) {
      last.messages.push(message);
    } else {
      groups.push({ dayKey, messages: [message] });
    }
  }
  return groups;
}

/** Clock time on each bubble once the day is shown in a separator. */
export function formatChatMessageTime(dateString) {
  const date = parseChatDate(dateString);
  if (!date) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
