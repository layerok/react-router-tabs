import { RouteObject } from "react-router-dom";
type FlatRouteObject = RouteObject & { parentRoute: RouteObject | undefined };

export const flattenRoutes = (
  routes: RouteObject[],
  parentRoute: RouteObject | undefined = undefined,
): FlatRouteObject[] => {
  return routes.reduce((acc, route) => {
    return [
      ...acc,
      {
        ...route,
        parentRoute,
      },
      ...flattenRoutes(route.children || [], route),
    ];
  }, [] as FlatRouteObject[]);
};
