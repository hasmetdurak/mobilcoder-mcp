const STORAGE_PREFIX = 'mobilecoder_';

export function setStorage(key: string, value: any): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return defaultValue;
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

export function clearStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

