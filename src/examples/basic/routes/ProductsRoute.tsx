import { Tabs } from "src/examples/basic/components/Tabs/Tabs.tsx";
import { replacePathParams } from "src/utils/replacePathParams.ts";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";

import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { usePersistTabs } from "src/lib/tabs/usePersistTabs.tsx";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { validateTabPaths } from "src/lib/tabs/validateTabPaths.ts";
import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  homeRoute,
  productDetailRoute,
  productsListRoute,
} from "src/examples/basic/constants/routes.constants.ts";
import { TabStoreKey } from "src/examples/basic/constants/tabs.constants.ts";
import { RouterTabPath, useRouterTabs } from "src/lib/tabs/useRouterTabs.tsx";
import { convertRouteTreeToRouterTabsConfig } from "src/examples/basic/utils/convertRouteTreeToRouterTabsConfig.tsx";

const persistStoreKey = {
  name: "basic__product-tabs",
  version: "2.0",
};

export function ProductsRoute() {
  const { router } = useDataRouterContext();
  const { getTabsFromStorage, persistTabs } = usePersistTabs({
    storageKey: persistStoreKey,
    storage: localStorageDriver,
  });

  const defaultPaths: RouterTabPath[] = [productsListRoute];

  const [paths, setPaths] = useState(() =>
    validateTabPaths(getTabsFromStorage() || defaultPaths, router),
  );

  const config = useMemo(
    () =>
      convertRouteTreeToRouterTabsConfig(
        router.routes.slice(),
        TabStoreKey.Products,
      ),
    [router],
  );

  const { tabs, activeTab, setActivePath } = useRouterTabs({
    router,
    config,
    paths,
    onPathsChange: setPaths,
    undefinedPath: homeRoute,
  });

  useEffect(() => {
    return persistTabs(paths);
  }, [paths, persistTabs]);

  const setTabs = (tabs: TabModel[]) => {
    setPaths(tabs.map((tab) => tab.id));
  };

  const activeTabId = activeTab?.id;

  return (
    <div>
      <Tabs
        tabs={tabs}
        initialTabs={tabs}
        onTabsChange={setTabs}
        hasControlledActiveTabId
        activeTabId={activeTabId}
        onActiveTabIdChange={setActivePath}
      />
    </div>
  );
}

export function ProductListRoute() {
  return (
    <div>
      <ul>
        <li>
          <Link
            to={replacePathParams(productDetailRoute, {
              id: "1",
            })}
          >
            Product 1
          </Link>
        </li>
        <li>
          <Link
            to={replacePathParams(productDetailRoute, {
              id: "2",
            })}
          >
            Product 2
          </Link>
        </li>
      </ul>
    </div>
  );
}

export function ProductDetailRoute() {
  const params = useParams();
  return <div>detail ${params.id}</div>;
}
