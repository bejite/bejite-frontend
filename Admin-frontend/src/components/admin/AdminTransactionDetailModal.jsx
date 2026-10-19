import { useEffect, useState } from "react";
import { X, CreditCard, UserRound } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLabel = (value) => {
  if (value == null || value === "") return null;
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatCurrency = (amount, currency = "NGN") => {
  const code = currency || "NGN";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: code,
    }).format(Number(amount || 0));
  } catch {
    return `${code} ${Number(amount || 0).toLocaleString()}`;
  }
};

const statusClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "success") return "bg-green-50 text-green-700";
  if (value === "pending") return "bg-amber-50 text-amber-700";
  if (value === "failed") return "bg-red-50 text-red-700";
  if (value === "refunded") return "bg-gray-100 text-gray-600";
  return "bg-gray-100 text-gray-600";
};

const DetailRow = ({ label, value }) => {
  if (value == null || value === "") return null;
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium sm:text-right break-all">
        {value}
      </span>
    </div>
  );
};

const AdminTransactionDetailModal = ({ transaction, onClose }) => {
  const [details, setDetails] = useState(transaction);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(transaction?.id));

  useEffect(() => {
    setDetails(transaction);
    setError(null);
    if (!transaction?.id) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/api/admin/metrics/revenue/transactions/${transaction.id}`,
        );
        if (!cancelled && data?.transaction) {
          setDetails(data.transaction);
        }
      } catch {
        if (!cancelled && !transaction.reference && !transaction.email) {
          setError("Could not load full transaction details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [transaction]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const payerName =
    details?.payer_name ||
    [details?.first_name, details?.last_name].filter(Boolean).join(" ").trim() ||
    "Unknown payer";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Transaction details"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-green-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 truncate">
                Transaction details
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {formatLabel(details?.plan_type || details?.transaction_type) ||
                  "Payment"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {loading ? (
            <div
              className="h-52 flex flex-col items-center justify-center gap-3"
              role="status"
              aria-live="polite"
              aria-label="Loading transaction details"
            >
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#16730F]" />
              <p className="text-sm text-gray-500">Loading details…</p>
            </div>
          ) : (
            <>
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(details?.amount, details?.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {details?.currency || "NGN"}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusClass(
                details?.status,
              )}`}
            >
              {details?.status || "unknown"}
            </span>
          </div>

          {error && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
            <div className="h-10 w-10 bg-white text-gray-600 rounded-full flex items-center justify-center border border-gray-100">
              <UserRound size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {payerName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {details?.email || "No email on record"}
              </p>
            </div>
          </div>

          <DetailRow label="Payer role" value={formatLabel(details?.role)} />
          <DetailRow
            label="Transaction type"
            value={formatLabel(details?.transaction_type)}
          />
          <DetailRow label="Plan" value={formatLabel(details?.plan_type)} />
          <DetailRow label="Reference" value={details?.reference} />
          <DetailRow
            label="Paystack ID"
            value={details?.paystack_transaction_id}
          />
          <DetailRow
            label="Candidate limit"
            value={
              details?.candidate_limit != null
                ? String(details.candidate_limit)
                : null
            }
          />
          <DetailRow
            label="Searches used"
            value={
              details?.search_count != null && Number(details.search_count) > 0
                ? String(details.search_count)
                : null
            }
          />
          <DetailRow
            label="Paid at"
            value={details?.paid_at ? formatDateTime(details.paid_at) : null}
          />
          <DetailRow
            label="Created at"
            value={details?.created_at ? formatDateTime(details.created_at) : null}
          />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionDetailModal;
