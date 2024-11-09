import { Sidebar } from "../../components/Sidebar/Sidebar.tsx";
import { Tabs } from "../../components/Tabs/Tabs.tsx";

import { TabStoreKey } from "../../constants/tabs.constants.ts";
import { validateTabPaths } from "src/lib/tabs/validateTabPaths.ts";
import { usePersistTabs } from "src/lib/tabs/usePersistTabs.tsx";

import { useEffect, useMemo, useRef, useState } from "react";

import { localStorageDriver } from "src/lib/storage/local-storage.ts";

import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import { homeRoute } from "../../constants/routes.constants.ts";
import { css } from "@emotion/react";
import { useRouterTabs } from "src/lib/tabs/useRouterTabs.tsx";
import { convertRouteTreeToRouterTabsConfig } from "src/examples/basic/utils/convertRouteTreeToRouterTabsConfig.tsx";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
import { TabsApi } from "src/lib/tabs-ui/useTabs.tsx";

const persistStoreKey = {
  name: "basic__main-tabs",
  version: "2.0",
};

export function AdminLayout() {
  const apiRef = useRef<TabsApi>();
  const { router } = useDataRouterContext();

  const { getTabsFromStorage, persistTabs } = usePersistTabs({
    storage: localStorageDriver,
    storageKey: persistStoreKey,
  });

  const [paths, setPaths] = useState(() =>
    validateTabPaths(getTabsFromStorage() || [], router),
  );

  const config = useMemo(
    () =>
      convertRouteTreeToRouterTabsConfig(
        router.routes.slice(),
        TabStoreKey.Main,
      ),
    [router],
  );

  console.log("config", config);

  const { tabs, activeTab } = useRouterTabs({
    router,
    paths,
    onPathsChange: setPaths,
    config: config,
  });

  useEffect(() => {
    return persistTabs(paths);
  }, [paths, persistTabs]);

  const setTabs = (tabs: TabModel[]) => {
    setPaths(tabs.map((tab) => tab.id));
  };

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

  return (
    <div css={layoutStyles}>
      <Sidebar />
      <div css={contentStyles}>
        <header css={headerStyles}>John Doe</header>
        <Tabs
          apiRef={apiRef}
          tabs={tabs}
          initialTabs={tabs}
          onTabsChange={setTabs}
          hasControlledActiveTabId
          activeTabId={activeTabId}
          onActiveTabIdChange={setActiveTabId}
        />
      </div>
    </div>
  );
}

const layoutStyles = css`
  display: grid;
  grid-template-columns: minmax(150px, 25%) 1fr;
  min-height: 100vh;
`;

const contentStyles = css`
  display: flex;
  flex-direction: column;
`;

const headerStyles = css`
  height: 40px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 16px;
  justify-content: end;
`;
