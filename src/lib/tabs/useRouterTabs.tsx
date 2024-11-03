import { DataRouteMatch, matchRoutes, Outlet } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { RouterState, AgnosticDataRouteMatch } from "@remix-run/router";
import { last, replaceAt, insertAt } from "src/utils/array-utils.ts";
import { TabModel, ValidTabMeta } from "src/lib/tabs/tabs.types.ts";
import { pathToLocation } from "src/lib/tabs/tabs.utils.ts";
import { Router } from "@remix-run/router";

export type TabbedNavigationMeta = {
  path: string;
  routeId: string;
};

type ValidParams = Record<string, unknown>;

export type TabConfig<Params extends ValidParams = ValidParams> = {
  routeId: string;
  insertMethod: InsertMethod;
  title: ({ params }: { params: Params }) => string;
};

export enum InsertMethod {
  Append = "append",
  Prepend = "prepend",
}

type TabsChangeCallback<Meta extends ValidTabMeta = ValidTabMeta> = (
  tabs:
    | TabModel<TabbedNavigationMeta & Meta>[]
    | {
        (
          prevTabs: TabModel<TabbedNavigationMeta & Meta>[],
        ): TabModel<TabbedNavigationMeta & Meta>[];
      },
) => void;

export const useRouterTabs = <
  Meta extends ValidTabMeta = ValidTabMeta,
  Params extends ValidParams = ValidParams,
>(options: {
  router: Router;
  config: TabConfig<Params>[];
  onTabsChange?: TabsChangeCallback<Meta>;
  tabs: TabModel<TabbedNavigationMeta & Meta>[];
  startPinnedTabs: string[];
  endPinnedTabs: string[];
  resolveTabMeta: (match: AgnosticDataRouteMatch) => Meta;
  fallbackPath: string;
}) => {
  const {
    resolveTabMeta,
    fallbackPath,
    onTabsChange,
    tabs = [],
    startPinnedTabs,
    endPinnedTabs,
    config,
    router,
  } = options;

  // todo: validate tabs

  const updateTabs = useCallback(
    (state: RouterState) => {
      const { matches, location, navigation } = state;

      if (navigation.location) {
        return;
      }

      let def: TabConfig<any> | undefined = undefined;
      let match: DataRouteMatch | undefined = undefined;

      // start from last match, the most specific one
      for (let i = matches.length - 1; i > -1; i--) {
        const currentMatch = matches[i];
        const definition = config.find(
          (tabDef) => tabDef.routeId === currentMatch.route.id,
        );
        if (definition) {
          def = definition;
          match = currentMatch;
          break;
        }
      }

      if (def && match) {
        onTabsChange?.((prevTabs) => {
          const tab = prevTabs.find((tab) => tab.id === match.pathname);

          const { pathname } = last(matches);
          const { search } = location;
          const path = pathname + (search ? `${search}` : "");

          if (tab) {
            // update the tab path
            const index = prevTabs.indexOf(tab);

            return replaceAt(prevTabs, index, {
              ...tab,
              meta: {
                ...tab.meta,
                path,
                ...resolveTabMeta(match),
              },
            });
          } else {
            const prepend = def.insertMethod === InsertMethod.Prepend;

            const newTab: TabModel<TabbedNavigationMeta & Meta> = {
              id: match.pathname,
              title: def.title(match),
              content: <Outlet />,
              meta: {
                path,
                routeId: match.route.id,
                ...resolveTabMeta(match),
              },
            };

            // prepend a new tab
            if (prepend) {
              return insertAt(prevTabs, startPinnedTabs.length, newTab);
            } else {
              return insertAt(
                prevTabs,
                prevTabs.length - endPinnedTabs.length,
                newTab,
              );
            }
          }
        });
      }
    },
    [resolveTabMeta, startPinnedTabs, config, onTabsChange, endPinnedTabs],
  );

  useEffect(() => {
    // fire immediately
    updateTabs(router.state);
    return router.subscribe(updateTabs);
  }, [router, updateTabs]);

  const setActiveTabId = (id: string | undefined) => {
    const tab = tabs.find((tab) => tab.id === id);
    if (tab) {
      router.navigate(pathToLocation(tab.meta.path));
    } else {
      router.navigate(fallbackPath);
    }
  };

  const matches = matchRoutes(router.routes, router.state.location) || [];

  const activeTabId = matches
    .slice()
    .reverse()
    .find((match) => {
      return config.find((def) => def.routeId === match.route.id);
    })?.pathname;

  return {
    setActiveTabId,
    activeTabId,
  };
};
