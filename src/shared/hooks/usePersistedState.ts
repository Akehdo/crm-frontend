import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function usePersistedState<TValue>(
  key: string,
  initialValue: TValue,
): [TValue, Dispatch<SetStateAction<TValue>>] {
  const [value, setValue] = useState<TValue>(() => {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return initialValue;
    }

    try {
      return JSON.parse(raw) as TValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
