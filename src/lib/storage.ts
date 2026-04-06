"use client";

import { useEffect, useState } from "react";

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
      alert("存储空间不足，请导出数据后清理");
    }
  },
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  clear(): void {
    localStorage.clear();
  },
};

export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setValue(storage.get(key, defaultValue));
    setIsHydrated(true);
  }, [key]);

  useEffect(() => {
    if (isHydrated) {
      storage.set(key, value);
    }
  }, [key, value, isHydrated]);

  return [value, setValue, isHydrated] as const;
}
