import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

export default function Hyperlinks() {
  const borderStyle = "hidden sm:block w-0.5 h-4 bg-[#1A3E32] shrink-0";
  const linkStyle = "whitespace-nowrap hover:underline";

  return (
    <div className="text-xs sm:text-[10px] font-extrabold text-[#1A3E32] flex flex-col items-center mt-2 px-4 py-2 w-full">
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 sm:gap-x-2 sm:flex-nowrap max-w-full">
        <Link to="/about" className={linkStyle}>
          About
        </Link>
        <div className={borderStyle} aria-hidden="true" />
        <Link to="/Teams" className={linkStyle}>
          Team
        </Link>
        <div className={borderStyle} aria-hidden="true" />
        <Link to="/privacy-policy" className={linkStyle}>
          Privacy Policy
        </Link>
        <div className={borderStyle} aria-hidden="true" />
        <HashLink to="/about#how-to-use-bejite" className={linkStyle}>
          How to use Bejite
        </HashLink>
        <div className={borderStyle} aria-hidden="true" />
        <Link to="/security-advice" className={linkStyle}>
          Security
        </Link>
        <div className={borderStyle} aria-hidden="true" />
        <Link to="/contact" className={linkStyle}>
          Contact
        </Link>
      </div>
      <p className="mt-2 text-center text-[10px] sm:text-[10px]">
        All rights reserved Bejite © {new Date().getFullYear()}
      </p>
    </div>
  );
}
