import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../ConfirmModal";
import { parsePostBody, truncatePostBody } from "../../utils/postBodyFormat";
import { searchMentionSuggestions } from "../../services/postsApi";

function renderTokens(tokens, handlers, keyPrefix = "t") {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    if (token.type === "bold") {
      return (
        <strong key={key}>
          {renderTokens(token.children || [], handlers, key)}
        </strong>
      );
    }
    if (token.type === "italic") {
      return (
        <em key={key}>{renderTokens(token.children || [], handlers, key)}</em>
      );
    }
    if (token.type === "link") {
      return (
        <a
          key={key}
          href={token.content}
          onClick={(e) => handlers.onLinkClick(e, token.content)}
          className="text-[#16730F] hover:underline cursor-pointer break-all"
        >
          {token.content}
        </a>
      );
    }
    if (token.type === "mention") {
      const label = token.label || token.content;
      return (
        <button
          key={key}
          type="button"
          onClick={(e) => handlers.onMentionClick(e, token)}
          className="text-[#16730F] font-semibold hover:underline"
        >
          @{label}
        </button>
      );
    }
    if (token.type === "hashtag") {
      return (
        <button
          key={key}
          type="button"
          onClick={(e) => handlers.onHashtagClick(e, token.content)}
          className="text-[#16730F] font-semibold hover:underline"
        >
          #{token.content}
        </button>
      );
    }
    return <span key={key}>{token.content}</span>;
  });
}

export default function FormattedPostBody({
  body,
  className = "text-black text-sm sm:text-base whitespace-pre-wrap break-words",
  truncateAt = 0,
}) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState("");

  const source = body || "";
  const { tokens: truncatedTokens, truncated } = truncatePostBody(
    source,
    truncateAt,
  );
  const tokens =
    truncated && !isExpanded ? truncatedTokens : parsePostBody(source);

  const handlers = {
    onLinkClick: (e, url) => {
      e.preventDefault();
      e.stopPropagation();
      setPendingLink(url);
      setLinkModalOpen(true);
    },
    onMentionClick: async (e, token) => {
      e.preventDefault();
      e.stopPropagation();
      if (token.userId) {
        navigate(`/user-profile/${token.userId}`);
        return;
      }
      const handle = String(token.content || "").trim();
      if (!handle) return;
      const users = await searchMentionSuggestions(handle, 8, { exact: true });
      const needle = handle.toLowerCase();
      const match = users.find(
        (user) =>
          String(user.username || "").toLowerCase() === needle ||
          String(user.nickname || "").toLowerCase() === needle ||
          String(user.handle || "").toLowerCase() === needle,
      );
      if (match?.id) navigate(`/user-profile/${match.id}`);
    },
    onHashtagClick: (e, tag) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/news-feed?hashtag=${encodeURIComponent(String(tag).toLowerCase())}`);
    },
  };

  return (
    <div>
      <ConfirmModal
        isOpen={linkModalOpen}
        title="Leaving Bejite"
        message="You're about to leave Bejite. Are you sure you want to continue?"
        onConfirm={() => {
          window.open(pendingLink, "_blank", "noopener,noreferrer");
          setLinkModalOpen(false);
        }}
        onCancel={() => setLinkModalOpen(false)}
      />
      <div className={className}>{renderTokens(tokens, handlers)}</div>
      {truncated && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((open) => !open);
          }}
          className="text-[#16730F] font-medium text-sm mt-1 hover:underline"
        >
          {isExpanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}
