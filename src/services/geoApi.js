import axiosPublic from "./axiosPublic";

export function fetchCountries() {
  return axiosPublic.get("/api/geo/countries");
}

export function fetchStates(country) {
  return axiosPublic.get("/api/geo/states", { params: { country } });
}

export function fetchCities({ country, state, q = "", limit = 500 }) {
  return axiosPublic.get("/api/geo/cities", {
    params: { country, state, q, limit },
  });
}
