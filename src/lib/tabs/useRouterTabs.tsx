import { DataRouteMatch, Location, matchRoutes } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { RouterState } from "@remix-run/router";
import { replaceAt, insertAt } from "src/utils/array-utils.ts";
import { Router } from "@remix-run/router";

type ValidUiState = Record<string, any>;

export type TabDefinition<UiState extends ValidUiState = ValidUiState> = {
  shouldOpen: (match: DataRouteMatch) => boolean;
  insertAt: (tabs: RouterTabPath[]) => number;
  mapToUiModel: (
    key: string,
    match: DataRouteMatch,
    fullPath: RouterTabPath,
  ) => UiState;
};

export type RouterTabPath = string;

type PathsChangeCallback = (
  paths: RouterTabPath[] | { (prevPaths: RouterTabPath[]): RouterTabPath[] },
) => void;

type MatchRouterTabResult = {
  definition: TabDefinition;
  match: DataRouteMatch;
};

export const matchRouterTab = <UiState extends ValidUiState = ValidUiState>(
  matches: DataRouteMatch[],
  config: TabDefinition<UiState>[],
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
  getUiModelKey: (model: UiState) => string;
  undefinedKeyPath: string;
}) => {
  const {
    onPathsChange,
    paths,
    config,
    router,
    undefinedKeyPath,
    getUiModelKey,
  } = options;

  const getTabKey = (match: DataRouteMatch) => match.pathname;

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

        const path = getPathFromLocation(location);

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
    const key = getTabKey(match);
    return definition.mapToUiModel(key, match, path);
  };

  const reducer = (acc: Record<string, string>, path: string) => {
    const matches = matchRoutes(router.routes, path) || [];
    const result = matchRouterTab(matches, config);

    if (!result) {
      return acc;
    }
    const { match } = result;
    const key = getTabKey(match);

    return {
      ...acc,
      [key]: path,
    };
  };

  const keyToFullPathMap = paths.reduce(reducer, {} as Record<string, string>);

  const tabs = paths
    .map(toUiState)
    .filter((tab): tab is UiState => Boolean(tab));

  const setTabs = (tabs: UiState[]) => {
    onPathsChange?.(tabs.map((tab) => keyToFullPathMap[getUiModelKey(tab)]));
  };

  const setActiveTabKey = (key: string | undefined) => {
    const path = key ? keyToFullPathMap[key] : undefinedKeyPath;
    router.navigate(path);
  };

  const activeTab = toUiState(getPathFromLocation(router.state.location)) as
    | UiState
    | undefined;

  const activeTabKey = activeTab ? getUiModelKey(activeTab) : undefined;

  return {
    tabs,
    activeTab,
    activeTabKey,
    setActiveTabKey,
    setTabs,
  };
};

const getPathFromLocation = (location: Location) => {
  const { pathname, search, hash } = location;

  return normalizePathname(pathname) + search + hash;
};

const normalizePathname = (pathname: string) =>
  pathname.endsWith("/") ? pathname : pathname + "/";
