import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * Local fallback: /v/:pitchId → pitch page.
 * On Vercel, vercel.json rewrites /v/:pitchId to the backend preview for crawlers.
 */
export default function SharedPitchRedirect() {
  const { pitchId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!pitchId) {
      navigate("/pitch", { replace: true });
      return;
    }
    navigate(`/pitch?id=${encodeURIComponent(pitchId)}`, { replace: true });
  }, [pitchId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
      Opening pitch…
    </div>
  );
}
