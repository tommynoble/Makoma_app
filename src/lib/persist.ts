import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * useState that is saved on the device (AsyncStorage) and restored on launch.
 * `hydrated` is false until the saved value has been read. Writes are
 * debounced so typing in a field does not hammer storage.
 */
export function usePersistentState<T>(key: string, initial: T, merge: (saved: T) => T = (s) => s) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (alive && raw) setValue(merge({ ...initial, ...JSON.parse(raw) }));
      })
      .catch(() => {})
      .finally(() => alive && setHydrated(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
    }, 250);
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

export async function clearPersisted(keys: string[]) {
  await AsyncStorage.multiRemove(keys).catch(() => {});
}
