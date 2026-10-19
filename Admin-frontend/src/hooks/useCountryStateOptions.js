import { useMemo } from "react";
import {
  getAllCountryNames,
  getStateNamesByCountryName,
} from "../utils/countryStateData";

/**
 * Country list + dependent state list for a selected country name.
 * @param {string} selectedCountryName - current country field value
 */
export default function useCountryStateOptions(selectedCountryName = "") {
  const countries = useMemo(() => getAllCountryNames(), []);

  const states = useMemo(
    () => getStateNamesByCountryName(selectedCountryName),
    [selectedCountryName],
  );

  return { countries, states };
}
