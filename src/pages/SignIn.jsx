import { API_URL } from "../config";
import { Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, verifyTwoFactorLogin, clearErrors } from "../features/auth/authSlice";
import { toast } from "react-toastify";
const bejiteLogoUrl = "/assets/images/logo.png";
const googleImgUrl = "/assets/images/google.png";
import Hyperlinks from "../components/Hyperlinks";
import TwoFactorCodeForm from "../components/auth/TwoFactorCodeForm";
import { decodeToken } from "../utils/tokenManager";
import { requestTwoFactorRecovery } from "../services/twoFactorApi";
import {
  isEmailNotVerifiedError,
  emailVerificationPath,
} from "../utils/authErrors";



function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, errors } = useSelector((state) => state.auth);
  const isDisabled = !email || !password || loading;

  const finishLogin = (data) => {
    const token = data.accessToken;
    let user = data.confirmedUser || data.user;

    if (!token) {
      toast.error("Authentication failed. Please try again.");
      return;
    }

    if (!user?.verified && !user?.role) {
      const decodedToken = decodeToken(token);
      user = {
        ...user,
        verified: decodedToken?.verified,
        isEmailVerified:
          decodedToken?.isEmailVerified || decodedToken?.verified,
        role: decodedToken?.role,
      };
    }

    toast.success("Login successful! Redirecting...");

    const isVerified = user?.verified || user?.isEmailVerified;
    const hasCompletedSignup =
      user?.role !== null && user?.role !== undefined;

    setTimeout(() => {
      if (!isVerified) {
        navigate(emailVerificationPath(user?.email || email));
      } else if (!hasCompletedSignup) {
        navigate(
          `/complete-signup?email=${encodeURIComponent(
            user.email
          )}&status=verified`
        );
      } else {
        navigate("/news-feed");
      }
    }, 500);
  };

