import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import { routeIds } from "../routes.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs } from "src/examples/basic/components/Tabs/Tabs.tsx";
import {
  TabbedNavigationMeta,
  useRouterTabs,
} from "src/lib/tabs/useRouterTabs.tsx";

import { convertRouteTreeToConfig, TabModel } from "src/lib/tabs";
import { usePersistTabs } from "src/lib/tabs/persist.tsx";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { validateTabs } from "src/lib/tabs";
import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  homeRoute,
  categoriesListRoute,
  categoryDetailRoute,
} from "src/examples/basic/constants/routes.constants.ts";
import { TabStoreKey } from "src/examples/basic/constants/tabs.constants.ts";

const persistStoreKey = {
  name: "basic__category-tabs",
  version: "1.0",
};

export function CategoriesRoute() {
  const { router } = useDataRouterContext();

  const { getTabsFromStorage, persistTabs } =
    usePersistTabs<TabbedNavigationMeta>({
      storageKey: persistStoreKey,
      storage: localStorageDriver,
    });

  const defaultTabs: TabModel<TabbedNavigationMeta>[] = [
    {
      id: categoriesListRoute,
      title: "List",
      content: <Outlet />,
      meta: {
        routeId: routeIds.category.list,
        path: "",
      },
    },
  ];

  const [tabs, setTabs] = useState<TabModel<TabbedNavigationMeta>[]>(() =>
    validateTabs(getTabsFromStorage() || defaultTabs, router.routes.slice()),
  );

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  const [startPinnedTabs, setStartPinnedTabsChange] = useState<string[]>([
    categoriesListRoute,
  ]);

  const navigate = useNavigate();
  const { activeTabId, setActiveTabId } = useRouterTabs({
    router,
    config: useMemo(
      () =>
        convertRouteTreeToConfig(router.routes.slice(), TabStoreKey.Categories),
      [router],
    ),
    onCloseAllTabs: () => {
      navigate(homeRoute);
    },
    endPinnedTabs: useMemo(() => [], []),
    startPinnedTabs,
    tabs,
    onTabsChange: setTabs,
    resolveTabMeta: useCallback(() => ({}), []),
  });

  //const {getTabsProps} = usePersistTabs(persistStoreKey, tabs)

  return (
    <div>
      <Tabs
        activeTabId={activeTabId}
        onActiveTabIdChange={setActiveTabId}
        tabs={tabs}
        startPinnedTabs={startPinnedTabs}
        onTabsChange={setTabs}
        hasControlledActiveTabId
        onStartPinnedTabsChange={setStartPinnedTabsChange}
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
