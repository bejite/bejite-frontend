import { Routes } from "react-router-dom";
import { authRoutes } from "./authRoutes.jsx";
import { onboardingRoutes } from "./onboardingRoutes.jsx";
import { verificationRoutes } from "./verificationRoutes.jsx";
import { socialRoutes } from "./socialRoutes.jsx";
import { adProRoutes } from "./adProRoutes.jsx";
import { employerRoutes } from "./employerRoutes.jsx";
import { paymentRoutes } from "./paymentRoutes.jsx";
import { profileRoutes } from "./profileRoutes.jsx";
import { miscRoutes } from "./miscRoutes.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {authRoutes}
      {onboardingRoutes}
      {verificationRoutes}
      {socialRoutes}
      {adProRoutes}
      {employerRoutes}
      {paymentRoutes}
      {profileRoutes}
      {miscRoutes}
    </Routes>
  );
}
