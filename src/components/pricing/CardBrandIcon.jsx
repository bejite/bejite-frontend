import React from "react";
import { CreditCard } from "lucide-react";

const BRAND_ICON_MAP = {
  visa: "/assets/images/paymenticons/visa.svg",
  mastercard: "/assets/images/paymenticons/mastercard.svg",
  master: "/assets/images/paymenticons/mastercard.svg",
  paypal: "/assets/images/paymenticons/paypal.svg",
  "google-pay": "/assets/images/paymenticons/google-pay.svg",
  googlepay: "/assets/images/paymenticons/google-pay.svg",
  "apple-pay": "/assets/images/paymenticons/apple-pay.svg",
  applepay: "/assets/images/paymenticons/apple-pay.svg",
};

const normalizeBrand = (brand) =>
  String(brand || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const getCardBrandIconSrc = (brand) => {
  const normalized = normalizeBrand(brand);
  if (!normalized) return null;

  if (BRAND_ICON_MAP[normalized]) {
    return BRAND_ICON_MAP[normalized];
  }
  if (normalized.includes("master")) {
    return BRAND_ICON_MAP.mastercard;
  }
  if (normalized.includes("visa")) {
    return BRAND_ICON_MAP.visa;
  }

  return null;
};

const CardBrandIcon = ({ brand, className = "h-6 w-auto max-w-[40px]" }) => {
  const iconSrc = getCardBrandIconSrc(brand);

  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={`${brand || "Card"} logo`}
        className={`object-contain ${className}`}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center w-10 h-7 rounded bg-gray-200 text-gray-600"
      title={brand || "Card"}
    >
      <CreditCard className="w-4 h-4" />
    </div>
  );
};

export default CardBrandIcon;
