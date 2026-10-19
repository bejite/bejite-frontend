import React from "react";

const ASEPricingComparisonTable = () => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
      <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight text-center mb-4 sm:mb-6">
        Compare Subscriptions Tiers
      </h3>

      <p className="text-xs text-gray-400 text-center mb-3 sm:hidden">
        Swipe horizontally to compare plans →
      </p>

      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <table className="w-full text-sm text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="py-4 font-bold text-gray-400 uppercase tracking-wider text-xs w-[34%]">
                Feature Details
              </th>
              <th className="py-4 text-center text-[#1A3E32] font-black text-sm w-[22%]">
                Standard
              </th>
              <th className="py-4 text-center text-[#1A3E32] font-black text-sm w-[22%]">
                Premium
              </th>
              <th className="py-4 text-center text-[#1A3E32] font-black text-sm w-[22%]">
                Jumbo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Category: ASE Searches */}
            <tr>
              <td className="py-3.5 text-gray-500 font-semibold">
                Monthly ASE searches
              </td>
              <td className="py-3.5 text-center font-bold">5 Searches</td>
              <td className="py-3.5 text-center font-bold text-[#1A3E32]">
                20 Searches
              </td>
              <td className="py-3.5 text-center font-bold">60 Searches</td>
            </tr>
            <tr>
              <td className="py-3.5 text-gray-500 font-semibold">
                Candidates per search
              </td>
              <td className="py-3.5 text-center">10 Candidates</td>
              <td className="py-3.5 text-center">20 Candidates</td>
              <td className="py-3.5 text-center text-[#1A3E32] font-bold">
                30 Candidates
              </td>
            </tr>
            {/* Category: Job Posts */}
            <tr>
              <td className="py-3.5 text-gray-500 font-semibold">
                Job posts / month
              </td>
              <td className="py-3.5 text-center font-semibold">5 Posts</td>
              <td className="py-3.5 text-center font-semibold">20 Posts</td>
              <td className="py-3.5 text-center font-bold text-[#1A3E32]">
                Unlimited (Fair Use)
              </td>
            </tr>
            <tr>
              <td className="py-3.5 text-gray-500 font-semibold">
                Applicant access
              </td>
              <td className="py-3.5 text-center text-xs text-gray-500 leading-tight">
                Included before/after expiry
              </td>
              <td className="py-3.5 text-center font-semibold text-gray-700">
                Full Access
              </td>
              <td className="py-3.5 text-center font-semibold text-gray-700">
                Full Access
              </td>
            </tr>
            {/* Category: Perks */}
            <tr>
              <td className="py-3.5 text-gray-500 font-semibold">
                AdPro credits
              </td>
              <td className="py-3.5 text-center">₦10,000 Credit</td>
              <td className="py-3.5 text-center text-[#1A3E32] font-bold">
                ₦20,000 Credit
              </td>
              <td className="py-3.5 text-center">₦30,000 Credit</td>
            </tr>
            <tr>
              <td className="py-3.5 text-gray-500 font-semibold">
                Verified Badge
              </td>
              <td className="py-3.5 text-center text-gray-500">
                Not included
              </td>
              <td className="py-3.5 text-center text-gray-500">
                Not included
              </td>
              <td className="py-3.5 text-center text-gray-500">
                Not included
              </td>
            </tr>
            <tr>
              <td className="py-3.5 text-gray-500 font-semibold">
                Recruiting analytics
              </td>
              <td className="py-3.5 text-center">Monthly reports</td>
              <td className="py-3.5 text-center font-semibold">
                Enhanced monthly
              </td>
              <td className="py-3.5 text-center font-semibold text-[#1A3E32]">
                Advanced + trends
              </td>
            </tr>
            <tr>
              <td className="py-3.5 text-gray-500 font-semibold">
                Networking events
              </td>
              <td className="py-3.5 text-center">Access</td>
              <td className="py-3.5 text-center font-semibold">
                Priority access
              </td>
              <td className="py-3.5 text-center font-bold text-[#1A3E32]">
                VIP Access
              </td>
            </tr>
            <tr>
              <td className="py-3.5 text-gray-500 font-semibold">
                Support tier
              </td>
              <td className="py-3.5 text-center">Email support</td>
              <td className="py-3.5 text-center font-semibold">
                Priority email/chat
              </td>
              <td className="py-3.5 text-center font-bold text-[#1A3E32]">
                Dedicated support
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ASEPricingComparisonTable;
