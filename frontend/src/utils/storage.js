/**
 * Thin wrapper around localStorage with JSON parsing and error handling.
 */
export const storage = {
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      const toStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, toStore);
    } catch {
      /* no-op: storage unavailable */
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* no-op */
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch {
      /* no-op */
    }
  },
};
