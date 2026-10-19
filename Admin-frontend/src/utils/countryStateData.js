import { Country, State, City } from "country-state-city";

let cachedCountryNames = null;

const DELIMITER = "|";

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

export function findStateByName(countryName, stateName) {
  const country = findCountryByName(countryName);
  if (!country || !stateName?.trim()) return null;

  const normalized = stateName.trim().toLowerCase();
  return (
    State.getStatesOfCountry(country.isoCode).find(
      (state) => state.name.toLowerCase() === normalized,
    ) ?? null
  );
}

/** State/province names for a country (by country display name). */
export function getStateNamesByCountryName(countryName) {
  const country = findCountryByName(countryName);
  if (!country) return [];
  try {
    const states = State.getStatesOfCountry(country.isoCode);
    if (!states?.length) return [];
    return states.map((s) => s.name).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/** City names for a country + state (by display names). */
export function getCityNamesByCountryAndState(countryName, stateName) {
  const country = findCountryByName(countryName);
  const state = findStateByName(countryName, stateName);
  if (!country || !state) return [];

  try {
    const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
    if (!cities?.length) return [];
    return cities.map((city) => city.name).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/** States for multiple selected countries. */
export function getStateOptionsForCountries(countryNames = []) {
  const options = [];

  for (const countryName of countryNames) {
    for (const stateName of getStateNamesByCountryName(countryName)) {
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

/** Cities for multiple selected states (state keys: country|state). */
export function getCityOptionsForStates(stateKeys = []) {
  const options = [];

  for (const stateKey of stateKeys) {
    const { country, state } = parseStateKey(stateKey);
    if (!country || !state) continue;

    for (const cityName of getCityNamesByCountryAndState(country, state)) {
      options.push({
        country,
        state,
        city: cityName,
        key: buildCityKey(country, state, cityName),
        label: `${cityName} (${state}, ${country})`,
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
