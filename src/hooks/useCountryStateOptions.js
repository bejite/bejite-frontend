import { useEffect, useMemo, useState } from "react";
import { getAllCountryNames, getStateNamesByCountryName } from "../utils/countryStateData";

/**
 * Country list + dependent state list for a selected country name.
 * @param {string} selectedCountryName - current country field value
 */
export default function useCountryStateOptions(selectedCountryName = "") {
  const countries = useMemo(() => getAllCountryNames(), []);
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    if (!selectedCountryName?.trim()) {
      setStates([]);
      setLoadingStates(false);
      return;
    }

    let cancelled = false;
    setLoadingStates(true);

    getStateNamesByCountryName(selectedCountryName)
      .then((stateNames) => {
        if (!cancelled) setStates(stateNames);
      })
      .catch(() => {
        if (!cancelled) setStates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCountryName]);

  return { countries, states, loadingStates };
}
