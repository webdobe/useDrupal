export interface StorageManager {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
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
  async getItem(key: string): Promise<string | null> {
    if (LocalStorageManager.isLocalStorageSupported()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  // Set an item in localStorage
  async setItem(key: string, value: string): Promise<void> {
    if (LocalStorageManager.isLocalStorageSupported()) {
      localStorage.setItem(key, value);
    }
  }

  // Remove an item from localStorage
  async removeItem(key: string): Promise<void> {
    if (LocalStorageManager.isLocalStorageSupported()) {
      localStorage.removeItem(key);
    }
  }

  // Clear all items in localStorage
  async clear(): Promise<void> {
    if (LocalStorageManager.isLocalStorageSupported()) {
      localStorage.clear();
    }
  }
}

export default LocalStorageManager;