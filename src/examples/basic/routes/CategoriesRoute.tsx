import { Link, Outlet, useParams } from "react-router-dom";

import { routeIds } from "../routes.tsx";
import { useEffect, useMemo, useState } from "react";
import { Tabs } from "src/examples/basic/components/Tabs/Tabs.tsx";
import { RouterTabModel, useRouterTabs } from "src/lib/tabs/useRouterTabs.tsx";

import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
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
import { convertRouteTreeToRouterTabsConfig } from "src/examples/basic/utils/convertRouteTreeToRouterTabsConfig.ts";

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

  const defaultTabs: RouterTabModel[] = [
    {
      id: categoriesListRoute,
      route: {
        id: routeIds.category.list,
      },
      path: categoriesListRoute,
    },
  ];

  const [tabs, setTabs] = useState<RouterTabModel[]>(() =>
    validateTabs(getTabsFromStorage() || defaultTabs, router.routes.slice()),
  );

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  const [startPinnedTabs, setStartPinnedTabsChange] = useState<string[]>([
    categoriesListRoute,
  ]);

  const config = useMemo(
    () =>
      convertRouteTreeToRouterTabsConfig(
        router.routes.slice(),
        TabStoreKey.Categories,
      ),
    [router],
  );

  const { activeTabId, setActiveTabId, getTabTitleByTabPath } = useRouterTabs({
    router,
    config: config,
    fallbackPath: homeRoute,
    tabs,
    onTabsChange: setTabs,
  });

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
        activeTabId={activeTabId}
        onActiveTabIdChange={setActiveTabId}
        tabs={uiTabs}
        startPinnedTabs={startPinnedTabs}
        onTabsChange={setUiTabs}
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
