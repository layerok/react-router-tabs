import { DataRouteMatch, Location, matchRoutes } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { RouterState } from "@remix-run/router";
import { replaceAt, insertAt } from "src/utils/array-utils.ts";
import { Router } from "@remix-run/router";
import { normalizePathname } from "src/lib/tabs/normalizePathname.ts";

type ValidUiState = Record<string, any>;

export type TabDefinition<UiState extends ValidUiState = ValidUiState> = {
  shouldOpen: (match: DataRouteMatch) => boolean;
  insertAt: (tabs: RouterTabPath[]) => number;
  mapToUiState: (match: DataRouteMatch, path: RouterTabPath) => UiState;
};

export type RouterTabPath = string;

type PathsChangeCallback = (
  paths: RouterTabPath[] | { (prevPaths: RouterTabPath[]): RouterTabPath[] },
) => void;

type MatchRouterTabResult = {
  definition: TabDefinition;
  match: DataRouteMatch;
};

export const matchRouterTab = (
  matches: DataRouteMatch[],
  config: TabDefinition[],
): MatchRouterTabResult | undefined => {
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
  config: TabDefinition<UiState>[];
  onPathsChange?: PathsChangeCallback;
  paths: RouterTabPath[];
}) => {
  const { onPathsChange, paths, config, router } = options;

  const isOpenFor = useCallback(
    (match: DataRouteMatch) => (path: string) => {
      const matches = matchRoutes(router.routes, path) || [];
      const result = matchRouterTab(matches, config);

      if (!result) {
        return false;
      }

      return (
        normalizePathname(result.match.pathname) ===
        normalizePathname(match.pathname)
      );
    },
    [router.routes, config],
  );

  const updateTabs = useCallback(
    (state: RouterState) => {
      const { matches, location, navigation } = state;

      if (navigation.location) {
        return;
      }

      const matchResult = matchRouterTab(matches, config);

      if (!matchResult) {
        return;
      }

      const getNextPaths = (prevPaths: RouterTabPath[]) => {
        const tab = prevPaths.find(isOpenFor(matchResult.match));

        const path = getUrl(location);

        if (tab) {
          // update the tab path
          const index = prevPaths.indexOf(tab);

          return replaceAt(prevPaths, index, path);
        } else {
          return insertAt(
            prevPaths,
            matchResult.definition.insertAt(prevPaths),
            path,
          );
        }
      };
      onPathsChange?.(getNextPaths);
    },
    [config, onPathsChange, isOpenFor],
  );

  useEffect(() => {
    // fire immediately
    updateTabs(router.state);
    return router.subscribe(updateTabs);
  }, [router, updateTabs]);

  const toUiState = (path: string) => {
    const matches = matchRoutes(router.routes, path) || [];
    const result = matchRouterTab(matches, config);

    if (!result) {
      return undefined;
    }
    const { definition, match } = result;
    return definition.mapToUiState(match, path);
  };

  const tabs = paths
    .map(toUiState)
    .filter((tab): tab is UiState => Boolean(tab));

  const activeTab = toUiState(getUrl(router.state.location)) as
    | UiState
    | undefined;

  return {
    tabs,
    activeTab,
  };
};

const getUrl = (location: Location) => {
  const { pathname, search } = location;

  return normalizePathname(pathname) + search;
};
