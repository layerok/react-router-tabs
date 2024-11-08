import { matchRoutes, Outlet, useNavigate, useParams } from "react-router-dom";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Tabs } from "../components/Tabs/Tabs.tsx";
import {
  matchRouterTab,
  RouterTabModel,
  TabConfig,
  useRouterTabs,
} from "src/lib/tabs/useRouterTabs.tsx";
import { data as categories } from "../data/categories.json";

import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
import { usePersistTabs } from "src/lib/tabs/persist.tsx";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { validateTabs } from "src/lib/tabs";
import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  homeRoute,
  categoryDetailRoute,
  categoriesRoute,
} from "../constants/routes.constants.ts";
import { css } from "@emotion/react";
import { Table } from "src/examples/clip-one/components/Table/Table.tsx";
import { theBeginning } from "src/lib/tabs/theBeginning.ts";

const persistStoreKey = {
  name: "clip-one__category-tabs",
  version: "4.0",
};

export function CategoriesRoute() {
  const { router } = useDataRouterContext();

  // const { getTabsFromStorage, persistTabs } = usePersistTabs({
  //   storageKey: persistStoreKey,
  //   storage: localStorageDriver,
  // });

  const defaultTabs: RouterTabModel[] = [categoriesRoute];
  //
  // const persistedTabs = validateTabs(defaultTabs, router);
  //
  // console.log("persistedTabs", persistedTabs.length);

  const [paths, setPaths] = useState<RouterTabModel[]>(defaultTabs);

  const config = useMemo<
    TabConfig<{
      id: string;
      title: string;
      isClosable: boolean;
      content: ReactNode;
    }>[]
  >(
    () => [
      {
        properties: (match) => ({
          id: match.pathname,
          title: "All Categories",
          content: <Outlet />,
          isClosable: false,
        }),
        shouldOpen: (match) => match.route.path === categoriesRoute,
        insertAt: theBeginning,
      },
      {
        properties: (match) => ({
          id: match.pathname,
          title: (() => {
            const category = categories.find(
              (category) => String(category.id) == match.params.id,
            );
            return category!.title;
          })(),
          content: <Outlet />,
          isClosable: true,
        }),
        shouldOpen: (match) => match.route.path === categoryDetailRoute,
        insertAt: () => 1,
      },
    ],
    [],
  );

  const { uiTabs } = useRouterTabs({
    router,
    config: config,
    fallbackPath: homeRoute,
    tabs: paths,
    onTabsChange: setPaths,
  });

  const setActiveTabId = (id: string | undefined) => {
    const tab = paths.find((path) => {
      const pathname = id;
      const url = new URL(path, window.location.origin);
      const matches = matchRoutes(router.routes, url) || [];
      const result = matchRouterTab(matches, config);
      return result?.match.pathname === pathname;
    });

    setTimeout(() => {
      const [pathname, search] = (tab || homeRoute).split("?");
      router.navigate({
        pathname,
        search,
      });
    });
  };

  const matches = matchRoutes(router.routes, router.state.location) || [];
  const result = matchRouterTab(matches, config);

  const activeTabId = result ? result.match.pathname : undefined;

  // useEffect(() => {
  //   return persistTabs(paths);
  // }, [paths, persistTabs]);

  const setUiTabs = (uiTabs: TabModel[]) => {
    setPaths(uiTabs.map((uiTab) => uiTab.id));
  };

  const finalTabs = uiTabs.map((tab) => tab.properties);

  return (
    <div css={layoutStyles}>
      <Tabs
        activeTabId={activeTabId}
        onActiveTabIdChange={setActiveTabId}
        tabs={finalTabs}
        initialActiveTabId={activeTabId}
        initialTabs={finalTabs}
        onTabsChange={setUiTabs}
        hasControlledActiveTabId
      />
    </div>
  );
}

export function CategoryListRoute() {
  const navigate = useNavigate();
  // const apiRef = useTabsApiRefContext();
  // const { parentTabsApi } = apiRef?.current.getState() || {};
  // console.log(parentTabsApi?.getActiveTab());

  return (
    <div>
      <Table
        rows={categories}
        onRowClick={(row) => {
          navigate(categoryDetailRoute.replace(":id", String(row.id)));
        }}
        columns={[
          {
            field: "id",
            name: "ID",
            width: 40,
          },
          {
            field: "title",
            name: "Title",
            width: 100,
          },
        ]}
      />
    </div>
  );
}

const layoutStyles = css`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export function CategoryDetailRoute() {
  const params = useParams();
  return <div>category {params.id}</div>;
}
