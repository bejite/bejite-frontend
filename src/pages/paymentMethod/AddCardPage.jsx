import React from "react";
import PaymentPageHeader from "../../components/PaymentPageHeader";
import { FaCreditCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";



const spanStyle = 'bg-white rounded-2xl px-2'
const imgStyle = 'w-7'
const fieldsetStyle = 'p-4 border border-black rounded-[10px] max-h-[60px] flex flex-col justify-center'
const legendStyle = 'font-semibold text-[12px] p-3'
const inputStyle = 'w-full focus:outline-none mb-3'

export default function AddCard() {
  const navigate = useNavigate();

  function handleButtonClick() {
    navigate('/payment-processing');
  }

  return (
    <div className="bg-white">
      <PaymentPageHeader />

      <section className="bg-[#F5F5F5] border border-[#1A3E32] mt-1 max-w-[1000px] max-h-full m-auto px-4.5 py-3.5 text-[#333333]">
        <p className="capitalize  font-normal text-2xl text-center mt-6">Add your card to complete payment</p>
        <p className="font-normal text-[12px] text-center mt-2.5">Securely enter your card details to activate your selected plan and gain access to Bejite's advanced recruitment tools</p>
        <div className="max-w-[640px] max-h-[461px] rounded-[10px] bg-neutral-300 border-[#16730F] border-1 m-auto mt-8 px-9 py-4 place-items-center">
          <form className="mt-6">
            <div className="flex justify-between">
              <p className="before:content-[''] before:inline-block before:w-3 before:h-3 before:bg-[#16730F] before:border-2 before:border-black before:rounded-full before:mr-2 font-semibold ">Credit or debit card</p>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                <span className={spanStyle}>
                  <img
                    src="/assets/images/paymenticons/visa.svg"
                    alt="Visa icon"
                    className={imgStyle} />
                </span>

                <span className={spanStyle}>
                  <img
                    src="/assets/images/paymenticons/mastercard.svg"
                    alt="Mastercard icon"
                    className={imgStyle} />
                </span>

                <span className={spanStyle}>
                  <img
                    src="/assets/images/paymenticons/paypal.svg"
                    alt="PayPal icon"
                    className={imgStyle} />
                </span>

                <span className={spanStyle}>
                  <img
                    src="/assets/images/paymenticons/google-pay.svg"
                    alt="GooglePay icon"
                    className={imgStyle} />
                </span>

                <span className={spanStyle}>
                  <img
                    src="/assets/images/paymenticons/apple-pay.svg"
                    alt="ApplePay icon"
                    className={imgStyle} />
                </span>
              </div>
            </div>
            <div className="mt-10">
              <fieldset className={fieldsetStyle}>
                <legend className={legendStyle}>Cardholder name
                </legend>
                <input type="text" className={inputStyle} />
              </fieldset>

              <p className="italic font-medium text-[10px] mt-3">Please input the exact name printed on your card</p>

              <fieldset className={fieldsetStyle}>
                <legend className={legendStyle}>Card number</legend>
                <div className="relative flex gap-2">
                  <FaCreditCard
                      className="text-[#16730F] mt-1" />
                  <input type="text" className={inputStyle} />
                  
                </div>

              </fieldset>

              <div className="flex items-center justify-between gap-3.5">

                <fieldset className={fieldsetStyle}>
                  <legend className={legendStyle}>Expiry Date</legend>
                  <input type="tel" maxLength="5" placeholder="MM/YY" className={inputStyle} />
                </fieldset>

                <fieldset className={fieldsetStyle}>
                  <legend className={legendStyle}>CVC</legend>
                  <input type="tel" maxLength="3" pattern="\d{3}" className={inputStyle} />
                </fieldset>

                <img src="/assets/images/paymenticons/cvc.png" alt="CVC section of credit card icon" className="max-h-20 min-h-10 min-w-15 mt-7" />

              </div>
            </div>
            <input type="checkbox" className="w-5 h-5 mt-6 mb-4 mr-4 p-0.5" />
            <label className="text-[#1A3E32] font-normal">Save card details</label>
          </form>
        </div>
        <div className="mt-14">
          <p className="text-[#16730F] font-semibold ">Payment Authorization & Agreement</p>
          <p className="font-semibold text-[10px] mt-6">By submitting your card information, you agree to be charged the exact amount shown for your selected plan. <br /> All payments are securely encrypted. This is a one-time charge no recurring fees unless you choose to fund your account again.
          </p>
          <p className="font-semibold text-[10px] mt-4">Amount to be Debited: <span className="font-bold text-[10px] text-[#16730F]">₦15,213.10</span> (Basic Plan - Recruit up to 20 people)
          </p>
          {/* USD not activated yet
          <p className="italic font-semibold text-[6px]"> $10.00 USD  ≈ ₦15,213.10
            (1 USD = ₦1,521.31 current rate)</p>
          */}
          <ul className="font-semibold text-[8px] list-disc list-inside mt-6">
            <li>Your card details are securely processed using encrypted payment technology</li>
            <li>No hidden charges. This is a one-time debit for the plan you've selected</li>
            <li>You can upgrade your plan or fund again later through your Payment Account.</li>
          </ul>

          <input type="checkbox" className="w-3 h-3 mt-6 mr-1" />
          <label className="font-semibold text-[8px]"> I agree to the terms of payment and authorize this transaction.</label>

        </div>
        <div className="bg-[#16730F] text-white font-semibold text-[15px] m-auto p-5 max-w-lg text-center mt-10 cursor-pointer" onClick={handleButtonClick}>Pay ₦15,213.10</div>
      </section>
    </div>
  )
}