import { Tabs } from "src/examples/basic/components/Tabs/Tabs.tsx";
import {
  convertRouteTreeToConfig,
  replacePathParams,
  TabbedNavigationMeta,
  TabModel,
} from "src/lib/tabs";

import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useDynamicRouterTabs } from "src/lib/tabs/useDynamicRouterTabs.tsx";

const persistStoreKey = {
  name: "basic__product-tabs",
  version: "1.0",
};

export function ProductsRoute() {
  const navigate = useNavigate();
  const { router } = useDataRouterContext();
  const { getTabsFromStorage, persistTabs } =
    usePersistTabs<TabbedNavigationMeta>({
      storageKey: persistStoreKey,
      storage: localStorageDriver,
    });

  const defaultTabs: TabModel<TabbedNavigationMeta>[] = [
    {
      id: productsListRoute,
      title: "List",
      content: <Outlet />,
      meta: {
        routeId: routeIds.product.list,
        path: productsListRoute,
      },
    },
  ];

  const [tabs, setTabs] = useState(() =>
    validateTabs(getTabsFromStorage() || defaultTabs, router.routes.slice()),
  );

  const [startPinnedTabs, onStartPinnedTabsChange] = useState([
    productsListRoute,
  ]);

  const { activeTabId, setActiveTabId } = useDynamicRouterTabs({
    config: useMemo(
      () =>
        convertRouteTreeToConfig(router.routes.slice(), TabStoreKey.Products),
      [router],
    ),
    onCloseAllTabs: useCallback(() => {
      navigate(homeRoute);
    }, [navigate]),
    startPinnedTabs,
    endPinnedTabs: useMemo(() => [], []),
    tabs,
    onTabsChange: setTabs,
    resolveTabMeta: useCallback(() => ({}), []),
  });

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  return (
    <div>
      <Tabs
        tabs={tabs}
        onTabsChange={setTabs}
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
