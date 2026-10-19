import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Country from 'country-state-city/lib/country.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { countryNameToIso2, formatPhoneAsYouType } from '../../utils/phoneUtils';
import {
  getPortaledMenuStyle,
  usePortaledMenu,
} from '../../hooks/usePortaledMenu';

const countryOptions = Country.getAllCountries()
  .filter((c) => c.phonecode)
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Collects country code + national number; emits E.164 to parent.
 * Closed field shows +code only; open list shows +code and country name.
 */
export default function PhoneInput({
  value = '',
  onChange,
  countryName = '',
  disabled = false,
  className = '',
  compact = true,
}) {
  const defaultIso = countryNameToIso2(countryName) || 'NG';
  const rootRef = useRef(null);

  const [countryIso, setCountryIso] = useState(defaultIso);
  const [national, setNational] = useState('');
  const [codeOpen, setCodeOpen] = useState(false);
  const { triggerRef, menuRef, menuPos } = usePortaledMenu({
    isOpen: codeOpen,
    onClose: () => setCodeOpen(false),
    minWidth: compact ? 256 : 320,
    maxHeight: 208,
    extraContainRefs: [rootRef],
  });

  const selectedCountry = useMemo(
    () => countryOptions.find((c) => c.isoCode === countryIso) ?? countryOptions.find((c) => c.isoCode === 'NG'),
    [countryIso],
  );

  useEffect(() => {
    const iso = countryNameToIso2(countryName);
    if (iso) setCountryIso(iso);
  }, [countryName]);

  useEffect(() => {
    if (!value) {
      setNational('');
      return;
    }
    const parsed = parsePhoneNumberFromString(String(value).trim());
    if (parsed?.isValid()) {
      setCountryIso(parsed.country || defaultIso);
      setNational(parsed.nationalNumber);
      return;
    }
    setNational(String(value).replace(/\D/g, ''));
  }, [value, defaultIso]);

  const emitE164 = (iso, nationalDigits) => {
    const digits = String(nationalDigits).replace(/\D/g, '');
    if (!digits) {
      onChange?.('');
      return;
    }
    const parsed = parsePhoneNumberFromString(digits, iso);
    onChange?.(parsed?.isValid() ? parsed.format('E.164') : '');
  };

  const selectCountry = (iso) => {
    setCountryIso(iso);
    setCodeOpen(false);
    emitE164(iso, national);
  };

  const handleNationalChange = (e) => {
    const raw = e.target.value.replace(/[^\d\s]/g, '');
    const digits = raw.replace(/\D/g, '');
    const formatted = formatPhoneAsYouType(digits, countryIso);
    setNational(formatted);
    emitE164(countryIso, digits);
  };

  const codeWidth = compact ? 'w-[5.25rem]' : 'sm:w-[11rem] w-full';
  const codeText = compact ? 'text-xs font-semibold' : 'text-sm';

  return (
    <div ref={rootRef} className={`flex items-center gap-2 w-full min-w-0 ${className}`.trim()}>
      <div className={`relative shrink-0 ${codeWidth}`}>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-label="Country calling code"
          aria-expanded={codeOpen}
          aria-haspopup="listbox"
          title={selectedCountry ? `${selectedCountry.name} (+${selectedCountry.phonecode})` : 'Country code'}
          onClick={() => !disabled && setCodeOpen((open) => !open)}
          className={`w-full h-11 bg-white border border-gray-300 rounded-xl pl-2 pr-6 text-left text-[#1A3E32] ${codeText} focus:outline-none focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {selectedCountry ? `+${selectedCountry.phonecode}` : '+…'}
        </button>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-gray-500"
          aria-hidden
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform ${codeOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {codeOpen &&
          menuPos &&
          typeof document !== 'undefined' &&
          createPortal(
            <ul
              ref={menuRef}
              role="listbox"
              aria-label="Country calling codes"
              className="overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              style={{
                ...getPortaledMenuStyle(menuPos),
                maxHeight: menuPos.maxHeight,
              }}
            >
              {countryOptions.map((c) => {
                const selected = c.isoCode === countryIso;
                return (
                  <li key={c.isoCode} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => selectCountry(c.isoCode)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[#F5F5F5] ${
                        selected ? 'bg-[#1A3E32]/10 font-medium text-[#1A3E32]' : 'text-gray-700'
                      }`}
                    >
                      <span className="font-semibold tabular-nums">+{c.phonecode}</span>
                      <span className="ml-2 text-gray-600">{c.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body,
          )}
      </div>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={national}
        onChange={handleNationalChange}
        disabled={disabled}
        placeholder={selectedCountry?.isoCode === 'NG' ? '806 902 7874' : 'Phone number'}
        className="flex-1 min-w-0 h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent placeholder-gray-400 disabled:opacity-60"
      />
    </div>
  );
}
