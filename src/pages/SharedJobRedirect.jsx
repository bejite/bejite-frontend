import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Local dev fallback: /j/:jobId → job vacancy page.
 * On Vercel, vercel.json rewrites /j/:jobId to the backend OG HTML endpoint for crawlers.
 */
export default function SharedJobRedirect() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!jobId) {
      navigate("/job-vacancy", { replace: true });
      return;
    }
    navigate(`/job-vacancy?jobId=${encodeURIComponent(jobId)}`, { replace: true });
  }, [jobId, navigate]);

  return null;
}
