const POST_ACTION_ICONS = {
  like: {
    default: "/assets/images/like-nav.svg",
    active: "/assets/images/like-active-nav.svg",
  },
  comment: {
    default: "/assets/images/CHAT.svg",
  },
  share: {
    default: "/assets/images/share-nav.svg",
  },
  save: {
    default: "/assets/images/save-nav.svg",
    active: "/assets/images/save-active-nav.svg",
  },
  delete: {
    default: "/assets/images/delete-nav.svg",
    active: "/assets/images/delete-active-nav.svg",
  },
};

export default function PostActionIcon({
  type,
  active = false,
  compact = false,
  className = "",
}) {
  const icons = POST_ACTION_ICONS[type];
  const src = active && icons.active ? icons.active : icons.default;
  const sizeClass = compact
    ? "h-5 w-5 sm:h-6 sm:w-6"
    : "h-7 w-7 sm:h-8 sm:w-8";

  return (
    <img
      src={src}
      alt=""
      className={`${sizeClass} shrink-0 object-contain ${className}`}
    />
  );
}
