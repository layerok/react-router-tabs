import { type DataRouteMatch, matchRoutes } from "react-router-dom";
import { useCallback, useEffect, useMemo } from "react";
import type { Router, RouterState } from "@remix-run/router";

import { useLocation } from "react-router";
import { insertAt, replaceAt } from "src/utils/array-utils.ts";
import { Location } from "@remix-run/router/history.ts";

type ValidUiModel = Record<string, any>;
export type RouterTabPath = string;

export type TabDefinition<UiModel extends ValidUiModel = ValidUiModel> = {
  shouldOpen: (match: DataRouteMatch) => boolean;
  insertAt: (tabs: RouterTabPath[]) => number;
  mapToUiModel: (
    id: string,
    match: DataRouteMatch,
    path: RouterTabPath,
  ) => UiModel;
};

export const useRouterTabs = <UiModel extends ValidUiModel = ValidUiModel>({
  paths,
  onPathsChange,
  config,
  router,
  fallbackPath,
}: {
  router: Router;
  paths: string[];
  fallbackPath: string;
  config: TabDefinition<UiModel>[];
  onPathsChange: { (paths: string[] | { (paths: string[]): string[] }): void };
}) => {
  const location = useLocation();

  const syncTabs = useCallback(
    (state: RouterState) => {
      const { matches, location, navigation } = state;

      if (navigation.location) {
        return;
      }

      for (let i = matches.length - 1; i > -1; i--) {
        const match = matches[i];

        for (let i = 0; i < config.length; i++) {
          const def = config[i];
          if (!def.shouldOpen(match)) {
            continue;
          }

          onPathsChange?.(
            getPathsUpdater({
              def,
              match,
              router,
              location,
            }),
          );
          return;
        }
      }
    },
    [router, onPathsChange, config],
  );

  useEffect(() => {
    // fire immediately
    syncTabs(router.state);
    return router.subscribe(syncTabs);
  }, [syncTabs, router]);

  const tabs = useMemo(() => {
    return paths
      .map((path) =>
        convertPathToUiModel({
          path,
          config,
          router,
        }),
      )
      .filter((tab): tab is UiModel => !!tab);
  }, [paths, config, router]);
  const { pathname, search, hash } = location;

  const currentPath = normalizePathname(pathname) + search + hash;

  const currentModel = useMemo(() => {
    return convertPathToUiModel({
      path: currentPath,
      config,
      router,
    });
  }, [currentPath, config, router]);

  const activeTabId = currentModel?.id;

  const idToPathMap = useMemo(() => {
    return convertPathsToIdMap({
      paths,
      config,
      router,
    });
  }, [paths, router, config]);

  const handleTabsChange = useCallback(
    (tabs: UiModel[]) => {
      onPathsChange?.(tabs.map((tab) => idToPathMap[tab.id]));
    },
    [onPathsChange, idToPathMap],
  );

  const handleActiveTabIdChange = useCallback(
    (id: string | undefined) => {
      if (id) {
        router.navigate(idToPathMap[id]);
      } else {
        router.navigate(fallbackPath);
      }
    },
    [router, fallbackPath, idToPathMap],
  );
  return {
    tabs,
    activeTabId,
    onActiveTabIdChange: handleActiveTabIdChange,
    onTabsChange: handleTabsChange,
  };
};

const getPathsUpdater =
  <UiModel extends ValidUiModel = ValidUiModel>({
    router,
    match,
    def,
    location,
  }: {
    router: Router;
    match: DataRouteMatch;
    def: TabDefinition<UiModel>;
    location: Location;
  }) =>
  (prevPaths: RouterTabPath[]) => {
    const existingPath = prevPaths.find((path: string) => {
      const matches = matchRoutes(router.routes, path) || [];

      for (let i = matches.length - 1; i > -1; i--) {
        const match_ = matches[i];

        if (
          normalizePathname(match_.pathname) ===
          normalizePathname(match.pathname)
        ) {
          return true;
        }
      }
      return false;
    });

    if (existingPath) {
      // update the tab path
      const index = prevPaths.indexOf(existingPath);
      const { pathname, search, hash } = location;

      const path = normalizePathname(pathname) + search + hash;
      return replaceAt(prevPaths, index, path);
    } else {
      const { pathname, search, hash } = location;

      const path = normalizePathname(pathname) + search + hash;
      return insertAt(prevPaths, def.insertAt(prevPaths), path);
    }
  };

const convertPathToUiModel = <UiModel extends ValidUiModel = ValidUiModel>({
  router,
  path,
  config,
}: {
  router: Router;
  path: string;
  config: TabDefinition<UiModel>[];
}): UiModel | undefined => {
  const matches = matchRoutes(router.routes, path) || [];

  for (let i = matches.length - 1; i > -1; i--) {
    const match = matches[i];
    for (let i = 0; i < config.length; i++) {
      const def = config[i];
      if (def.shouldOpen(match)) {
        const id = normalizePathname(match.pathname);
        return def.mapToUiModel(id, match, path);
      }
    }
  }

  return undefined;
};

const convertPathsToIdMap = <UiModel extends ValidUiModel = ValidUiModel>({
  paths,
  config,
  router,
}: {
  config: TabDefinition<UiModel>[];
  router: Router;
  paths: RouterTabPath[];
}) => {
  return paths.reduce(
    (acc, path: RouterTabPath) => {
      const matches = matchRoutes(router.routes, path) || [];

      for (let i = matches.length - 1; i > -1; i--) {
        const match = matches[i];

        if (config.find((def) => def.shouldOpen(match))) {
          return {
            ...acc,
            [normalizePathname(match.pathname)]: path,
          };
        }
      }

      return acc;
    },
    {} as Record<string, RouterTabPath>,
  );
};

const normalizePathname = (pathname: string) =>
  pathname.endsWith("/") ? pathname : pathname + "/";
