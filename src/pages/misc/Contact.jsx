import React, { useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  Mail,
  Phone,
  Send,
  User,
  AtSign,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import axiosInstance from "../../utils/axiosInstance";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !email || !message) {
      toast.error("Name, email, and message are required.");
      return;
    }
    if (message.length < 10) {
      toast.error("Message must be at least 10 characters.");
      return;
    }

    setSending(true);
    try {
      const { data } = await axiosInstance.post("/api/contact", {
        name,
        email,
        message,
        website: formData.website || "",
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to send message");
      }

      setSent(true);
      setFormData({ name: "", email: "", message: "", website: "" });
      toast.success(
        data.message || "Message sent. Our team will get back to you soon.",
      );
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      const messageText =
        err.response?.data?.message ||
        err.message ||
        "Failed to send message. Please try again.";
      toast.error(messageText);
    } finally {
      setSending(false);
    }
  };

  const socials = [
    {
      href: "https://facebook.com",
      icon: FaFacebook,
      label: "Facebook",
      hoverColor: "hover:bg-blue-600 hover:text-white hover:border-blue-600",
    },
    {
      href: "https://x.com",
      icon: FaXTwitter,
      label: "Twitter",
      hoverColor: "hover:bg-gray-900 hover:text-white hover:border-gray-900",
    },
    {
      href: "https://instagram.com",
      icon: FaInstagram,
      label: "Instagram",
      hoverColor: "hover:bg-pink-600 hover:text-white hover:border-pink-600",
    },
    {
      href: "https://linkedin.com",
      icon: FaLinkedin,
      label: "LinkedIn",
      hoverColor: "hover:bg-blue-700 hover:text-white hover:border-blue-700",
    },
  ];

  return (
    <NewsFeedLayout showSidebars={false}>
      {/* <AboutPageHeader headerText="CONTACT US" /> */}
      <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 sm:pb-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A3E32] tracking-tight">
            Get in Touch
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed px-1">
            Have a question, feedback, or partnership inquiry? We'd love to hear
            from you. Fill out the form below and our team will respond within
            24 hours.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            <div className="lg:col-span-3 min-w-0">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
                <div className="bg-[#1A3E32] px-5 py-5 sm:px-8 sm:py-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Send className="w-5 h-5 text-[#6B8E23]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-bold text-lg sm:text-xl">
                        Send a Message
                      </h3>
                      <p className="text-green-100/70 text-sm mt-1">
                        We typically respond within a few hours
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="relative p-5 sm:p-8 space-y-5 sm:space-y-6">
                  {/* Honeypot — leave empty; hidden from real users */}
                  <div
                    className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
                    aria-hidden="true"
                  >
                    <label htmlFor="contact-website">Website</label>
                    <input
                      id="contact-website"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={200}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/20 focus:border-[#1A3E32] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <AtSign className="w-4 h-4 text-gray-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={255}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/20 focus:border-[#1A3E32] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/20 focus:border-[#1A3E32] focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-[#1A3E32] text-white py-4 rounded-xl font-semibold text-sm tracking-wide hover:bg-[#163428] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#1A3E32]/20"
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : sent ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Message Sent!
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-5 sm:p-6 space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-[#1A3E32] mb-4 sm:mb-5">
                  Contact Information
                </h4>

                <a
                  href="mailto:complaint@bejite.com"
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 group-hover:bg-[#1A3E32] group-hover:border-[#1A3E32] transition-colors">
                    <Mail className="w-5 h-5 text-[#16730F] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-[#1A3E32] mt-0.5 group-hover:underline break-all">
                      complaint@bejite.com
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+2348068735953"
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-[#1A3E32] group-hover:border-[#1A3E32] transition-colors">
                    <Phone className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Phone
                    </p>
                    <p className="text-sm font-semibold text-[#1A3E32] mt-0.5">
                      +234 806 873 5953
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Response Time
                    </p>
                    <p className="text-sm font-semibold text-[#1A3E32] mt-0.5">
                      Within 24 hours
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Mon — Fri, 9am — 6pm WAT
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-5 sm:p-6">
                <h4 className="text-base sm:text-lg font-bold text-[#1A3E32] mb-3 sm:mb-4">
                  Follow Us
                </h4>
                <p className="text-sm text-gray-500 mb-4 sm:mb-5">
                  Stay connected with the latest updates and community news.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {socials.map(({ href, icon: Icon, label, hoverColor }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 text-gray-600 transition-all duration-200 min-w-0 ${hoverColor} group`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium truncate">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </NewsFeedLayout>
  );
}
