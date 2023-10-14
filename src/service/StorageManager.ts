export interface StorageManager {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

class LocalStorageManager implements StorageManager {
  // Check if localStorage is supported in the current environment
  private static isLocalStorageSupported(): boolean {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const testKey = '__localStorageTest__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  // Get an item from localStorage
  getItem(key: string): string | null {
    if (LocalStorageManager.isLocalStorageSupported()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  // Set an item in localStorage
  setItem(key: string, value: string): void {
    if (LocalStorageManager.isLocalStorageSupported()) {
      localStorage.setItem(key, value);
    }
  }

  // Remove an item from localStorage
  removeItem(key: string): void {
    if (LocalStorageManager.isLocalStorageSupported()) {
      localStorage.removeItem(key);
    }
  }

  // Clear all items in localStorage
  clear(): void {
    if (LocalStorageManager.isLocalStorageSupported()) {
      localStorage.clear();
    }
  }
}

export default LocalStorageManager;