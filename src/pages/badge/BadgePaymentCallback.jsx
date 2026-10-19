import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyBadgeSubscription } from '../../services/verifiedBadgeApi';
import { refreshVerifiedBadgeInSession } from '../../services/verifiedBadgeSync';
import { getUser } from '../../utils/tokenManager';
import { getRecruiterIdUploadPath } from '../../utils/recruiterProfilePaths';
import { userIsRecruiter } from '../../utils/verifiedBadge';

const OPEN_PAYSTACK_STATUSES = new Set([
  'abandoned',
  'ongoing',
  'pending',
  'processing',
]);

function getBadgeRetryPath() {
  const sessionUser = getUser();
  if (userIsRecruiter(sessionUser)) {
    return getRecruiterIdUploadPath(sessionUser);
  }
  return '/badge';
}

export default function BadgePaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inIframe =
    typeof window !== 'undefined' && window.self !== window.top;
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying your subscription...');
  const retryPath = getBadgeRetryPath();
  const startedRef = useRef(false);

  useEffect(() => {
    // Paystack may prefetch callback_url in a hidden iframe while the card
    // form is still open. Verifying then freezes checkout on "processing".
    if (inIframe) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const verify = async () => {
      const ref = searchParams.get('reference') || searchParams.get('trxref');
      if (!ref) {
        setStatus('error');
        setMessage('Payment reference not found');
        return;
      }

      try {
        const response = await verifyBadgeSubscription(ref);
        const txnStatus = String(response?.data?.status || '').toLowerCase();
        if (response?.data?.status === 'success') {
          if (response?.applied === false) {
            setStatus('error');
            setMessage(
              response?.message ||
                'Payment received, but it does not match your current ID. Upload again and pay for the new file.',
            );
            return;
          }
          const pendingReview = Boolean(response?.pendingReview);
          setStatus('success');
          setMessage(
            pendingReview
              ? 'Payment received. Your document is awaiting admin review.'
              : 'Verified Badge activated! Redirecting...',
          );
          await refreshVerifiedBadgeInSession(dispatch);
          setTimeout(
            () =>
              navigate(
                pendingReview ? '/badge?pendingReview=1' : '/badge-holder',
                { replace: true },
              ),
            2000,
          );
          return;
        }

        if (OPEN_PAYSTACK_STATUSES.has(txnStatus)) {
          setStatus('error');
          setMessage(
            'Payment was not completed. Go back and enter your card details again when you are ready.',
          );
          return;
        }

        setStatus('error');
        setMessage('Payment verification failed. Please try again.');
      } catch (error) {
        console.error('Badge payment verification error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
            'An error occurred during verification.',
        );
      }
    };

    verify();
  }, [searchParams, navigate, dispatch, inIframe]);

  if (inIframe) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1A3E32] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Processing Payment</h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">✓</div>
            <h2 className="text-xl font-semibold text-gray-900">
              {message?.includes('awaiting') ? 'Payment received' : "You're Verified!"}
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-2xl">✕</div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Failed</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              type="button"
              onClick={() => navigate(retryPath)}
              className="mt-4 px-6 py-2 bg-[#1A3E32] text-white rounded-lg hover:bg-[#16362a]"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
