import { Tabs } from "../components/Tabs/Tabs.tsx";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";

import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { routeIds } from "../routes.tsx";
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
  productsListRoute,
} from "../constants/routes.constants.ts";
import {
  InsertMethod,
  RouterTabModel,
  TabConfig,
  useRouterTabs,
} from "src/lib/tabs/useRouterTabs.tsx";
import { css } from "@emotion/react";
import { Table } from "src/examples/clip-one/components/Table/Table.tsx";
import { Button } from "src/examples/clip-one/components/Button/Button.tsx";

type DetailParams = { id: string };

const persistStoreKey = {
  name: "clip-one__product-tabs",
  version: "2.0",
};

export function ProductsRoute() {
  const { router } = useDataRouterContext();
  const { getTabsFromStorage, persistTabs } = usePersistTabs({
    storageKey: persistStoreKey,
    storage: localStorageDriver,
  });

  const [listTab] = useState(() => ({
    id: productsListRoute,
    route: {
      id: routeIds.product.list,
      path: productsListRoute,
    },
    path: productsListRoute,
  }));

  const [config] = useState<TabConfig[]>(() => [
    {
      title: () => "All products",
      routeId: routeIds.product.list,
      insertMethod: InsertMethod.Prepend,
    },
    {
      title: (match) => {
        const product = products.find(
          (product) => String(product.id) === match.params?.id,
        );
        return product!.title;
      },
      routeId: routeIds.product.detail,
      insertMethod: InsertMethod.Prepend,
    },
    {
      title: () => "New product",
      id: productsCreateRoute,
      routeId: routeIds.product.create,
      insertMethod: InsertMethod.Append,
    },
  ]);

  const [tabs, setTabs] = useState<RouterTabModel[]>(() =>
    validateTabs(getTabsFromStorage() || [listTab], router.routes.slice()),
  );

  const [startPinnedTabs, setStartPinnedTabs] = useState<string[]>([
    productsListRoute,
  ]);

  const [endPinnedTabs, setEndPinnedTabs] = useState<string[]>([]);

  const { activeTabId, setActiveTabId, getTabTitleByTabPath } = useRouterTabs({
    router,
    config,
    fallbackPath: homeRoute,
    startPinnedTabs,
    tabs,
    endPinnedTabs,
    onTabsChange: setTabs,
  });

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  const uiTabs: TabModel[] = tabs.map((tab) => {
    return {
      id: tab.id,
      content: <Outlet />,
      title: getTabTitleByTabPath(tab.path)!,
      isClosable: startPinnedTabs.includes(tab.id),
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
        tabs={uiTabs}
        onTabsChange={setUiTabs}
        onStartPinnedTabsChange={setStartPinnedTabs}
        startPinnedTabs={startPinnedTabs}
        endPinnedTabs={endPinnedTabs}
        onEndPinnedTabsChange={setEndPinnedTabs}
        initialActiveTabId={activeTabId}
        initialTabs={uiTabs}
        initialStartPinnedTabs={startPinnedTabs}
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
    () => ({
      id: productDetailRoute.replace(":id", params.id),
      route: {
        id: routeIds.product.detail,
        path: productDetailRoute,
      },
      path: productDetailRoute.replace(":id", params.id),
    }),
    [params.id],
  );
  const settingsTab = useMemo<RouterTabModel>(
    () => ({
      id: productDetailSettingTabsRoute.replace(":id", params.id),

      route: {
        id: routeIds.product.tabs.settings,
        path: productDetailSettingTabsRoute,
      },
      path: productDetailSettingTabsRoute.replace(":id", params.id),
    }),
    [params.id],
  );

  const [tabs, setTabs] = useState([generalTab, settingsTab]);

  useEffect(() => {
    setTabs([generalTab, settingsTab]);
  }, [generalTab, settingsTab]);

  const config = useMemo(
    () => [
      {
        title: () => "General",
        routeId: routeIds.product.detail,
        insertMethod: InsertMethod.Prepend,
      },
      {
        title: () => "Settings",
        routeId: routeIds.product.tabs.settings,
        insertMethod: InsertMethod.Prepend,
      },
    ],
    [],
  );

  const { activeTabId, setActiveTabId, getTabTitleByTabPath } = useRouterTabs({
    router,
    config,
    fallbackPath: homeRoute,
    tabs,
    startPinnedTabs: useMemo(() => [], []),
    endPinnedTabs: useMemo(() => [], []),
    onTabsChange: setTabs,
  });

  const uiTabs: TabModel[] = tabs.map((tab) => {
    return {
      id: tab.id,
      content: <Outlet />,
      title: getTabTitleByTabPath(tab.path)!,
      isClosable: false,
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
    <div css={detailFormLayout}>
      <Tabs
        tabs={uiTabs}
        onTabsChange={setUiTabs}
        initialActiveTabId={activeTabId}
        initialTabs={uiTabs}
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
