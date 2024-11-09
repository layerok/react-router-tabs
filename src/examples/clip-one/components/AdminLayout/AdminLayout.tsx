import { Sidebar } from "../Sidebar/Sidebar.tsx";
import { Tabs } from "../Tabs/Tabs.tsx";
import { ReactNode, useEffect, useState } from "react";

import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  categoriesRoute,
  dashboardRoute,
  homeRoute,
  productsRoute,
  suppliersRoute,
} from "../../constants/routes.constants.ts";
import {
  RouterTabPath,
  TabDefinition,
  useRouterTabs,
} from "src/lib/tabs/useRouterTabs.tsx";
import { css } from "@emotion/react";
import { Outlet } from "react-router-dom";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
import { theBeginning } from "src/lib/tabs/theBeginning.ts";
import { validateTabPaths } from "src/lib/tabs/validateTabPaths.ts";
import { usePersistTabs } from "src/lib/tabs/usePersistTabs.tsx";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { whenRoutePathIs } from "src/lib/tabs/whenRoutePathIs.ts";

const persistStoreKey = {
  name: "clip-one__main-tabs",
  version: "4.0",
};

type Properties = {
  id: string;
  title: string;
  content: ReactNode;
  isClosable: boolean;
};

export function AdminLayout() {
  const { router } = useDataRouterContext();
  const { getTabsFromStorage, persistTabs } = usePersistTabs({
    storageKey: persistStoreKey,
    storage: localStorageDriver,
  });

  const [paths, setPaths] = useState<RouterTabPath[]>(
    validateTabPaths(getTabsFromStorage() || [], router),
  );

  const [config] = useState<TabDefinition<Properties>[]>(() => [
    {
      mapToUiState: (_, path) => ({
        id: path,
        title: "Dashboard",
        content: <Outlet />,
        isClosable: true,
      }),
      shouldOpen: whenRoutePathIs(dashboardRoute),
      insertAt: theBeginning,
    },
    {
      mapToUiState: (_, path) => ({
        id: path,
        title: "Categories",
        content: <Outlet />,
        isClosable: true,
      }),
      shouldOpen: whenRoutePathIs(categoriesRoute),
      insertAt: theBeginning,
    },
    {
      mapToUiState: (_, path) => ({
        id: path,
        title: "Products",
        content: <Outlet />,
        isClosable: true,
      }),
      shouldOpen: whenRoutePathIs(productsRoute),
      insertAt: theBeginning,
    },
    {
      mapToUiState: (_, path) => ({
        id: path,
        title: "Suppliers",
        content: <Outlet />,
        isClosable: true,
      }),
      shouldOpen: whenRoutePathIs(suppliersRoute),
      insertAt: theBeginning,
    },
  ]);

  const { tabs, activeTab } = useRouterTabs<Properties>({
    router,
    config,
    paths,
    onPathsChange: setPaths,
  });

  useEffect(() => {
    return persistTabs(paths);
  }, [paths, persistTabs]);

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

  const setTabs = (tabs: TabModel[]) => {
    setPaths(tabs.map((tab) => tab.id));
  };

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
              initialActiveTabId={activeTabId}
              initialTabs={tabs}
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
