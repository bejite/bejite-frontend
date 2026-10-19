import { Route } from "react-router-dom";
import {
  About,
  Teams,
  SecurityAdvice,
  PrivacyPolicy,
  Contact,
  Help,
  NotFound,
} from "../lazyPages.js";

export const miscRoutes = (
  <>
      <Route path="/about" element={<About />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/security-advice" element={<SecurityAdvice />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help" element={<Help />} />
      <Route path="*" element={<NotFound />} />
  </>
);
