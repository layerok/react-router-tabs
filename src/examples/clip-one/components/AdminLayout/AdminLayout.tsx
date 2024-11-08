import { Sidebar } from "../Sidebar/Sidebar.tsx";
import { Tabs } from "../Tabs/Tabs.tsx";
import { useEffect, useState } from "react";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";

import { validateTabs, usePersistTabs } from "src/lib/tabs";

import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  categoriesRoute,
  dashboardRoute,
  homeRoute,
  productsRoute,
  suppliersRoute,
} from "../../constants/routes.constants.ts";
import { TabConfig, useRouterTabs } from "src/lib/tabs/useRouterTabs.tsx";
import { css } from "@emotion/react";
import { Outlet } from "react-router-dom";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
import { theBeginning } from "src/lib/tabs/theBeginning.ts";

const persistStoreKey = {
  name: "clip-one__main-tabs",
  version: "4.0",
};

export function AdminLayout() {
  const { router } = useDataRouterContext();

  const { getTabsFromStorage, persistTabs } = usePersistTabs({
    storage: localStorageDriver,
    storageKey: persistStoreKey,
  });

  const [tabs, setTabs] = useState(() =>
    validateTabs(getTabsFromStorage() || [], router.routes.slice()),
  );

  const [startPinnedTabs, setStartPinnedTabsChange] = useState<string[]>([]);

  const [config] = useState<TabConfig[]>(() => [
    {
      title: () => "Dashboard",
      shouldOpen: (match) => match.route.path === dashboardRoute,
      insertAt: theBeginning,
    },
    {
      title: () => "Categories",
      shouldOpen: (match) => match.route.path === categoriesRoute,
      insertAt: theBeginning,
    },
    {
      title: () => "Products",
      shouldOpen: (match) => match.route.path === productsRoute,
      insertAt: theBeginning,
    },
    {
      title: () => "Suppliers",
      shouldOpen: (match) => match.route.path === suppliersRoute,
      insertAt: theBeginning,
    },
  ]);

  const { activeTabId, setActiveTabId, getTabTitleByTabPath } = useRouterTabs({
    router,
    config,
    tabs,
    onTabsChange: setTabs,
    fallbackPath: homeRoute,
  });

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  const uiTabs: TabModel[] = tabs.map((tab) => {
    return {
      id: tab.id,
      content: <Outlet />,
      title: getTabTitleByTabPath(tab.path)!,
      isClosable: true,
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
    <div css={layoutStyles}>
      <header css={headerStyles}>John Doe</header>
      <div css={layoutInner}>
        <Sidebar />
        <div css={contentStyles}>
          <div css={tabsStyles}>
            <Tabs
              tabs={uiTabs}
              onTabsChange={setUiTabs}
              onStartPinnedTabsChange={setStartPinnedTabsChange}
              startPinnedTabs={startPinnedTabs}
              initialActiveTabId={activeTabId}
              initialTabs={uiTabs}
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
