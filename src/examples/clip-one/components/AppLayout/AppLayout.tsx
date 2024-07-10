import { useNavigate } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar.tsx";
import { Tabs } from "../Tabs/Tabs.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";

import {
  validateTabs,
  usePersistTabs,
  TabbedNavigationMeta,
} from "src/lib/tabs";

import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  categoriesRoute,
  dashboardRoute,
  homeRoute,
  productsRoute,
  suppliersRoute,
} from "../../constants/routes.constants.ts";
import {
  InsertMethod,
  useDynamicRouterTabs,
} from "src/lib/tabs/useDynamicRouterTabs.tsx";
import { routeIds } from "../../routes.tsx";
import { css } from "@emotion/react";

const persistStoreKey = {
  name: "clip-one__main-tabs",
  version: "1.0",
};

export function AppLayout() {
  const navigate = useNavigate();
  const { router } = useDataRouterContext();

  const { getTabsFromStorage, persistTabs } =
    usePersistTabs<TabbedNavigationMeta>({
      storage: localStorageDriver,
      storageKey: persistStoreKey,
    });

  const [tabs, setTabs] = useState(() =>
    validateTabs(getTabsFromStorage() || [], router.routes.slice()),
  );

  const [startPinnedTabs, setStartPinnedTabsChange] = useState<string[]>([]);

  const [config] = useState(() => [
    {
      title: () => "Dashboard",
      id: dashboardRoute,
      routeId: routeIds.dashboard,
      insertMethod: InsertMethod.Prepend,
    },
    {
      title: () => "Categories",
      id: categoriesRoute,
      routeId: routeIds.category.layout,
      insertMethod: InsertMethod.Prepend,
    },
    {
      title: () => "Products",
      id: productsRoute,
      routeId: routeIds.product.layout,
      insertMethod: InsertMethod.Prepend,
    },
    {
      title: () => "Suppliers",
      id: suppliersRoute,
      routeId: routeIds.supplier.layout,
      insertMethod: InsertMethod.Prepend,
    },
  ]);

  const { activeTabId, setActiveTabId } = useDynamicRouterTabs({
    config,
    tabs,
    endPinnedTabs: useMemo(() => [], []),
    onTabsChange: setTabs,
    startPinnedTabs,
    onCloseAllTabs: () => {
      navigate(homeRoute);
    },
    resolveTabMeta: useCallback(() => ({}), []),
  });

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  return (
    <div css={layoutStyles}>
      <header css={headerStyles}>John Doe</header>
      <div css={layoutInner}>
        <Sidebar />
        <div css={contentStyles}>
          <div css={tabsStyles}>
            <Tabs
              tabs={tabs}
              onTabsChange={setTabs}
              onStartPinnedTabsChange={setStartPinnedTabsChange}
              startPinnedTabs={startPinnedTabs}
              initialActiveTabId={activeTabId}
              initialTabs={tabs}
              initialStartPinnedTabs={startPinnedTabs}
              hasControlledActiveTabId
              activeTabId={activeTabId}
              onActiveTabIdChange={setActiveTabId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const layoutInner = css`
  flex-grow: 1;
  width: 100%;
  display: grid;
  grid-template-columns: 225px 1fr;
`;

const layoutStyles = css`
  --border-color: rgba(221, 221, 221);
  --border-color-inverse: rgb(85, 85, 85);
  --color-primary: #569099;
  --header-height: 42px;
  --background-color-inverse: rgb(245, 245, 245);
  --foreground-color-inverse: rgb(85, 85, 85);

  box-sizing: border-box;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const contentStyles = css`
  display: flex;
  flex-direction: column;
`;

const headerStyles = css`
  height: var(--header-height);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color-inverse);
  display: flex;
  align-items: center;
  padding: 0 16px;
  justify-content: end;
`;

const tabsStyles = css`
  padding: 10px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;
