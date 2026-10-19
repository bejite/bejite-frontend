import { parseStateKey } from "./countryStateData.js";
import { fetchCities } from "../services/geoApi.js";

/** City names for a country + state (by display names). */
export async function getCityNamesByCountryAndState(countryName, stateName) {
  if (!countryName?.trim() || !stateName?.trim()) return [];

  try {
    const { data } = await fetchCities({
      country: countryName.trim(),
      state: stateName.trim(),
      limit: 500,
    });
    return (data?.cities ?? []).map((city) => city.city).sort((a, b) =>
      a.localeCompare(b),
    );
  } catch {
    return [];
  }
}

/** Cities for multiple selected states (state keys: country|state). */
export async function getCityOptionsForStates(stateKeys = []) {
  if (!stateKeys.length) return [];

  const batches = await Promise.all(
    stateKeys.map(async (stateKey) => {
      const { country, state } = parseStateKey(stateKey);
      if (!country || !state) return [];

      try {
        const { data } = await fetchCities({
          country,
          state,
          limit: 500,
        });
        return data?.cities ?? [];
      } catch {
        return [];
      }
    }),
  );

  return batches
    .flat()
    .sort((a, b) => a.label.localeCompare(b.label));
}
