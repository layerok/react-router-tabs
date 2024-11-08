import { matchRoutes } from "react-router-dom";
import { RouterTabPath } from "src/lib/tabs/useRouterTabs.tsx";
import { Router } from "@remix-run/router";

export const validateTabPaths = (paths: RouterTabPath[], router: Router) => {
  return (
    paths
      // filter out tabs that have wrong paths
      .filter((path) => {
        // Tab could have a wrong path because we changed its corresponding route paths in the config
        // For examples we changed /warehouse/product to /warehouse-management/product
        const url = new URL(path, window.location.origin);
        const matches = matchRoutes(router.routes, url) || [];
        return matches.find(
          (match) =>
            match.route.path !== "*" && match.pathname === url.pathname,
        );
      })
      .filter((path, index, paths) => {
        // filter out duplicative paths
        return paths.indexOf(path) === index;
      })
  );
};
