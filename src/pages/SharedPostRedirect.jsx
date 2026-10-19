import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostDetailPath } from "../utils/postNavigation";

/**
 * Local dev fallback: /p/:postId → post detail page.
 * On Vercel, vercel.json rewrites /p/:postId to the backend OG HTML endpoint for crawlers.
 */
export default function SharedPostRedirect() {
  const { postId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!postId) {
      navigate("/news-feed", { replace: true });
      return;
    }
    navigate(getPostDetailPath(postId), { replace: true });
  }, [postId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
      Opening post…
    </div>
  );
}
