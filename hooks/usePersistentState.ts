import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// Custom hook to persist state in localStorage
export function usePersistentState<T>(key: string, initialValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const getInitialValue = () => {
      if (typeof initialValue === 'function') {
        return (initialValue as () => T)();
      }
      return initialValue;
    };

    if (typeof window === 'undefined') {
      return getInitialValue();
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : getInitialValue();
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return getInitialValue();
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const getCircularReplacer = () => {
          const seen = new WeakSet();
          return (_key: string, value: unknown) => {
            if (typeof value === "object" && value !== null) {
              if (seen.has(value)) {
                return;
              }
              seen.add(value);
            }
            return value;
          };
        };
        window.localStorage.setItem(key, JSON.stringify(state, getCircularReplacer()));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, state]);

  return [state, setState];
}