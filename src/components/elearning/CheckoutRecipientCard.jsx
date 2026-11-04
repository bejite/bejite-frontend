import React from "react";

/**
 * Reusable Enrolment Recipient Card (matching Image 3 & Image 5).
 * Displays Learner Name and Registered Email in a 2-column layout.
 */
export default function CheckoutRecipientCard({ learnerName, learnerEmail }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
        ENROLMENT RECIPIENT
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div>
          <p className="text-[11px] font-medium text-gray-400">Learner Name</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">
            {learnerName || "Amara Okafor"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-gray-400">Registered Email</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5 break-all">
            {learnerEmail || "amara.okafor@bejite.talent"}
          </p>
        </div>
      </div>
    </div>
  );
}

