import { useState, useMemo, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const GEO_URL = "/world-countries-110m.json";

// Country name normalization map for matching API data to TopoJSON names
const COUNTRY_NAME_MAP = {
  usa: "United States of America",
  us: "United States of America",
  "united states": "United States of America",
  uk: "United Kingdom",
  "united kingdom": "United Kingdom",
  uae: "United Arab Emirates",
  "south korea": "South Korea",
  "north korea": "North Korea",
  "czech republic": "Czechia",
  "ivory coast": "Côte d'Ivoire",
  "cote d'ivoire": "Côte d'Ivoire",
  congo: "Dem. Rep. Congo",
  "democratic republic of congo": "Dem. Rep. Congo",
  "dr congo": "Dem. Rep. Congo",
  "republic of congo": "Congo",
  eswatini: "eSwatini",
  swaziland: "eSwatini",
  "hong kong s.a.r.": "China",
  "hong kong": "China",
  macau: "China",
  taiwan: "Taiwan",
  palestine: "Palestine",
  gambia: "Gambia",
  "the gambia": "Gambia",
  "cabo verde": "Cape Verde",
  "timor-leste": "Timor-Leste",
  "east timor": "Timor-Leste",
  myanmar: "Myanmar",
  burma: "Myanmar",
  laos: "Laos",
  russia: "Russia",
  "south sudan": "S. Sudan",
  "s. sudan": "S. Sudan",
  "central african republic": "Central African Rep.",
  "dominican republic": "Dominican Rep.",
  "equatorial guinea": "Eq. Guinea",
  "western sahara": "W. Sahara",
  "bosnia and herzegovina": "Bosnia and Herz.",
  bosnia: "Bosnia and Herz.",
  "north macedonia": "Macedonia",
  macedonia: "Macedonia",
  "sierra leone": "Sierra Leone",
  "guinea-bissau": "Guinea-Bissau",
  "burkina faso": "Burkina Faso",
  "trinidad and tobago": "Trinidad and Tobago",
  "solomon islands": "Solomon Is.",
  "papua new guinea": "Papua New Guinea",
  "new zealand": "New Zealand",
  "sri lanka": "Sri Lanka",
  "costa rica": "Costa Rica",
  "el salvador": "El Salvador",
  "puerto rico": "Puerto Rico",
  "saudi arabia": "Saudi Arabia",
  "south africa": "South Africa",
  aruba: "Netherlands",
};

const normalizeCountryName = (name) => {
  if (!name) return "";
  const lower = name.trim().toLowerCase();
  return COUNTRY_NAME_MAP[lower] || name.trim();
};

// Green color scale tiers based on jobseeker counts
export const COLOR_TIERS = [
  { min: 1, max: 9, label: "1 - 9", color: "#dcfce7" }, // very light pastel green
  { min: 10, max: 19, label: "10 - 19", color: "#bbf7d0" }, // light pastel green
  { min: 20, max: 29, label: "20 - 29", color: "#86efac" }, // soft spring green
  { min: 30, max: 49, label: "30 - 49", color: "#4ade80" }, // fresh green
  { min: 50, max: 99, label: "50 - 99", color: "#22c55e" }, // medium bright green
  { min: 100, max: 199, label: "100 - 199", color: "#16a34a" }, // rich leaf green
  { min: 200, max: 499, label: "200 - 499", color: "#15803d" }, // deep green
  { min: 500, max: 999, label: "500 - 999", color: "#16730F" }, // Bejite Primary Brand Green
  { min: 1000, max: 1999, label: "1K - 2K", color: "#14532d" }, // dark forest green
  { min: 2000, max: 19999, label: "2K - 20K", color: "#0d3b1e" }, // deep pine green
  { min: 20000, max: Infinity, label: "20K+", color: "#052e16" }, // deepest dark green
];

export const getTierForCount = (count) => {
  if (!count || count <= 0) return null;
  for (let i = COLOR_TIERS.length - 1; i >= 0; i--) {
    if (count >= COLOR_TIERS[i].min) {
      return COLOR_TIERS[i];
    }
  }
  return COLOR_TIERS[0];
};

const WorldMap = ({ data = [], totalJobseekers = 0 }) => {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hoveredGeo, setHoveredGeo] = useState(null);

  const [activeCountry, setActiveCountry] = useState(null);

  // Controlled map zoom & position
  const [position, setPosition] = useState({ coordinates: [15, 8], zoom: 1 });

  const handleZoomIn = () => {
    setPosition((prev) => {
      if (prev.zoom >= 6) return prev;
      return {
        ...prev,
        zoom: Math.min(Number((prev.zoom * 1.5).toFixed(2)), 6),
      };
    });
  };

  const handleZoomOut = () => {
    setPosition((prev) => {
      if (prev.zoom <= 1) return prev;
      const nextZoom = Math.max(Number((prev.zoom / 1.5).toFixed(2)), 1);
      return {
        coordinates: nextZoom <= 1 ? [15, 8] : prev.coordinates,
        zoom: nextZoom,
      };
    });
  };

  const handleReset = () => {
    setPosition({ coordinates: [15, 8], zoom: 1 });
  };

  const handleMoveEnd = useCallback((pos) => {
    if (pos && pos.coordinates) {
      setPosition({
        coordinates: pos.coordinates,
        zoom: pos.zoom || 1,
      });
    }
  }, []);

  // Build lookup dictionary from API data (country name -> count)
  const { dataMap, maxCount } = useMemo(() => {
    const map = {};
    let max = 0;
    data.forEach(({ name, count }) => {
      const normalized = normalizeCountryName(name);
      const normalizedLower = normalized.toLowerCase();
      map[normalizedLower] = (map[normalizedLower] || 0) + count;
      if (map[normalizedLower] > max) max = map[normalizedLower];
    });
    return { dataMap: map, maxCount: max };
  }, [data]);

  // Determine tiers to display in the legend based on maxCount
  const visibleTiers = useMemo(() => {
    if (!maxCount || maxCount <= 0) {
      return COLOR_TIERS.slice(0, 5);
    }
    const maxTierIndex = COLOR_TIERS.findIndex((tier) => maxCount <= tier.max);
    const endIndex =
      maxTierIndex === -1
        ? COLOR_TIERS.length
        : Math.min(maxTierIndex + 1, COLOR_TIERS.length);
    // Show at least first 5 tiers or up to the max tier in data
    return COLOR_TIERS.slice(0, Math.max(endIndex, 5));
  }, [maxCount]);

  // Get fill color for a geography
  const getFillColor = useCallback(
    (geoName, isHovered) => {
      const geoNameLower = (geoName || "").toLowerCase();
      const count = dataMap[geoNameLower] || 0;
      const hasData = count > 0;

      if (!hasData) {
        return isHovered ? "#f1f5f9" : "#ffffff";
      }

      const tier = getTierForCount(count);
      return tier ? tier.color : "#dcfce7";
    },
    [dataMap],
  );

  const handleCountryInteraction = useCallback(
    (geo, evt) => {
      const geoName = geo.properties.name;
      const geoNameLower = geoName.toLowerCase();
      const count = dataMap[geoNameLower] || 0;
      setHoveredGeo(geo.rsmKey);
      setActiveCountry({ name: geoName, count });
      setTooltipContent({ name: geoName, count });
      if (evt && evt.clientX && evt.clientY) {
        setTooltipPos({ x: evt.clientX, y: evt.clientY });
      }
    },
    [dataMap],
  );

  const handleMouseMove = useCallback((evt) => {
    if (evt && evt.clientX && evt.clientY) {
      setTooltipPos({ x: evt.clientX, y: evt.clientY });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredGeo(null);
    setTooltipContent(null);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* Map Canvas Area */}
      <div className="relative w-full flex-1 min-h-[220px] sm:min-h-[290px] rounded-xl overflow-hidden bg-slate-50/50 border border-slate-100 flex items-center justify-center">
        {/* Active Country Pill Badge (especially useful on mobile touch) */}
        {activeCountry && (
          <div className="absolute top-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm rounded-lg px-2.5 py-1.5 flex items-center gap-2 max-w-[calc(100%-85px)] pointer-events-none transition-all">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
              style={{
                backgroundColor:
                  activeCountry.count > 0
                    ? getTierForCount(activeCountry.count)?.color || "#16730F"
                    : "#cbd5e1",
              }}
            />
            <div className="truncate text-xs">
              <span className="font-bold text-slate-800">{activeCountry.name}: </span>
              <span className="font-semibold text-[#16730F]">
                {activeCountry.count > 0
                  ? `${activeCountry.count.toLocaleString()} (${
                      totalJobseekers > 0
                        ? ((activeCountry.count / totalJobseekers) * 100).toFixed(1)
                        : 0
                    }%)`
                  : "0 jobseekers"}
              </span>
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex flex-col items-center bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 overflow-hidden z-20">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={position.zoom >= 6}
            className="p-1.5 sm:p-2 bg-transparent hover:bg-slate-50 text-slate-700 hover:text-[#16730F] disabled:opacity-35 disabled:cursor-not-allowed border-b border-slate-100 flex items-center justify-center transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn size={15} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={position.zoom <= 1}
            className="p-1.5 sm:p-2 bg-transparent hover:bg-slate-50 text-slate-700 hover:text-[#16730F] disabled:opacity-35 disabled:cursor-not-allowed border-b border-slate-100 flex items-center justify-center transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut size={15} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 sm:p-2 bg-transparent hover:bg-slate-50 text-slate-700 hover:text-[#16730F] flex items-center justify-center transition-colors"
            title="Reset map view"
            aria-label="Reset map view"
          >
            <RotateCcw size={13} strokeWidth={2.2} />
          </button>
        </div>

        {/* SVG Map Canvas */}
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 125,
            center: [15, 8],
          }}
          className="w-full h-full"
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={1}
            maxZoom={6}
            onMoveEnd={handleMoveEnd}
            filterZoomEvent={(evt) => {
              // Disable mouse wheel / touchpad pinch-swipe so page scrolling is never hijacked
              if (evt.type === "wheel") return false;
              return !evt.ctrlKey && !evt.button;
            }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoName = geo.properties.name;
                  const geoNameLower = (geoName || "").toLowerCase();
                  const count = dataMap[geoNameLower] || 0;
                  const isHovered = hoveredGeo === geo.rsmKey;
                  const fillColor = getFillColor(geoName, isHovered);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke={
                        isHovered
                          ? "#0f172a"
                          : count > 0
                          ? "#94a3b8"
                          : "#cbd5e1"
                      }
                      strokeWidth={isHovered ? 1.5 : count > 0 ? 0.75 : 0.5}
                      onMouseEnter={(evt) => handleCountryInteraction(geo, evt)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={(evt) => handleCountryInteraction(geo, evt)}
                      tabIndex={-1}
                      className="rsm-geography"
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Desktop Tooltip (follows cursor on desktop) */}
        {tooltipContent && (
          <div
            className="hidden sm:block pointer-events-none fixed z-[9999]"
            style={{
              left: Math.min(Math.max(12, tooltipPos.x + 14), window.innerWidth - 220),
              top: Math.max(12, tooltipPos.y - 44),
              background: "rgba(255, 255, 255, 0.98)",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "10px 16px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
              minWidth: "160px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "14px",
                color: "#0f172a",
                marginBottom: "4px",
              }}
            >
              {tooltipContent.name}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: tooltipContent.count > 0 ? "#16730F" : "#64748b",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {tooltipContent.count > 0 && (
                <span
                  style={{
                    display: "inline-block",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    backgroundColor:
                      getTierForCount(tooltipContent.count)?.color || "#16730F",
                    border: "1px solid rgba(0,0,0,0.15)",
                  }}
                />
              )}
              <span>
                {tooltipContent.count > 0
                  ? `${tooltipContent.count.toLocaleString()} jobseeker${
                      tooltipContent.count !== 1 ? "s" : ""
                    }`
                  : "No jobseekers"}
              </span>
            </div>
            {tooltipContent.count > 0 && totalJobseekers > 0 && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  marginTop: "2px",
                }}
              >
                {((tooltipContent.count / totalJobseekers) * 100).toFixed(1)}% of total
              </div>
            )}
          </div>
        )}

        {/* Desktop Floating Legend (hidden on mobile screen to prevent covering map) */}
        <div className="hidden sm:block absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-200 max-w-[calc(100%-24px)] z-10">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Jobseekers by Tier
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 text-[11px] text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300" />
              <span>0</span>
            </div>
            {visibleTiers.map((tier, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 text-[11px] text-slate-800 font-semibold"
                title={`${tier.label} jobseekers`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm border border-black/10"
                  style={{ backgroundColor: tier.color }}
                />
                <span>{tier.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Legend (visible only on mobile screen, placed cleanly below the map) */}
      <div className="block sm:hidden mt-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Jobseekers by Tier
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Swipe →
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5 scrollbar-none touch-pan-x">
          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[10px] text-slate-600 shrink-0 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300 shrink-0" />
            <span>0</span>
          </div>
          {visibleTiers.map((tier, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[10px] font-semibold text-slate-800 shrink-0"
            >
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0 border border-black/10"
                style={{ backgroundColor: tier.color }}
              />
              <span>{tier.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inline style to remove default outline on Geography focus */}
      <style>{`
        .rsm-geography {
          outline: none !important;
          cursor: pointer;
          transition: fill 0.15s ease, stroke 0.15s ease;
        }
        .rsm-geography:focus {
          outline: none !important;
        }
      `}</style>
    </div>
  );
};

export default WorldMap;
