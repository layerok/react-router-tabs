import { Tabs } from "src/examples/basic/components/Tabs/Tabs.tsx";
import { replacePathParams } from "src/examples/basic/utils/replacePathParams.ts";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";

import { Link, Outlet, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { routeIds } from "../routes.tsx";

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
import { convertRouteTreeToRouterTabsConfig } from "src/examples/basic/utils/convertRouteTreeToRouterTabsConfig.ts";

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

  const defaultTabs: RouterTabModel[] = [
    {
      id: productsListRoute,
      route: {
        id: routeIds.product.list,
        path: productsListRoute,
      },
      path: productsListRoute,
    },
  ];

  const [tabs, setTabs] = useState(() =>
    validateTabs(getTabsFromStorage() || defaultTabs, router.routes.slice()),
  );

  const [startPinnedTabs, onStartPinnedTabsChange] = useState([
    productsListRoute,
  ]);

  const config = useMemo(
    () =>
      convertRouteTreeToRouterTabsConfig(
        router.routes.slice(),
        TabStoreKey.Products,
      ),
    [router],
  );

  const { activeTabId, setActiveTabId, getTabTitleByTabPath } = useRouterTabs({
    router,
    config: config,
    fallbackPath: homeRoute,
    startPinnedTabs,
    endPinnedTabs: useMemo(() => [], []),
    tabs,
    onTabsChange: setTabs,
  });

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  const uiTabs: TabModel[] = tabs.map((tab) => {
    return {
      id: tab.id,
      content: <Outlet />,
      title: getTabTitleByTabPath(tab.path)!,
      isClosable: false,
    };
  });

  const setUiTabs = (uiTabs: TabModel[]) => {
    setTabs(
      uiTabs.map((uiTab) => {
        const routerTab = tabs.find((tab) => tab.id === uiTab.id);

        return {
          id: uiTab.id,
          route: routerTab!.route,
          path: routerTab!.path,
        };
      }),
    );
  };

  return (
    <div>
      <Tabs
        tabs={uiTabs}
        onTabsChange={setUiTabs}
        onStartPinnedTabsChange={onStartPinnedTabsChange}
        startPinnedTabs={startPinnedTabs}
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
