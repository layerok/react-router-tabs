import { Outlet, RouteObject } from "react-router-dom";
import { flattenRoutes } from "src/lib/tabs/flattenRoutes.ts";
import { Handle } from "src/examples/basic/types.ts";
import { TabConfig } from "src/lib/tabs/useRouterTabs.tsx";
import { theBeginning } from "src/lib/tabs/theBeginning.ts";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
import { whenRoutePathIs } from "src/lib/tabs/whenRoutePathIs.ts";

export const convertRouteTreeToRouterTabsConfig = (
  tree: RouteObject[],
  key: any,
) => {
  const flatRoutes = flattenRoutes(tree);

  const matchedRoutes = flatRoutes.filter((route) => {
    return (route.handle as Handle)?.tabs.find((tab) => tab.key === key);
  });

  const config: TabConfig<TabModel>[] = matchedRoutes.map((route) => {
    const handle = route.handle as Handle;
    const tabMeta = handle.tabs.find((tab) => (tab.key = key));

    return {
      mapToUiState: (match, path) => ({
        id: path,
        title: tabMeta!.title(match),
        isClosable: true,
        content: <Outlet />,
      }),
      shouldOpen: whenRoutePathIs(route.path!),
      insertAt: tabMeta!.insertAt || theBeginning,
    };
  });
  return config;
};
