import { DataRouteMatch, matchRoutes } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { RouterState } from "@remix-run/router";
import { last, replaceAt, insertAt } from "src/utils/array-utils.ts";
import { Router } from "@remix-run/router";
import { getUrl } from "src/lib/tabs/getUrl.ts";
import { normalizePathname } from "src/lib/tabs/normalizePathname.ts";

type ValidUiState = Record<string, any>;

export type TabConfig<UiState extends ValidUiState = ValidUiState> = {
  shouldOpen: (match: DataRouteMatch) => boolean;
  insertAt: (tabs: RouterTabPath[]) => number;
  mapToUiState: (match: DataRouteMatch, path: RouterTabPath) => UiState;
};

export type RouterTabPath = string;

type PathsChangeCallback = (
  paths: RouterTabPath[] | { (prevPaths: RouterTabPath[]): RouterTabPath[] },
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

export const useRouterTabs = <
  UiState extends ValidUiState = ValidUiState,
>(options: {
  router: Router;
  config: TabConfig<UiState>[];
  onPathsChange?: PathsChangeCallback;
  paths: RouterTabPath[];
}) => {
  const { onPathsChange, paths, config, router } = options;

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
      const { definition, match } = result;
      const getNextPaths = (prevPaths: RouterTabPath[]) => {
        const tab = prevPaths.find((path) => {
          const matches = matchRoutes(router.routes, path) || [];
          const result = matchRouterTab(matches, config);
          return (
            result &&
            normalizePathname(result.match.pathname) ===
              normalizePathname(match.pathname)
          );
        });

        const { pathname } = last(matches);
        const { search } = location;
        const path = normalizePathname(pathname) + search;

        if (tab) {
          // update the tab path
          const index = prevPaths.indexOf(tab);

          return replaceAt(prevPaths, index, path);
        } else {
          return insertAt(prevPaths, definition.insertAt(prevPaths), path);
        }
      };
      onPathsChange?.(getNextPaths);
    },
    [config, onPathsChange, router.routes],
  );

  useEffect(() => {
    // fire immediately
    updateTabs(router.state);
    return router.subscribe(updateTabs);
  }, [router, updateTabs]);

  const tabs = paths.map((path) => {
    const matches = matchRoutes(router.routes, path) || [];
    const result = matchRouterTab(matches, config)!;

    return result.definition.mapToUiState(result.match, path) as UiState;
  });

  const matches = matchRoutes(router.routes, router.state.location) || [];
  const result = matchRouterTab(matches, config);

  const activeTab = result?.definition.mapToUiState(
    result.match,
    getUrl(router.state.location),
  ) as UiState | undefined;

  return {
    tabs,
    activeTab,
  };
};
