import Country from "country-state-city/lib/country.js";

let cachedCountryNames = null;
let stateApiPromise = null;

const DELIMITER = "|";

export const NIGERIA_COUNTRY_NAME = "Nigeria";

async function getStateApi() {
  if (!stateApiPromise) {
    stateApiPromise = import("country-state-city/lib/state.js").then(
      (module) => module.default,
    );
  }
  return stateApiPromise;
}

/** All country display names, sorted alphabetically. */
export function getAllCountryNames() {
  if (!cachedCountryNames) {
    cachedCountryNames = Country.getAllCountries()
      .map((c) => c.name)
      .sort((a, b) => a.localeCompare(b));
  }
  return cachedCountryNames;
}

export function findCountryByName(countryName) {
  if (!countryName?.trim()) return null;
  const normalized = countryName.trim().toLowerCase();
  return (
    Country.getAllCountries().find(
      (c) => c.name.toLowerCase() === normalized,
    ) ?? null
  );
}

export async function findStateByName(countryName, stateName) {
  const country = findCountryByName(countryName);
  if (!country || !stateName?.trim()) return null;

  const State = await getStateApi();
  const normalized = stateName.trim().toLowerCase();
  return (
    State.getStatesOfCountry(country.isoCode).find(
      (state) => state.name.toLowerCase() === normalized,
    ) ?? null
  );
}

/** State/province names for a country (by country display name). */
export async function getStateNamesByCountryName(countryName) {
  const country = findCountryByName(countryName);
  if (!country) return [];

  try {
    const State = await getStateApi();
    const states = State.getStatesOfCountry(country.isoCode);
    if (!states?.length) return [];
    return states.map((s) => s.name).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/** States for multiple selected countries. */
export async function getStateOptionsForCountries(countryNames = []) {
  const options = [];

  for (const countryName of countryNames) {
    const stateNames = await getStateNamesByCountryName(countryName);
    for (const stateName of stateNames) {
      options.push({
        country: countryName,
        state: stateName,
        key: buildStateKey(countryName, stateName),
        label: `${stateName} (${countryName})`,
      });
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
}

export function buildStateKey(countryName, stateName) {
  return `${countryName}${DELIMITER}${stateName}`;
}

export function buildCityKey(countryName, stateName, cityName) {
  return `${countryName}${DELIMITER}${stateName}${DELIMITER}${cityName}`;
}

export function parseStateKey(stateKey = "") {
  const [country, ...rest] = String(stateKey).split(DELIMITER);
  return { country: country || "", state: rest.join(DELIMITER) || "" };
}

export function parseCityKey(cityKey = "") {
  const parts = String(cityKey).split(DELIMITER);
  return {
    country: parts[0] || "",
    state: parts[1] || "",
    city: parts.slice(2).join(DELIMITER) || "",
  };
}

export function stateKeyBelongsToCountry(stateKey, countryName) {
  return parseStateKey(stateKey).country === countryName;
}

export function cityKeyBelongsToState(cityKey, stateKey) {
  const city = parseCityKey(cityKey);
  const state = parseStateKey(stateKey);
  return city.country === state.country && city.state === state.state;
}

export function buildLgaKey(countryName, stateName, lgaName) {
  return `${countryName}${DELIMITER}${stateName}${DELIMITER}${lgaName}`;
}

export function parseLgaKey(lgaKey = "") {
  const parts = String(lgaKey).split(DELIMITER);
  return {
    country: parts[0] || "",
    state: parts[1] || "",
    lga: parts.slice(2).join(DELIMITER) || "",
  };
}

export function lgaKeyBelongsToState(lgaKey, stateKey) {
  const lga = parseLgaKey(lgaKey);
  const state = parseStateKey(stateKey);
  return lga.country === state.country && lga.state === state.state;
}

export function hasNigeriaSelected(countryNames = []) {
  return countryNames.some(
    (country) => country.trim().toLowerCase() === "nigeria",
  );
}

/** LGAs for selected Nigerian states (state keys: country|state). */
export function getLgaOptionsForStates(stateKeys = [], getLgas) {
  if (typeof getLgas !== "function") return [];

  const options = [];

  for (const stateKey of stateKeys) {
    const { country, state } = parseStateKey(stateKey);
    if (country !== NIGERIA_COUNTRY_NAME || !state) continue;

    const lgas = getLgas(state) || [];
    for (const lgaName of lgas) {
      options.push({
        country,
        state,
        lga: lgaName,
        key: buildLgaKey(country, state, lgaName),
        label: `${lgaName} (${state})`,
      });
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
}