// Clear errors when component mounts - but preserve session data to prevent auto-logout
  useEffect(() => {
    dispatch(clearErrors());
    
    // Only clear session if explicitly indicated (from expired session redirect)
    // Don't auto-clear user session - preserve it until user explicitly logs out
    const sessionExpired = sessionStorage.getItem("sessionExpired");
    if (sessionExpired) {
      sessionStorage.removeItem("sessionExpired");
      
      // Preserve user session data - only show message, don't destroy session
      // User can re-login to restore their session
      toast.error("Your session is expired, please login to continue");
    }
  }, [dispatch]);

  // -----------------------------
  // Normal email/password login
  // -----------------------------
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((data) => {
        if (data?.requiresTwoFactor) {
          setTwoFactorToken(data.twoFactorToken || "");
          setChallengeId(data.challengeId || "");
          toast.info("Enter the code from your authenticator app.");
          return;
        }
        finishLogin(data);
      })
      .catch((err) => {
        console.error("[Login] Failed:", err);

        // Handle specific error cases
        const errorMessage = err.error || err.message;

        if (
          errorMessage === "User not found." ||
          errorMessage?.toLowerCase().includes("user not found")
        ) {
          toast.error(
            "No account found with this email. Please sign up first."
          );
          setTimeout(() => {
            navigate("/signup");
          }, 2000);
        } else if (isEmailNotVerifiedError(err)) {
          toast.info("Please verify your email before logging in.");
          navigate(emailVerificationPath(email));
        } else if (
          errorMessage?.toLowerCase().includes("invalid email or password")
        ) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(errorMessage || "Login failed. Please try again.");
        }
      });
  };

  const handleTwoFactorVerify = (code) => {
    dispatch(verifyTwoFactorLogin({ twoFactorToken, challengeId, code }))
      .unwrap()
      .then((data) => {
        setTwoFactorToken("");
        setChallengeId("");
        finishLogin(data);
      })
      .catch((err) => {
        const errorMessage = err.error || err.message;
        toast.error(errorMessage || "Invalid authentication code.");
        if (err.code === "TWO_FACTOR_EXPIRED") {
          setTwoFactorToken("");
          setChallengeId("");
        }
      });
  };

  const handleTwoFactorRecovery = async () => {
    if (recoveryLoading) return;
    setRecoveryLoading(true);
    try {
      const data = await requestTwoFactorRecovery({ twoFactorToken, challengeId });
      toast.success(data.message || "Check your email for a recovery link.");
    } catch (error) {
      toast.error(error.message || "Could not send recovery email.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  // -----------------------------
  // Google OAuth login
  // -----------------------------
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Backend should redirect to /auth/success?token=...
    window.open(`${API_URL}/auth/google`, "_self");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="w-full lg:w-[70%] px-4 py-6 mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 lg:absolute lg:right-4 lg:left-4 lg:top-1/12 lg:transform lg:-translate-y-1/2 lg:z-10">
        <img src={bejiteLogoUrl} alt="Logo" className="h-10" />
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          <h1 className="text-[#828282] text-base sm:text-base font-medium text-center sm:text-left">
            Don't have an account?
          </h1>
          <Link
            className="text-[#16730F] text-base sm:text-base font-medium text-center sm:text-left hover:underline"
            to="/signup"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Form + Illustration */}
      <div className="relative flex flex-col justify-between flex-1 lg:flex-row">
        <div className="w-full lg:w-[60%] relative hidden lg:block">
          <img
            src="/assets/images/Illustra.svg"
            alt="Auth"
            className="w-full h-screen"
          />
          <img
            src="/assets/images/asubtext.svg"
            alt="Auth Text"
            className="absolute top-3/7 left-[46%] transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        <div className="w-full lg:w-[40%] flex lg:justify-start items-center justify-center px-6 py-10">
          <div className="w-full max-w-md space-y-5 mt-9">
            <h2 className="text-3xl font-norican font-semibold text-[#16730F] text-center">
              {twoFactorToken || challengeId ? "Two-Factor Authentication" : "Welcome Back!"}
            </h2>
            <p className="text-center text-[#16730F] text-md">
              {twoFactorToken || challengeId
                ? "Enter the code from your authenticator app"
                : "Sign in to continue"}
            </p>

            {twoFactorToken || challengeId ? (
              <TwoFactorCodeForm
                onSubmit={handleTwoFactorVerify}
                loading={loading}
                error={errors?.error}
                onRequestRecovery={handleTwoFactorRecovery}
                recoveryLoading={recoveryLoading}
                onBack={() => {
                  setTwoFactorToken("");
                  setChallengeId("");
                  dispatch(clearErrors());
                }}
              />
            ) : (
            <form
              onSubmit={handleLogin}
              className="space-y-4"
              data-testid="signin-form"
            >
              <input
                type="email"
                data-testid="signin-email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#d3d3d3] rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-[#16730F] focus:border-[#16730F]"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  data-testid="signin-password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#d3d3d3] rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-[#16730F] focus:border-[#16730F]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    console.log("Toggled password visibility:", !showPassword);
                  }}
                  className="absolute text-gray-500 transform -translate-y-1/2 right-4 top-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors?.error && (
                <p
                  data-testid="signin-error"
                  role="alert"
                  className="text-sm text-red-500"
                >
                  {errors.error}
                </p>
              )}

              <div className="text-right">
                <p
                  className="text-sm italic text-gray-500 cursor-pointer hover:underline"
                  onClick={() => {
                    console.log("Navigating to forgot password page");
                    navigate("/forgot-password");
                  }}
                >
                  Forgot Password?
                </p>
              </div>

              <button
                type="submit"
                data-testid="signin-submit"
                disabled={isDisabled}
                className={`w-full py-4 rounded-full text-white font-semibold shadow-md transition ${
                  isDisabled
                    ? "bg-[#16730F40] cursor-not-allowed"
                    : "bg-[#16730F]"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            )}

            {!twoFactorToken && !challengeId && (
              <>
            <p className="text-[#16730F] text-center text-xl">
              ...or sign in with
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <button
                onClick={handleGoogleLogin}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors ${
                  googleLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-md"
                }`}
              >
                {googleLoading ? (
                  <div className="w-6 h-6 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <img src={googleImgUrl} alt="google logo" className="w-8 h-8" />
                )}
              </button>
            </div>
              </>
            )}
            <Hyperlinks />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
