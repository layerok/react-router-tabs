import { Tabs } from "src/examples/basic/components/Tabs/Tabs.tsx";
import { replacePathParams } from "src/examples/basic/utils/replacePathParams.ts";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";

import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { usePersistTabs } from "src/lib/tabs/persist.tsx";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { validateTabs } from "src/lib/tabs";
import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  homeRoute,
  productDetailRoute,
  productsListRoute,
} from "src/examples/basic/constants/routes.constants.ts";
import { TabStoreKey } from "src/examples/basic/constants/tabs.constants.ts";
import { RouterTabModel, useRouterTabs } from "src/lib/tabs/useRouterTabs.tsx";
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

  const defaultTabs: RouterTabModel[] = [productsListRoute];

  const [tabs, setTabs] = useState(() =>
    validateTabs(getTabsFromStorage() || defaultTabs, router),
  );

  const config = useMemo(
    () =>
      convertRouteTreeToRouterTabsConfig(
        router.routes.slice(),
        TabStoreKey.Products,
      ),
    [router],
  );

  const { activeTabId, setActiveTabId, uiTabs } = useRouterTabs({
    router,
    config: config,
    fallbackPath: homeRoute,
    tabs,
    onTabsChange: setTabs,
  });

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  const setUiTabs = (uiTabs: TabModel[]) => {
    setTabs(uiTabs.map((uiTab) => uiTab.id));
  };

  return (
    <div>
      <Tabs
        tabs={uiTabs.map((tab) => tab.properties)}
        initialTabs={uiTabs.map((tab) => tab.properties)}
        onTabsChange={setUiTabs}
        hasControlledActiveTabId
        activeTabId={activeTabId}
        onActiveTabIdChange={setActiveTabId}
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
