import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  AsYouType,
} from 'libphonenumber-js/min';
import { findCountryByName } from './countryStateData';

export function countryNameToIso2(countryName) {
  return findCountryByName(countryName)?.isoCode ?? undefined;
}

/** Canonical storage: E.164 (+2348069027874). */
export function normalizePhoneE164(phone, countryName) {
  if (phone == null || String(phone).trim() === '') return '';

  const defaultCountry = countryNameToIso2(countryName);
  const raw = String(phone).trim();

  let parsed = parsePhoneNumberFromString(raw, defaultCountry);
  if (parsed?.isValid()) return parsed.format('E.164');

  const digitsOnly = raw.replace(/\D/g, '');
  if (digitsOnly) {
    parsed = parsePhoneNumberFromString(`+${digitsOnly}`, defaultCountry);
    if (parsed?.isValid()) return parsed.format('E.164');

    if (defaultCountry) {
      parsed = parsePhoneNumberFromString(digitsOnly, defaultCountry);
      if (parsed?.isValid()) return parsed.format('E.164');
    }
  }

  return '';
}

export function formatDisplayPhone(phone, countryName) {
  if (phone == null || String(phone).trim() === '') return null;

  const defaultCountry = countryNameToIso2(countryName);
  const raw = String(phone).trim();

  let parsed = parsePhoneNumberFromString(raw, defaultCountry);
  if (!parsed?.isValid()) {
    const e164 = normalizePhoneE164(raw, countryName);
    if (e164) parsed = parsePhoneNumberFromString(e164);
  }

  if (parsed?.isValid()) return parsed.formatInternational();
  return raw || null;
}

export function formatPhoneForStorage(phone, countryName) {
  return normalizePhoneE164(phone, countryName);
}

export function isPhoneValid(phone, countryName) {
  if (phone == null || String(phone).trim() === '') return false;
  const defaultCountry = countryNameToIso2(countryName);
  return isValidPhoneNumber(String(phone).trim(), defaultCountry);
}

/** Format national digits as user types (UI only). */
export function formatPhoneAsYouType(nationalDigits, countryIso) {
  if (!nationalDigits) return '';
  const formatter = new AsYouType(countryIso || 'NG');
  return formatter.input(nationalDigits);
}

export function splitPhoneForInput(phoneE164, fallbackCountryIso = 'NG') {
  if (!phoneE164) {
    return { countryIso: fallbackCountryIso, national: '', callingCode: '' };
  }

  const parsed = parsePhoneNumberFromString(String(phoneE164).trim());
  if (parsed?.isValid()) {
    return {
      countryIso: parsed.country || fallbackCountryIso,
      national: parsed.nationalNumber,
      callingCode: `+${parsed.countryCallingCode}`,
    };
  }

  return { countryIso: fallbackCountryIso, national: '', callingCode: '' };
}
