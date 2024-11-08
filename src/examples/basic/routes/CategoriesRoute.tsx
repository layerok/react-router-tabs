import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Tabs } from "src/examples/basic/components/Tabs/Tabs.tsx";
import { RouterTabPath, useRouterTabs } from "src/lib/tabs/useRouterTabs.tsx";

import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
import { usePersistTabs } from "src/lib/tabs/persist.tsx";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { validateTabPaths } from "src/lib/tabs/validateTabPaths.ts";
import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  homeRoute,
  categoriesListRoute,
  categoryDetailRoute,
} from "src/examples/basic/constants/routes.constants.ts";
import { TabStoreKey } from "src/examples/basic/constants/tabs.constants.ts";
import { convertRouteTreeToRouterTabsConfig } from "src/examples/basic/utils/convertRouteTreeToRouterTabsConfig.tsx";

const persistStoreKey = {
  name: "basic__category-tabs",
  version: "2.0",
};

export function CategoriesRoute() {
  const { router } = useDataRouterContext();

  const { getTabsFromStorage, persistTabs } = usePersistTabs({
    storageKey: persistStoreKey,
    storage: localStorageDriver,
  });

  const defaultTabs: RouterTabPath[] = [categoriesListRoute];

  const [paths, setPaths] = useState<RouterTabPath[]>(() =>
    validateTabPaths(getTabsFromStorage() || defaultTabs, router),
  );

  useEffect(() => {
    return persistTabs(paths);
  }, [paths, persistTabs]);

  const config = useMemo(
    () =>
      convertRouteTreeToRouterTabsConfig(
        router.routes.slice(),
        TabStoreKey.Categories,
      ),
    [router],
  );

  const { tabs, activeTab } = useRouterTabs({
    router,
    config,
    paths,
    onPathsChange: setPaths,
  });

  const setTabs = (tabs: TabModel[]) => {
    setPaths(tabs.map((tab) => tab.id));
  };

  const setActiveTabId = (id: string | undefined) => {
    setTimeout(() => {
      const [pathname, search] = (id || homeRoute).split("?");
      router.navigate({
        pathname,
        search,
      });
    });
  };

  const activeTabId = activeTab?.id;

  return (
    <div>
      <Tabs
        activeTabId={activeTabId}
        onActiveTabIdChange={setActiveTabId}
        tabs={tabs}
        initialTabs={tabs}
        onTabsChange={setTabs}
        hasControlledActiveTabId
      />
    </div>
  );
}

export function CategoryListRoute() {
  return (
    <div>
      <ul>
        <li>
          <Link to={categoryDetailRoute.replace(":id", "1")}>Category 1</Link>
        </li>
        <li>
          <Link to={categoryDetailRoute.replace(":id", "2")}>Category 2</Link>
        </li>
      </ul>
    </div>
  );
}

export function CategoryDetailRoute() {
  const params = useParams();
  return <div>detail ${params.id}</div>;
}
