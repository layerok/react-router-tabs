import { DataRouteMatch, matchRoutes } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { RouterState } from "@remix-run/router";
import { last, replaceAt, insertAt } from "src/utils/array-utils.ts";
import { Router } from "@remix-run/router";

export type TabConfig = {
  shouldOpen: (match: DataRouteMatch) => boolean;
  insertAt: (tabs: RouterTabModel[]) => number;
  title: (match: DataRouteMatch) => string;
};

export type RouterTabModel = {
  id: string;
  route: {
    id: string;
  };
  path: string;
};

type TabsChangeCallback = (
  tabs:
    | RouterTabModel[]
    | {
        (prevTabs: RouterTabModel[]): RouterTabModel[];
      },
) => void;

export const matchRouterTab = (
  matches: DataRouteMatch[],
  config: TabConfig[],
) => {
  for (let i = matches.length - 1; i > -1; i--) {
    const match = matches[i];
    const definition = config.find((def) => def.shouldOpen(match));
    if (definition) {
      return {
        definition,
        match,
      };
    }
  }
  return undefined;
};

export const useRouterTabs = (options: {
  router: Router;
  config: TabConfig[];
  onTabsChange?: TabsChangeCallback;
  tabs: RouterTabModel[];
  fallbackPath: string;
}) => {
  const { fallbackPath, onTabsChange, tabs = [], config, router } = options;

  const updateTabs = useCallback(
    (state: RouterState) => {
      const { matches, location, navigation } = state;

      if (navigation.location) {
        return;
      }

      const result = matchRouterTab(matches, config);

      if (!result) {
        return;
      }

      const handleTabsUpdate = (prevTabs: RouterTabModel[]) => {
        const { definition, match } = result;

        const tab = prevTabs.find((tab) => tab.id === match.pathname);

        const { pathname } = last(matches);
        const { search } = location;
        const path = pathname + (search ? `${search}` : "");

        if (tab) {
          // update the tab path
          const index = prevTabs.indexOf(tab);

          return replaceAt(prevTabs, index, {
            ...tab,
            path,
          });
        } else {
          const newTab: RouterTabModel = {
            id: match.pathname,
            route: {
              id: match.route.id,
            },
            path,
          };
          return insertAt(prevTabs, definition.insertAt(prevTabs), newTab);
        }
      };
      onTabsChange?.(handleTabsUpdate);
    },
    [config, onTabsChange],
  );

  useEffect(() => {
    // fire immediately
    updateTabs(router.state);
    return router.subscribe(updateTabs);
  }, [router, updateTabs]);

  const setActiveTabId = (id: string | undefined) => {
    const tab = tabs.find((tab) => tab.id === id);
    if (tab) {
      const [pathname, search] = tab.path.split("?");
      router.navigate({
        pathname,
        search,
      });
    } else {
      router.navigate(fallbackPath);
    }
  };

  const matches = matchRoutes(router.routes, router.state.location) || [];

  const activeTabId = matchRouterTab(matches, config)?.match?.pathname;

  const getTabTitleByTabPath = (path: string) => {
    const matches = matchRoutes(router.routes, path) || [];

    const result = matchRouterTab(matches, config);
    if (result) {
      return result.definition.title(result.match);
    }
    return undefined;
  };

  return {
    setActiveTabId,
    activeTabId,
    getTabTitleByTabPath,
  };
};
