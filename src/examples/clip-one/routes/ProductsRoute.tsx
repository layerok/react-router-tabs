import { Tabs } from "../components/Tabs/Tabs.tsx";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";

import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { data as products } from "../data/products.json";

import { usePersistTabs } from "src/lib/tabs/usePersistTabs.tsx";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { validateTabPaths } from "src/lib/tabs/validateTabPaths.ts";
import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  homeRoute,
  productDetailRoute,
  productDetailSettingTabsRoute,
  productsCreateRoute,
  productsRoute,
} from "../constants/routes.constants.ts";
import {
  RouterTabPath,
  TabDefinition,
  useRouterTabs,
} from "src/lib/tabs/useRouterTabs.tsx";
import { css } from "@emotion/react";
import { Table } from "src/examples/clip-one/components/Table/Table.tsx";
import { Button } from "src/examples/clip-one/components/Button/Button.tsx";
import { theBeginning } from "src/lib/tabs/theBeginning.ts";
import { theEnd } from "src/lib/tabs/theEnd.ts";
import { whenRoutePathIs } from "src/lib/tabs/whenRoutePathIs.ts";

type DetailParams = { id: string };

const persistStoreKey = {
  name: "clip-one__product-tabs",
  version: "4.0",
};

export function ProductsRoute() {
  const { router } = useDataRouterContext();
  const { getTabsFromStorage, persistTabs } = usePersistTabs({
    storageKey: persistStoreKey,
    storage: localStorageDriver,
  });

  const [defaultTabs] = useState(() => [productsRoute]);

  const [paths, setPaths] = useState<RouterTabPath[]>(() =>
    validateTabPaths(getTabsFromStorage() || defaultTabs, router),
  );

  const { tabs, activeTab, setActivePath } = useRouterTabs({
    router,
    config: useMemo(
      () => [
        {
          mapToUiState: (_, path) => ({
            id: path,
            title: "All products",
            isClosable: false,
            content: <Outlet />,
          }),
          shouldOpen: whenRoutePathIs(productsRoute),
          insertAt: theBeginning,
        },
        {
          mapToUiState: (match, path) => ({
            id: path,
            title: (() => {
              const product = products.find(
                (product) => String(product.id) === match.params?.id,
              );
              return product!.title;
            })(),
            isClosable: true,
            content: <Outlet />,
          }),
          shouldOpen: whenRoutePathIs(productDetailRoute),
          insertAt: () => 1,
        },
        {
          mapToUiState: (_, path) => ({
            id: path,
            title: "New product",
            isClosable: true,
            content: <Outlet />,
          }),
          shouldOpen: whenRoutePathIs(productsCreateRoute),
          insertAt: theEnd,
        },
      ],
      [],
    ),
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

  const activeTabId = activeTab?.id;

  return (
    <div css={layoutStyles}>
      <Tabs
        tabs={tabs}
        onTabsChange={setTabs}
        initialTabs={tabs}
        hasControlledActiveTabId
        activeTabId={activeTabId}
        initialActiveTabId={activeTabId}
        onActiveTabIdChange={setActivePath}
      />
    </div>
  );
}

export function ProductListRoute() {
  const navigate = useNavigate();
  return (
    <div>
      <div>
        <Button
          onClick={() => {
            navigate(productsCreateRoute);
          }}
        >
          create new product
        </Button>
      </div>
      <div
        style={{
          marginTop: 10,
        }}
      >
        <Table
          onRowClick={(row) => {
            navigate(productDetailRoute.replace(":id", String(row.id)));
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
              width: 150,
            },
          ]}
          rows={products}
        />
      </div>
    </div>
  );
}

const layoutStyles = css`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export function ProductDetailRoute() {
  const params = useParams() as DetailParams;
  const { router } = useDataRouterContext();

  const [paths, setPaths] = useState([
    productDetailRoute.replace(":id", params.id),
    productDetailSettingTabsRoute.replace(":id", params.id),
  ]);

  const config = useMemo<TabDefinition<TabModel>[]>(
    () => [
      {
        mapToUiState: (_, tab) => ({
          title: "General",
          id: tab,
          content: <Outlet />,
          isClosable: false,
        }),
        shouldOpen: whenRoutePathIs(productDetailRoute),
        insertAt: theBeginning,
      },
      {
        mapToUiState: (_, tab) => ({
          title: "Settings",
          id: tab,
          content: <Outlet />,
          isClosable: false,
        }),
        shouldOpen: whenRoutePathIs(productDetailSettingTabsRoute),
        insertAt: theBeginning,
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

  const setTabs = (tabs: TabModel[]) => {
    setPaths(tabs.map((tab) => tab.id));
  };
  const activeTabId = activeTab?.id;

  return (
    <div css={detailFormLayout}>
      <Tabs
        tabs={tabs}
        initialTabs={tabs}
        onTabsChange={setTabs}
        initialActiveTabId={activeTabId}
        hasControlledActiveTabId
        activeTabId={activeTabId}
        onActiveTabIdChange={setActivePath}
      />
    </div>
  );
}

const detailFormLayout = css({
  flexGrow: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
});

export function ProductGeneralTab() {
  return <div>General</div>;
}

export function ProductSettingsTab() {
  return <div>Settings</div>;
}

export function ProductCreateRoute() {
  return <div>Create product</div>;
}
