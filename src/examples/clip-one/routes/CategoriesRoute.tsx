import { Outlet, useNavigate, useParams } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import { Tabs } from "../components/Tabs/Tabs.tsx";
import {
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

  const { getTabsFromStorage, persistTabs } = usePersistTabs({
    storageKey: persistStoreKey,
    storage: localStorageDriver,
  });

  const defaultTabs: RouterTabModel[] = [
    {
      id: categoriesRoute,
      route: {
        id: categoriesRoute,
      },
      path: categoriesRoute,
    },
  ];

  const [tabs, setTabs] = useState<RouterTabModel[]>(() =>
    validateTabs(getTabsFromStorage() || defaultTabs, router.routes.slice()),
  );

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  const [startPinnedTabs, setStartPinnedTabsChange] = useState<string[]>([
    categoriesRoute,
  ]);

  const config = useMemo<TabConfig[]>(
    () => [
      {
        title: () => "All Categories",
        shouldOpen: (match) => match.route.path === categoriesRoute,
        insertAt: theBeginning,
      },
      {
        title: ({ params }) => {
          const category = categories.find(
            (category) => String(category.id) == params.id,
          );
          return category!.title;
        },
        shouldOpen: (match) => match.route.path === categoryDetailRoute,
        insertAt: () => startPinnedTabs.length,
      },
    ],
    [],
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
      isClosable: !startPinnedTabs.includes(tab.id),
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
      <Tabs
        activeTabId={activeTabId}
        onActiveTabIdChange={setActiveTabId}
        tabs={uiTabs}
        startPinnedTabs={startPinnedTabs}
        initialActiveTabId={activeTabId}
        initialTabs={uiTabs}
        initialStartPinnedTabs={startPinnedTabs}
        onTabsChange={setUiTabs}
        hasControlledActiveTabId
        onStartPinnedTabsChange={setStartPinnedTabsChange}
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
