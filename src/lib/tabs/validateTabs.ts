import { matchRoutes } from "react-router-dom";
import { RouterTabModel } from "src/lib/tabs/useRouterTabs.tsx";
import { Router } from "@remix-run/router";

export const validateTabs = (tabs: RouterTabModel[], router: Router) => {
  return (
    tabs
      // filter out tabs that have wrong paths
      .filter((tab) => {
        // Tab could have a wrong path because we changed its corresponding route paths in the config
        // For examples we changed /warehouse/product to /warehouse-management/product
        const url = new URL(tab, window.location.origin);
        const matches = matchRoutes(router.routes, url) || [];
        return matches.find(
          (match) =>
            match.route.path !== "*" && match.pathname === url.pathname,
        );
      })
      .filter((tab, index, tabs) => {
        // filter out duplicative tab ids
        const tabIds = tabs.map((tab) => tab);
        return tabIds.indexOf(tab) === index;
      })
  );
};
