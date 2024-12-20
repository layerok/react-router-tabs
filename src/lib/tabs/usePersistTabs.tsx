import {
  StorageDriver,
  StorageKey,
} from "src/lib/storage/create-storage-driver.ts";
import { useCallback } from "react";

import { RouterTabPath } from "src/lib/tabs/useRouterTabs.tsx";

export const usePersistTabs = ({
  storageKey,
  storage,
}: {
  storageKey: StorageKey;
  storage: StorageDriver;
}) => {
  return {
    getTabsFromStorage: useCallback(
      () => storage.get<RouterTabPath[]>(storageKey) || [],
      [storageKey, storage],
    ),
    persistTabs: useCallback(
      (tabs: RouterTabPath[]) => {
        const onUnload = () => {
          // save on window close
          // it doesn't make sense for memory storage
          storage.set(storageKey, tabs);
        };
        window.addEventListener("unload", onUnload);
        return () => {
          window.removeEventListener("unload", onUnload);
          // save on unmount
          storage.set(storageKey, tabs);
        };
      },
      [storageKey, storage],
    ),
  };
};
