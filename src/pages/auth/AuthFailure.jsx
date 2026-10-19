import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');

    // Map error codes to user-friendly messages
    const errorMessages = {
      'normal_signup_user': 'This email is already signed up with a regular account. Please sign in using your email and password instead.',
      'google_auth_failed': 'Google authentication failed. Please try again.',
      'google_auth_expired': 'Google sign-in expired or was already used. Please try again.',
      'user_cancelled': 'Authentication was cancelled.',
      'email_already_exists': 'An account with this email already exists. Please sign in instead.',
      'invalid_credentials': 'Invalid credentials provided.',
      'network_error': 'Network error occurred. Please check your connection and try again.',
      'default': 'Authentication failed. Please try again.'
    };

    const message = errorMessages[error] || errorMessages['default'];
    setErrorMessage(message);
    toast.error(message);

    console.log('Authentication failed with error:', error);
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#16730F]">
            Authentication Failed
          </h1>
          <p className="text-lg text-gray-600">
            {errorMessage || 'Something went wrong during authentication.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-6 bg-[#16730F] text-white rounded-full font-semibold shadow-md hover:bg-[#145c0c] transition-colors"
          >
            Go to Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="w-full py-3 px-6 bg-white text-[#16730F] border-2 border-[#16730F] rounded-full font-semibold shadow-md hover:bg-gray-50 transition-colors"
          >
            Create New Account
          </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 pt-4">
          Need help? <a href="/contact" className="text-[#16730F] hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default AuthFailure;

