import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const EmailSent = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email') || '';
  const [resending, setResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fromLogin = new URLSearchParams(location.search).get('reason') === 'login';

  const handleResendVerification = async () => {
    if (!email?.trim()) {
      setStatusMessage('No email address found. Please sign up again.');
      return;
    }

    setResending(true);
    setStatusMessage('');

    try {
      const { data } = await axiosInstance.post('/auth/resend-verification', {
        email: email.trim(),
      });

      if (data?.success) {
        setStatusMessage(
          data.message || 'Verification email resent! Check your inbox.',
        );
      } else {
        setStatusMessage(
          data?.message || data?.error || 'Failed to resend verification email.',
        );
      }
    } catch (err) {
      const apiError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error resending verification email. Please try again.';
      setStatusMessage(apiError);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-2xl font-bold mb-10 text-[#16730F]">
        Email Verification
      </h1>
      {fromLogin ? (
        <p className="text-gray-600 mb-4 max-w-md">
          Your account is not verified yet. Check your inbox for the verification
          link we sent when you signed up, or resend it below.
        </p>
      ) : (
        <p className="text-gray-600 mb-4">
          We&apos;ve sent a verification link to{' '}
          <strong>{email || 'your email'}</strong>.
        </p>
      )}
      <p className="text-gray-500 mb-6">
        {email ? (
          <>
            Email: <strong>{email}</strong>. Please check your inbox and click the
            link to verify your account.
          </>
        ) : (
          'Please check your inbox and click the link to verify your account.'
        )}
      </p>

      {statusMessage && (
        <p
          className={`text-sm mb-4 max-w-md ${
            statusMessage.toLowerCase().includes('resent') ||
            statusMessage.toLowerCase().includes('success')
              ? 'text-[#16730F]'
              : 'text-red-600'
          }`}
        >
          {statusMessage}
        </p>
      )}

      <p className="text-sm text-gray-400 mt-4">
        Didn&apos;t receive the email? Check your spam folder or use this Resend Email button.
      </p>

      <button type="button" onClick={handleResendVerification} disabled={resending || !email} className="mt-4 bg-[#16730F] text-white px-6 py-2 rounded-xl hover:bg-[#125c0c] transition disabled:opacity-50 disabled:cursor-not-allowed">
        {resending ? 'Sending...' : 'Resend verification email'}
      </button>

      <Link to="/" className="mt-6 text-[#16730F] hover:underline text-sm">
        Back to login
      </Link>
    </div>
  );
};

export default EmailSent;
