import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ELearningLayout,
  ELearningBackPill,
  CourseOrderSummaryCard,
  CheckoutRecipientCard,
  CardPaymentForm,
  CheckoutPriceBreakdown,
  PaymentSuccessCard,
  PaymentErrorAlert,
} from "../../../components/elearning";
import {
  getCourseById,
  processCoursePayment,
} from "../../../services/elearningService";
import { getUser, mergeAuthUsers } from "../../../utils/tokenManager";

export default function CourseCheckoutPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const reduxUser = useSelector((state) => state.auth?.user);
  const currentUser = useMemo(() => {
    const localUser = getUser();
    return mergeAuthUsers(localUser || {}, reduxUser || localUser || {});
  }, [reduxUser]);

  const [course, setCourse] = useState(() => getCourseById(courseId));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Payment Form States
  const [cardholderName, setCardholderName] = useState(
    currentUser?.name || currentUser?.fullName || "Amara Okafor"
  );
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("•••");
  const [agreed, setAgreed] = useState(true);
  const [shouldFail, setShouldFail] = useState(false);

  useEffect(() => {
    const loaded = getCourseById(courseId);
    setCourse(loaded);
  }, [courseId]);

  if (!course) return null;

  const handlePay = () => {
    if (!agreed) return;
    setIsProcessing(true);
    setErrorMessage("");

    setTimeout(() => {
      setIsProcessing(false);
      const result = processCoursePayment(course.id, {
        cardholderName,
        cardNumber,
        shouldFail,
      });

      if (result.success) {
        setIsSuccess(true);
        setCourse(result.course);
      } else {
        setErrorMessage(
          result.message ||
            "The card simulation declined this transaction or network timed out. No funds were deducted and course access has not been enrolled."
        );
      }
    }, 600);
  };

  const handleTryAgain = () => {
    setErrorMessage("");
    setShouldFail(false);
  };

  return (
    <ELearningLayout activeNavId="explore">
      <div className="space-y-6 max-w-5xl">
        {/* Top Back Pill */}
        <div>
          <ELearningBackPill
            label="Back to Courses"
            onClick={() =>
              navigate(`/e-learning/jobseeker/courses/${course.id}`)
            }
          />
        </div>

        {/* Success View (Image 4) */}
        {isSuccess ? (
          <PaymentSuccessCard
            amount={course.priceBadge || "N50,000"}
            onStartLearning={() =>
              navigate(`/e-learning/jobseeker/courses/${course.id}/learn`)
            }
            onGoToMyLearning={() => navigate("/e-learning/jobseeker/my-learning")}
          />
        ) : (
          /* Normal Checkout View (Image 3 & Image 5) */
          <div className="space-y-5">
            {/* Page Header Card */}
            <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112A20] tracking-tight">
                Checkout
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[#5A6D62] leading-relaxed">
                Review your course order and choose a demonstration payment method to confirm enrolment.
              </p>
            </div>

            {/* Error Alert Banner when simulated failure occurs (Image 5) */}
            {errorMessage && (
              <PaymentErrorAlert
                title="Payment Simulation Unsuccessful"
                message={errorMessage}
                onTryAgain={handleTryAgain}
                onReturnToCourse={() =>
                  navigate(`/e-learning/jobseeker/courses/${course.id}`)
                }
              />
            )}

            {/* Two-Column Checkout Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
              {/* Left Column */}
              <div className="space-y-5">
                <CourseOrderSummaryCard course={course} />

                <CheckoutRecipientCard
                  learnerName={cardholderName}
                  learnerEmail={
                    currentUser?.email || "amara.okafor@bejite.talent"
                  }
                />

                <CardPaymentForm
                  cardholderName={cardholderName}
                  setCardholderName={setCardholderName}
                  cardNumber={cardNumber}
                  setCardNumber={setCardNumber}
                  expiryDate={expiryDate}
                  setExpiryDate={setExpiryDate}
                  cvv={cvv}
                  setCvv={setCvv}
                  agreed={agreed}
                  setAgreed={setAgreed}
                  courseTitle={course.title}
                  priceBadge={course.priceBadge || "N50,000"}
                  shouldFail={shouldFail}
                  setShouldFail={setShouldFail}
                />
              </div>

              {/* Right Column */}
              <div className="lg:sticky lg:top-6">
                <CheckoutPriceBreakdown
                  coursePrice={course.priceBadge || "N50,000"}
                  isProcessing={isProcessing}
                  disabled={!agreed}
                  onPay={handlePay}
                  onCancel={() =>
                    navigate(`/e-learning/jobseeker/courses/${course.id}`)
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ELearningLayout>
  );
}

