import { Sidebar } from "../Sidebar/Sidebar.tsx";
import { Tabs } from "../Tabs/Tabs.tsx";
import { ReactNode, useState } from "react";

import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  categoriesRoute,
  dashboardRoute,
  homeRoute,
  productsRoute,
  suppliersRoute,
} from "../../constants/routes.constants.ts";
import {
  matchRouterTab,
  TabConfig,
  useRouterTabs,
} from "src/lib/tabs/useRouterTabs.tsx";
import { css } from "@emotion/react";
import { matchRoutes, Outlet } from "react-router-dom";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
import { theBeginning } from "src/lib/tabs/theBeginning.ts";

// const persistStoreKey = {
//   name: "clip-one__main-tabs",
//   version: "4.0",
// };

type Properties = {
  id: string;
  title: string;
  content: ReactNode;
  isClosable: boolean;
};

export function AdminLayout() {
  const { router } = useDataRouterContext();

  const [paths, setPaths] = useState<string[]>([]);

  const [config] = useState<TabConfig<Properties>[]>(() => [
    {
      properties: (match) => ({
        id: match.pathname,
        title: "Dashboard",
        content: <Outlet />,
        isClosable: true,
      }),
      shouldOpen: (match) => match.route.path === dashboardRoute,
      insertAt: theBeginning,
    },
    {
      properties: (match) => ({
        id: match.pathname,
        title: "Categories",
        content: <Outlet />,
        isClosable: true,
      }),
      shouldOpen: (match) => match.route.path === categoriesRoute,
      insertAt: theBeginning,
    },
    {
      properties: (match) => ({
        id: match.pathname,
        title: "Products",
        content: <Outlet />,
        isClosable: true,
      }),
      shouldOpen: (match) => match.route.path === productsRoute,
      insertAt: theBeginning,
    },
    {
      properties: (match) => ({
        id: match.pathname,
        title: "Suppliers",
        content: <Outlet />,
        isClosable: true,
      }),
      shouldOpen: (match) => match.route.path === suppliersRoute,
      insertAt: theBeginning,
    },
  ]);

  const { uiTabs } = useRouterTabs<Properties>({
    router,
    config,
    tabs: paths,
    onTabsChange: setPaths,
    fallbackPath: homeRoute,
  });

  const setActiveTabId = (id: string | undefined) => {
    const tab = paths.find((path) => {
      const pathname = id;
      const url = new URL(path, window.location.href);
      const matches = matchRoutes(router.routes, url) || [];
      const result = matchRouterTab(matches, config);
      return result?.match.pathname === pathname;
    });
    const [pathname, search] = (tab || homeRoute).split("?");
    setTimeout(() => {
      router.navigate({
        pathname,
        search,
      });
    });
  };

  const matches = matchRoutes(router.routes, router.state.location) || [];
  const result = matchRouterTab(matches, config);

  const activeTabId = result ? result.match.pathname : undefined;

  const setUiTabs = (uiTabs: TabModel[]) => {
    setPaths(uiTabs.map((uiTab) => uiTab.id));
  };

  const finalTabs = uiTabs.map((tab) => tab.properties);

  return (
    <div css={layoutStyles}>
      <header css={headerStyles}>John Doe</header>
      <div css={layoutInner}>
        <Sidebar />
        <div css={contentStyles}>
          <div css={tabsStyles}>
            <Tabs
              tabs={finalTabs}
              onTabsChange={setUiTabs}
              initialActiveTabId={activeTabId}
              initialTabs={finalTabs}
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
