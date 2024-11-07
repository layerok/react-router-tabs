import { RouteObject, UIMatch } from "react-router-dom";
import { Handle, TabHandle } from "./types";
import { flattenRoutes } from "src/lib/tabs";
import { InsertMethod, TabConfig } from "src/lib/tabs/useRouterTabs.tsx";

export const convertRouteTreeToConfig = (tree: RouteObject[], key: any) => {
  const flatRoutes = flattenRoutes(tree);

  const matchedRoutes = flatRoutes.filter((route) => {
    return (route.handle as Handle)?.tabs.find((tab) => tab.key === key);
  });

  const config: TabConfig[] = matchedRoutes.map((route) => {
    const handle = route.handle as Handle;
    const tabMeta = handle.tabs.find((tab) => (tab.key = key));

    return {
      title: tabMeta!.title,
      routeId: route.id!,
      insertMethod: InsertMethod.Prepend,
    };
  });
  return config;
};

export const getTabHandleUI =
  (key: string) =>
  (match: UIMatch<any, Handle>): TabHandle | undefined => {
    return match?.handle?.tabs.find(
      (tabHandle: TabHandle) => tabHandle.key === key,
    );
  };
