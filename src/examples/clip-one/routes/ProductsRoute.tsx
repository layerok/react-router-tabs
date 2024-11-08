import { Tabs } from "../components/Tabs/Tabs.tsx";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";

import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { data as products } from "../data/products.json";

import { usePersistTabs } from "src/lib/tabs/persist.tsx";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { validateTabs } from "src/lib/tabs";
import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  homeRoute,
  productDetailRoute,
  productDetailSettingTabsRoute,
  productsCreateRoute,
  productsRoute,
} from "../constants/routes.constants.ts";
import {
  RouterTabModel,
  TabConfig,
  useRouterTabs,
} from "src/lib/tabs/useRouterTabs.tsx";
import { css } from "@emotion/react";
import { Table } from "src/examples/clip-one/components/Table/Table.tsx";
import { Button } from "src/examples/clip-one/components/Button/Button.tsx";
import { theBeginning } from "src/lib/tabs/theBeginning.ts";
import { theEnd } from "src/lib/tabs/theEnd.ts";

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

  const [listTab] = useState(() => productsRoute);

  const [config] = useState<
    TabConfig<{
      id: string;
      title: string;
      content: ReactNode;
      isClosable: boolean;
    }>[]
  >(() => [
    {
      properties: (_, path) => ({
        id: path,
        title: "All products",
        isClosable: false,
        content: <Outlet />,
      }),
      shouldOpen: (match) => match.route.path === productsRoute,
      insertAt: theBeginning,
    },
    {
      properties: (match, path) => ({
        title: (() => {
          const product = products.find(
            (product) => String(product.id) === match.params?.id,
          );
          return product!.title;
        })(),
        id: path,
        isClosable: true,
        content: <Outlet />,
      }),
      shouldOpen: (match) => match.route.path === productDetailRoute,
      insertAt: () => 1,
    },
    {
      properties: (_, path) => ({
        title: "New product",
        id: path,
        isClosable: true,
        content: <Outlet />,
      }),
      shouldOpen: (match) => match.route.path === productsCreateRoute,
      insertAt: theEnd,
    },
  ]);

  const [tabs, setTabs] = useState<RouterTabModel[]>(() =>
    validateTabs(getTabsFromStorage() || [listTab], router),
  );

  const { activeTabId, setActiveTabId, uiTabs } = useRouterTabs({
    router,
    config,
    fallbackPath: homeRoute,
    tabs,
    onTabsChange: setTabs,
  });

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  const setUiTabs = (uiTabs: TabModel[]) => {
    setTabs(uiTabs.map((uiTab) => uiTab.id));
  };

  return (
    <div css={layoutStyles}>
      <Tabs
        tabs={uiTabs.map((tab) => tab.properties)}
        onTabsChange={setUiTabs}
        initialActiveTabId={activeTabId}
        initialTabs={uiTabs.map((tab) => tab.properties)}
        hasControlledActiveTabId
        activeTabId={activeTabId}
        onActiveTabIdChange={setActiveTabId}
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

  const generalTab = useMemo<RouterTabModel>(
    () => productDetailRoute.replace(":id", params.id),
    [params.id],
  );
  const settingsTab = useMemo<RouterTabModel>(
    () => productDetailSettingTabsRoute.replace(":id", params.id),
    [params.id],
  );

  const [tabs, setTabs] = useState([generalTab, settingsTab]);

  useEffect(() => {
    setTabs([generalTab, settingsTab]);
  }, [generalTab, settingsTab]);

  const config = useMemo<
    TabConfig<{
      id: string;
      content: ReactNode;
      title: string;
      isClosable: boolean;
    }>[]
  >(
    () => [
      {
        properties: (_, tab) => ({
          title: "General",
          id: tab,
          content: <Outlet />,
          isClosable: false,
        }),
        shouldOpen: (match) => match.route.path === productDetailRoute,
        insertAt: theBeginning,
      },
      {
        properties: (_, tab) => ({
          title: "Settings",
          id: tab,
          content: <Outlet />,
          isClosable: false,
        }),
        shouldOpen: (match) =>
          match.route.path === productDetailSettingTabsRoute,
        insertAt: theBeginning,
      },
    ],
    [],
  );

  const { activeTabId, setActiveTabId, uiTabs } = useRouterTabs({
    router,
    config,
    fallbackPath: homeRoute,
    tabs,
    onTabsChange: setTabs,
  });

  const setUiTabs = (uiTabs: TabModel[]) => {
    setTabs(uiTabs.map((uiTab) => uiTab.id));
  };

  return (
    <div css={detailFormLayout}>
      <Tabs
        tabs={uiTabs.map((tab) => tab.properties)}
        onTabsChange={setUiTabs}
        initialActiveTabId={activeTabId}
        initialTabs={uiTabs.map((tab) => tab.properties)}
        hasControlledActiveTabId
        activeTabId={activeTabId}
        onActiveTabIdChange={setActiveTabId}
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
