import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import { toast } from 'react-toastify';
import Loader from '../components/ui/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors } from '../features/auth/authSlice';
import { clearAuthData } from '../utils/tokenManager';
import axiosInstance from '../utils/axiosInstance';
import Hyperlinks from '../components/Hyperlinks';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { errors: apiErrors } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearErrors());
    clearAuthData();
    localStorage.removeItem('token');
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    if (!confirmPassword || confirmPassword !== password)
      newErrors.confirmPassword = 'Passwords do not match';

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async (e) => {
    e?.preventDefault?.();
    if (!validateForm() || submitting) return;

    const trimmedEmail = email.trim();
    setSubmitting(true);

    try {
      const { data } = await axiosInstance.post('/auth/signup', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: trimmedEmail,
        password,
        confirmPassword,
      });

      clearAuthData();
      localStorage.removeItem('token');

      toast.success(
        data?.message ||
          'Sign up successful! Please check your email to verify your account.',
      );

      navigate(
        `/auth/email-sent?email=${encodeURIComponent(trimmedEmail)}`,
        { replace: true },
      );
    } catch (err) {
      const body = err.response?.data;
      const msg =
        body?.error ||
        body?.message ||
        (typeof body === 'string' ? body : null) ||
        err.message ||
        'Sign up failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (apiErrors && Object.keys(apiErrors).length > 0) {
      if (typeof apiErrors === 'string') {
        toast.error(apiErrors);
      } else if (apiErrors.error) {
        toast.error(apiErrors.error);
      } else {
        Object.values(apiErrors).forEach((msg) => {
          if (msg && typeof msg === 'string') toast.error(msg);
        });
      }
    }
  }, [apiErrors]);

  const isDisabled =
    !email || !firstName || !lastName || !password || !confirmPassword;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Loader show={submitting} />

      {/* Header — same layout as SignIn */}
      <div className="w-full lg:w-[70%] px-4 py-6 mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 lg:absolute lg:right-4 lg:left-4 lg:top-1/12 lg:transform lg:-translate-y-1/2 lg:z-10">
        <img src="/assets/images/logo.png" alt="Logo" className="h-10" />
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          <h1 className="text-[#828282] text-base sm:text-base font-medium text-center sm:text-left">
            Already have an account?
          </h1>
          <Link
            className="text-[#16730F] text-base sm:text-base font-medium text-center sm:text-left hover:underline"
            to="/"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="relative flex flex-col justify-between flex-1 lg:flex-row">        <div className="w-full lg:w-[60%] relative hidden lg:block">
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

        <div className="w-full lg:w-[40%] flex items-center justify-center lg:justify-start px-6 py-10">
          <form
            className="w-full max-w-md space-y-2 mt-9"
            onSubmit={handleContinue}
            noValidate
          >
            <h2 className="text-3xl font-norican font-semibold text-[#16730F] text-center">              Sign Up
            </h2>
            <p className="text-center text-[#16730F] text-md">
              Create your account in a few steps
            </p>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                setValue={setFirstName}
                errorKey="firstName"
                localErrors={formErrors}
              />
              <Input
                type="text"
                placeholder="Last Name"
                value={lastName}
                setValue={setLastName}
                errorKey="lastName"
                localErrors={formErrors}
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                setValue={setEmail}
                errorKey="email"
                localErrors={formErrors}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                setValue={setPassword}
                errorKey="password"
                localErrors={formErrors}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                setValue={setConfirmPassword}
                errorKey="confirmPassword"
                localErrors={formErrors}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 rounded-full text-white font-semibold shadow-md transition mb-5 mt-2 ${
                isDisabled || submitting
                  ? 'bg-[#16730F40] cursor-not-allowed'
                  : 'bg-[#16730F]'
              }`}
              disabled={isDisabled || submitting}
            >
              Continue
            </button>

            <p className="text-[#16730F] text-center text-xl">...or signup with</p>
            <div className="flex justify-center gap-6 mt-1">
              {/* <FaLinkedin className="text-3xl text-blue-600 cursor-pointer" /> */}

              <button
                type="button"
                onClick={() => {
                  window.location.href = `${API_URL}/auth/google`;
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 cursor-pointer hover:shadow-md transition-colors"
                aria-label="Sign up with Google"
              >
                <img
                  src="/assets/images/google.png"
                  alt="Google logo"
                  className="w-5 h-5"
                />
              </button>
              {/* <img
                src="/assets/images/x.svg"
                alt="Twitter"
                className="w-8 h-8 cursor-pointer"
              /> */}
            </div>
           {/* <Hyperlinks /> */}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
