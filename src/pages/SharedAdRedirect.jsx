import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Local dev fallback: /a/:campaignId → AdPro campaign page.
 * On Vercel, vercel.json rewrites /a/:campaignId to the backend OG HTML endpoint for crawlers.
 */
export default function SharedAdRedirect() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!campaignId) {
      navigate("/adpro", { replace: true });
      return;
    }
    navigate(`/adpro/campaign/${encodeURIComponent(campaignId)}`, { replace: true });
  }, [campaignId, navigate]);

  return null;
}
