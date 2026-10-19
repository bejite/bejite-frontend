import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import {
  getPortaledMenuStyle,
  usePortaledMenu,
} from "../../hooks/usePortaledMenu";
import {
  getAllCountryNames,
  getStateOptionsForCountries,
  getLgaOptionsForStates,
  hasNigeriaSelected,
  stateKeyBelongsToCountry,
  cityKeyBelongsToState,
  lgaKeyBelongsToState,
} from "../../utils/countryStateData";
import { getCityOptionsForStates } from "../../utils/countryCityData";

const SearchableMultiSelect = ({
  label,
  placeholder,
  emptyMessage,
  options,
  selectedValues,
  onChange,
  getOptionValue,
  getOptionLabel,
}) => {
  const containerRef = useRef(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { triggerRef, menuRef, menuPos } = usePortaledMenu({
    isOpen,
    onClose: () => setIsOpen(false),
    maxHeight: 192,
    extraContainRefs: [containerRef],
  });

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      getOptionLabel(option).toLowerCase().includes(query),
    );
  }, [options, search, getOptionLabel]);

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }
    onChange([...selectedValues, value]);
  };

  const openDropdown = () => setIsOpen(true);

  return (
    <div
      className={`mb-5 relative ${isOpen ? "z-[200]" : "z-0"}`}
      ref={containerRef}
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedValues.map((value) => {
            const option = options.find((item) => getOptionValue(item) === value);
            const labelText = option
              ? getOptionLabel(option)
              : value.includes("|")
                ? value.split("|").pop()
                : value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleValue(value)}
                className="px-3 py-1.5 rounded-full text-xs sm:text-sm bg-[#1A3E32] text-white shadow-sm"
              >
                {labelText} ×
              </button>
            );
          })}
        </div>
      )}

      <div ref={triggerRef} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={openDropdown}
          onClick={openDropdown}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent text-sm"
        />
      </div>

      {isOpen &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl divide-y divide-gray-100"
            style={{
              ...getPortaledMenuStyle(menuPos),
              maxHeight: menuPos.maxHeight,
            }}
          >
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">{emptyMessage}</p>
            ) : (
              filteredOptions.map((option) => {
                const value = getOptionValue(option);
                const checked = selectedValues.includes(value);

                return (
                  <label
                    key={value}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                      checked ? "bg-[#1A3E32]/5" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(value)}
                      className="rounded border-gray-300 text-[#1A3E32] focus:ring-[#1A3E32]"
                    />
                    <span className="text-gray-700">{getOptionLabel(option)}</span>
                  </label>
                );
              })
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default function GeographicTargetingSection({ audience, onUpdate }) {
  const countries = useMemo(
    () => audience.countries || [],
    [audience.countries],
  );
  const states = useMemo(() => audience.states || [], [audience.states]);
  const cities = useMemo(() => audience.cities || [], [audience.cities]);
  const lgas = useMemo(() => audience.lgas || [], [audience.lgas]);

  const countryOptions = useMemo(() => getAllCountryNames(), []);

  const [stateOptions, setStateOptions] = useState([]);

  useEffect(() => {
    if (countries.length === 0) {
      setStateOptions([]);
      return;
    }

    let cancelled = false;

    getStateOptionsForCountries(countries)
      .then((options) => {
        if (!cancelled) setStateOptions(options);
      })
      .catch(() => {
        if (!cancelled) setStateOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [countries]);

  const [cityOptions, setCityOptions] = useState([]);

  useEffect(() => {
    if (states.length === 0) {
      setCityOptions([]);
      return;
    }

    let cancelled = false;

    getCityOptionsForStates(states)
      .then((options) => {
        if (!cancelled) setCityOptions(options);
      })
      .catch(() => {
        if (!cancelled) setCityOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [states]);

  const nigerianStateKeys = useMemo(
    () =>
      states.filter(
        (stateKey) => stateKeyBelongsToCountry(stateKey, "Nigeria"),
      ),
    [states],
  );

  const [getLgas, setGetLgas] = useState(null);

  useEffect(() => {
    if (!hasNigeriaSelected(countries) || nigerianStateKeys.length === 0) {
      setGetLgas(null);
      return;
    }

    let cancelled = false;

    import("nigeria-state-lga-data")
      .then((module) => {
        if (cancelled) return;
        const loader = module.getLgas || module.default?.getLgas;
        setGetLgas(() => loader);
      })
      .catch(() => {
        if (!cancelled) setGetLgas(null);
      });

    return () => {
      cancelled = true;
    };
  }, [countries, nigerianStateKeys.length]);

  const lgaOptions = useMemo(
    () => getLgaOptionsForStates(nigerianStateKeys, getLgas),
    [nigerianStateKeys, getLgas],
  );

  const handleCountriesChange = (nextCountries) => {
    const nextStates = states.filter((stateKey) =>
      nextCountries.some((country) => stateKeyBelongsToCountry(stateKey, country)),
    );
    const nextCities = cities.filter((cityKey) =>
      nextStates.some((stateKey) => cityKeyBelongsToState(cityKey, stateKey)),
    );
    const nextLgas = lgas.filter((lgaKey) =>
      nextStates.some((stateKey) => lgaKeyBelongsToState(lgaKey, stateKey)),
    );

    onUpdate({
      countries: nextCountries,
      states: nextStates,
      cities: nextCities,
      lgas: nextLgas,
    });
  };

  const handleStatesChange = (nextStates) => {
    const nextCities = cities.filter((cityKey) =>
      nextStates.some((stateKey) => cityKeyBelongsToState(cityKey, stateKey)),
    );
    const nextLgas = lgas.filter((lgaKey) =>
      nextStates.some((stateKey) => lgaKeyBelongsToState(lgaKey, stateKey)),
    );

    onUpdate({
      states: nextStates,
      cities: nextCities,
      lgas: nextLgas,
    });
  };

  return (
    <>
      <SearchableMultiSelect
        label="Countries"
        placeholder="Search countries..."
        emptyMessage="No countries match your search."
        options={countryOptions}
        selectedValues={countries}
        onChange={handleCountriesChange}
        getOptionValue={(name) => name}
        getOptionLabel={(name) => name}
      />

      {countries.length > 0 ? (
        <SearchableMultiSelect
          label="State / City / Town"
          placeholder="Search state, city, or town..."
          emptyMessage={
            stateOptions.length
              ? "No locations match your search."
              : "No locations available for the selected countries."
          }
          options={stateOptions}
          selectedValues={states}
          onChange={handleStatesChange}
          getOptionValue={(option) => option.key}
          getOptionLabel={(option) => option.label}
        />
      ) : (
        <p className="text-sm text-gray-500 mb-5">
          Select at least one country to choose a state, city, or town.
        </p>
      )}

      {states.length > 0 ? (
        <SearchableMultiSelect
          label="City / Town / Area"
          placeholder="Search city, town, or area..."
          emptyMessage={
            cityOptions.length
              ? "No areas match your search."
              : "No areas available for the selected locations."
          }
          options={cityOptions}
          selectedValues={cities}
          onChange={(nextCities) => onUpdate("cities", nextCities)}
          getOptionValue={(option) => option.key}
          getOptionLabel={(option) => option.label}
        />
      ) : countries.length > 0 ? (
        <p className="text-sm text-gray-500">
          Select at least one state, city, or town to narrow by area.
        </p>
      ) : null}

      {hasNigeriaSelected(countries) && nigerianStateKeys.length > 0 ? (
        <SearchableMultiSelect
          label="Local Government Areas (LGA)"
          placeholder="Search LGAs..."
          emptyMessage={
            lgaOptions.length
              ? "No LGAs match your search."
              : "No LGAs available for the selected Nigerian states."
          }
          options={lgaOptions}
          selectedValues={lgas}
          onChange={(nextLgas) => onUpdate("lgas", nextLgas)}
          getOptionValue={(option) => option.key}
          getOptionLabel={(option) => option.label}
        />
      ) : hasNigeriaSelected(countries) && states.length > 0 ? (
        <p className="text-sm text-gray-500">
          Select at least one Nigerian state to target LGAs.
        </p>
      ) : null}
    </>
  );
}
