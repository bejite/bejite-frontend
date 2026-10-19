import { Route } from "react-router-dom";
import {
  SignIn,
  SignUp,
  ForgetPassword,
  EmailCheck,
  EmailSent,
  ConfirmPassword,
  SignUpRole,
  AuthSuccess,
  AuthFailure,
  CompleteSignup,
  ResetPassword,
  TwoFactorRecovery,
} from "../lazyPages.js";

export const authRoutes = (
  <>
      <Route path="/auth/email-sent" element={<EmailSent />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/auth/failure" element={<AuthFailure />} />
      <Route path="/complete-signup" element={<CompleteSignup />} />
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/email-check" element={<EmailCheck />} />
      <Route path="/signup-role" element={<SignUpRole />} />
      <Route path="/confirmpassword" element={<ConfirmPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/2fa-recovery" element={<TwoFactorRecovery />} />
  </>
);
