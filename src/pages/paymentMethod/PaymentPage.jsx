import React from "react";
import PaymentPageHeader from "../../components/PaymentPageHeader";
// import { useNavigate } from "react-router-dom";
import { useState } from "react";
// import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";
import Loader from "../../components/ui/Loader";

export default function PaymentPage() {
  // const navigate = useNavigate();
  // const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpgradeClick(amount) {
    if (isLoading) return;

    // console.log("[Paystack] Upgrade clicked with amount:", amount);
    setIsLoading(true);

    try {
      const userData = localStorage.getItem("user");
      // console.log("[Paystack] Raw user data from localStorage:", userData);

      if (!userData) {
        console.warn("[Paystack] User not logged in");
        alert("User not logged in");
        return;
      }

      const parsedUser = JSON.parse(userData);
      // console.log("[Paystack] Parsed user:", parsedUser);

      const email = parsedUser?.email;

      if (!email) {
        console.warn("[Paystack] Email missing on user object");
        alert("User email not found");
        return;
      }

      // console.log("[Paystack] Initializing payment with:", {
      //   email,
      //   amount,
      // });

      const res = await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/api/paystack/init`,
        { amount, email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // console.log("[Paystack] Init response:", res);

      const authorizationUrl = res?.data?.data?.authorization_url;

      if (!authorizationUrl) {
        console.error("[Paystack] Authorization URL missing:", res?.data);
        alert("Payment URL not returned");
        return;
      }

      console.log("[Paystack] Redirecting to Paystack:", authorizationUrl);

      // Redirect to Paystack
      window.location.href = authorizationUrl;
    } catch (err) {
      console.error("[Paystack] Init error:", err);
      alert("Payment initialization failed");
    } finally {
      setIsLoading(false);
    }
  }

  const cardClass =
    "bg-white w-full h-full border border-[#1A3E32] px-5 sm:px-6 py-8 sm:py-10 flex flex-col";
  const planTitleClass = "font-normal text-[#16730F] text-xl sm:text-2xl";
  const planSubtitleClass =
    "font-medium text-[#1A3E32] text-sm sm:text-base leading-snug break-words";
  const priceClass =
    "font-medium text-4xl sm:text-5xl text-[#1A3E32] mt-5 mb-5 leading-none";
  const priceUnitClass = "font-normal text-base sm:text-lg align-top";
  const descriptionClass =
    "font-normal text-[#1A3E32] text-sm sm:text-base leading-relaxed break-words";
  const buttonClass =
    "bg-[#16730F] text-white font-medium text-sm sm:text-base text-center w-full h-11 py-2.5 mt-5 mb-5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";
  const sectionLabelClass = "font-normal text-sm sm:text-base text-[#16730F] mt-auto";
  const listClass =
    "text-[#1A3E32] text-sm sm:text-base font-medium list-disc list-outside pl-5 mt-3 space-y-2 leading-relaxed break-words";

  const plans = [
    {
      name: "Free Plan",
      subtitle:
        "Monthly free ASE quota for employers — no card required",
      price: "0",
      description:
        "Use Bejite recruiting each month with included searches, job posts, recruitment exercises, and AdPro credit.",
      buttonLabel: "Use Free Quota",
      sectionLabel: "Includes each month",
      items: [
        "5 ASE searches (20 results each).",
        "5 job posts and 2 recruitment exercises.",
        "₦5,000 AdPro credit.",
        "When used up, wait until next month or subscribe to continue.",
      ],
    },
    {
      name: "Starter Plan",
      subtitle: "Recruit up to 20 people.",
      price: "10",
      description: "Ideal for: Small businesses or occasional recruiters.",
      buttonLabel: "Upgrade",
      amount: 10000,
      sectionLabel: "Benefits",
      items: [
        "20 Recruitment Slots - Source up to 20 candidates.",
        "Filters - Access essential search filters (skills, location).",
        "Candidate Profiles - View full profiles and CV details.",
        "Email Alerts - Get notified for new matching candidates.",
        "24/7 Support - Priority email support.",
      ],
    },
    {
      name: "Standard Plan",
      subtitle: "Recruit up to 60 people.",
      price: "30",
      description: "Ideal for: Growing teams and frequent recruiters.",
      buttonLabel: "Upgrade",
      amount: 30000,
      sectionLabel: "Benefits",
      items: [
        "60 Recruitment Slots - Scale your hiring effortlessly.",
        "Filters - Access essential search filters (skills, location).",
        "Bulk Messaging - Contact multiple candidates at once.",
        "Candidate Profiles - View full profiles and CV details.",
        "Email Alerts - Get notified for new matching candidates.",
        "24/7 Support - Priority email support.",
      ],
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {isLoading && <Loader />}
      <PaymentPageHeader />

      <section className="bg-[#F5F5F5] border border-[#1A3E32] mt-1 max-w-[1000px] w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] lg:w-full m-auto px-4 sm:px-6 py-6 sm:py-8 pb-10">
        <p className="font-fredoka text-[#333333] font-normal text-center text-xl sm:text-2xl mt-6 sm:mt-12">
          Choose the perfect plan
        </p>
        <p className="text-center text-sm sm:text-base px-2 sm:px-0 mt-2 leading-relaxed">
          Unlock Advanced Recruitment With Bejite's Flexible Plans
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12 w-full items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`${cardClass} last:md:col-span-2 last:md:max-w-md last:md:justify-self-center last:lg:col-span-1 last:lg:max-w-none last:lg:justify-self-stretch`}
            >
              <p className={planTitleClass}>{plan.name}</p>
              <p className={`${planSubtitleClass} mt-2`}>{plan.subtitle}</p>
              <p className={priceClass}>
                {plan.price}
                {/* USD not activated yet — <span className={priceUnitClass}>us$</span> */}
                <span className={priceUnitClass}>₦</span>
              </p>
              <p className={descriptionClass}>{plan.description}</p>
              <button
                type="button"
                disabled={isLoading && plan.amount}
                className={buttonClass}
                onClick={
                  plan.amount
                    ? () => handleUpgradeClick(plan.amount)
                    : undefined
                }
              >
                {plan.buttonLabel}
              </button>
              <p className={sectionLabelClass}>{plan.sectionLabel}</p>
              <ul className={listClass}>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
