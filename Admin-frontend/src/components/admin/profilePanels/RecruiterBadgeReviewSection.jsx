import { useState } from 'react';
import { ShieldCheck, ShieldX } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { useAdminInbox } from '../../../context/AdminInboxContext';

const STATUS_COPY = {
  unverified: 'Unverified — waiting for ID upload and payment',
  pending_review: 'Paid — awaiting admin review',
  approved: 'Approved — Verified Recruiter badge is live',
  rejected: 'Rejected — recruiter must upload a new ID and pay again',
};

export default function RecruiterBadgeReviewSection({
  userId,
  profileUser,
  onReviewed,
}) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const { refresh: refreshInbox } = useAdminInbox();

  const status =
    profileUser?.recruiterVerificationStatus ||
    profileUser?.recruiter_verification_status ||
    'unverified';
  const paid = Boolean(profileUser?.paidForCurrentDocument);
  const hasDocument = Boolean(profileUser?.id_document);
  const canReview = hasDocument && paid && status === 'pending_review';

  const submit = async (action) => {
    if (!userId || busy) return;
    setBusy(action);
    setError(null);
    try {
      await axiosInstance.post(`/api/admin/data/users/${userId}/recruiter-badge`, {
        action,
        note: note.trim() || undefined,
      });
      setNote('');
      await onReviewed?.();
      try {
        await refreshInbox({ silent: true });
      } catch {
        /* inbox refresh should not fail the review action */
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Review failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-800">Recruiter verification</h3>
        <p className="text-sm text-gray-600 mt-1">
          {STATUS_COPY[status] || STATUS_COPY.unverified}
        </p>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Document on file</dt>
          <dd className="font-medium text-gray-800">{hasDocument ? 'Yes' : 'No'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Paid for this document</dt>
          <dd className="font-medium text-gray-800">{paid ? 'Yes' : 'No'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Document version</dt>
          <dd className="font-medium text-gray-800">
            {profileUser?.id_document_version ?? profileUser?.idDocumentVersion ?? 0}
          </dd>
        </div>
      </dl>

      {canReview ? (
        <>
          <label className="block text-sm">
            <span className="text-gray-500">Internal note (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Visible only in this review action"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => submit('approve')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16730F] text-white text-sm font-semibold disabled:opacity-60"
            >
              <ShieldCheck size={16} />
              {busy === 'approve' ? 'Approving…' : 'Approve badge'}
            </button>
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => submit('reject')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              <ShieldX size={16} />
              {busy === 'reject' ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-500">
          Approve or reject is available only after a successful ₦5,000 payment
          for the current document.
        </p>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
