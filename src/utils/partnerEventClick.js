/**
 * Extract partner event id from a notification payload / link.
 */
export function getPartnerEventIdFromNotification(notification) {
  if (!notification) return null;

  if (
    notification.entity_type === "partner_event" &&
    notification.entity_id
  ) {
    return String(notification.entity_id);
  }

  let data = notification.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = null;
    }
  }

  if (data?.eventId != null) return String(data.eventId);

  const link = notification.link || data?.url || "";
  try {
    const url = new URL(link, window.location.origin);
    const fromQuery = url.searchParams.get("eventId");
    if (fromQuery) return String(fromQuery);
  } catch {
    /* ignore */
  }

  return null;
}
