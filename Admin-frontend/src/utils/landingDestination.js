const LANDING_TYPE_LABELS = {
  website: "Website",
  whatsapp: "WhatsApp",
  bejite: "Bejite Message",
  email: "Email",
};

export function getLandingTypeLabel(landingType) {
  return LANDING_TYPE_LABELS[landingType] || landingType || "Website";
}

/**
 * Build a clickable href from stored landing type + destination.
 * Fixes URLs entered without https:// (e.g. "example.com").
 */
export function getLandingHref(landingType, destination) {
  const dest = String(destination || "").trim();
  if (!dest) return null;

  const type = String(landingType || "website").toLowerCase();

  switch (type) {
    case "email":
      return dest.toLowerCase().startsWith("mailto:")
        ? dest
        : `mailto:${dest}`;
    case "whatsapp":
      if (/^https?:\/\//i.test(dest)) return dest;
      if (dest.includes("wa.me")) {
        return `https://${dest.replace(/^https?:\/\//i, "")}`;
      }
      {
        const digits = dest.replace(/\D/g, "");
        return digits ? `https://wa.me/${digits}` : `https://${dest}`;
      }
    case "bejite":
      if (/^https?:\/\//i.test(dest)) return dest;
      if (dest.startsWith("/")) {
        return `${window.location.origin}${dest}`;
      }
      return dest || "/chats";
    case "website":
    default:
      if (/^https?:\/\//i.test(dest)) return dest;
      return `https://${dest}`;
  }
}
