import store from "../store/store.js";
import { hydrateAuth } from "../features/auth/authSlice.js";

/** Hydrate Redux auth state from localStorage tokens/user. */
export function hydrateAuthFromStorage() {
  store.dispatch(hydrateAuth());
}
