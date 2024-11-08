import { DataRouteMatch, matchRoutes } from "react-router-dom";
import { useCallback, useEffect, useRef } from "react";
import { RouterState } from "@remix-run/router";
import { last, replaceAt, insertAt } from "src/utils/array-utils.ts";
import { Router } from "@remix-run/router";

type ValidProperties = Record<string, any>;

export type TabConfig<Properties extends ValidProperties = ValidProperties> = {
  shouldOpen: (match: DataRouteMatch) => boolean;
  insertAt: (tabs: RouterTabModel[]) => number;
  properties: (match: DataRouteMatch, path: RouterTabModel) => Properties;
};

export type RouterTabModel = string;

type TabsChangeCallback = (tabs: RouterTabModel[]) => void;

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

export const useRouterTabs = <
  Properties extends ValidProperties = ValidProperties,
>(options: {
  router: Router;
  config: TabConfig<Properties>[];
  onTabsChange?: TabsChangeCallback;
  tabs: RouterTabModel[];
  fallbackPath: string;
}) => {
  const {
    fallbackPath,
    onTabsChange,
    tabs: tabsProps = [],
    config,
    router,
  } = options;
  const tabs = useRef<RouterTabModel[]>(tabsProps);
  tabs.current = tabsProps;

  const updateTabs = useCallback(
    (state: RouterState) => {
      const { matches, location, navigation } = state;

      if (navigation.location) {
        return;
      }
      console.log("fire subscriber");
      console.log("fire subscriber state", state.location.pathname);
      console.log("fire subscriber tabs", tabs.current);
      const result = matchRouterTab(matches, config);

      if (!result) {
        return;
      }
      const { definition, match } = result;
      const getNextTabs = () => {
        const prevTabs = tabs.current;

        const tab = prevTabs.find((tab) => {
          const matches = matchRoutes(router.routes, tab) || [];

          const result = matchRouterTab(matches, config);

          return result && result.match.pathname === match.pathname;
        });

        const { pathname } = last(matches);
        const { search } = location;
        const path = pathname + (search ? `${search}` : "");

        if (tab) {
          // update the tab path
          const index = prevTabs.indexOf(tab);

          return replaceAt(prevTabs, index, path);
        } else {
          const newTab: RouterTabModel = path;
          return insertAt(prevTabs, definition.insertAt(prevTabs), newTab);
        }
      };
      onTabsChange?.(getNextTabs());
    },
    [config, onTabsChange, router.routes],
  );

  useEffect(() => {
    // fire immediately
    updateTabs(router.state);
    return router.subscribe(updateTabs);
  }, [router, updateTabs]);

  const getTabPropertiesByTabPath = (path: string) => {
    const matches = matchRoutes(router.routes, path) || [];

    const result = matchRouterTab(matches, config);
    if (result) {
      return result.definition.properties(result.match, path);
    }
    return undefined;
  };

  const uiTabs = tabs.current.map((tab) => {
    return {
      id: tab,
      properties: getTabPropertiesByTabPath(tab) as Properties,
    };
  });

  return {
    getTabPropertiesByTabPath,
    uiTabs,
  };
};
