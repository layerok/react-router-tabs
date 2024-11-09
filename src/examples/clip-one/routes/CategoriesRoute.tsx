import { Outlet, useNavigate, useParams } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import { Tabs } from "../components/Tabs/Tabs.tsx";
import {
  RouterTabPath,
  TabDefinition,
  useRouterTabs,
} from "src/lib/tabs/useRouterTabs.tsx";
import { data as categories } from "../data/categories.json";

import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
import { usePersistTabs } from "src/lib/tabs/usePersistTabs.tsx";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { validateTabPaths } from "src/lib/tabs/validateTabPaths.ts";
import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  homeRoute,
  categoryDetailRoute,
  categoriesRoute,
} from "../constants/routes.constants.ts";
import { css } from "@emotion/react";
import { Table } from "src/examples/clip-one/components/Table/Table.tsx";
import { theBeginning } from "src/lib/tabs/theBeginning.ts";
import { whenRoutePathIs } from "src/lib/tabs/whenRoutePathIs.ts";

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

  const defaultTabs: RouterTabPath[] = [categoriesRoute];

  const [paths, setPaths] = useState<RouterTabPath[]>(
    validateTabPaths(getTabsFromStorage() || defaultTabs, router),
  );

  const config = useMemo<TabDefinition<TabModel>[]>(
    () => [
      {
        mapToUiState: (_, path) => ({
          id: path,
          title: "All Categories",
          content: <Outlet />,
          isClosable: false,
        }),
        shouldOpen: whenRoutePathIs(categoriesRoute),
        insertAt: theBeginning,
      },
      {
        mapToUiState: (match, path) => ({
          id: path,
          title: (() => {
            const category = categories.find(
              (category) => String(category.id) == match.params.id,
            );
            return category!.title;
          })(),
          content: <Outlet />,
          isClosable: true,
        }),
        shouldOpen: whenRoutePathIs(categoryDetailRoute),
        insertAt: () => 1,
      },
    ],
    [],
  );

  const { tabs, activeTab, setActivePath } = useRouterTabs({
    router,
    config,
    paths,
    onPathsChange: setPaths,
    undefinedPath: homeRoute,
  });

  useEffect(() => {
    return persistTabs(paths);
  }, [paths, persistTabs]);

  const setTabs = (tabs: TabModel[]) => {
    setPaths(tabs.map((tab) => tab.id));
  };

  return (
    <div css={layoutStyles}>
      <Tabs
        activeTabId={activeTab?.id}
        initialActiveTabId={activeTab?.id}
        onActiveTabIdChange={setActivePath}
        tabs={tabs}
        initialTabs={tabs}
        onTabsChange={setTabs}
        hasControlledActiveTabId
      />
    </div>
  );
}

export function CategoryListRoute() {
  const navigate = useNavigate();

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
