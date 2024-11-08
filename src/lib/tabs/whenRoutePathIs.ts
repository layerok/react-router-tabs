import { DataRouteMatch } from "react-router-dom";

export const whenRoutePathIs = (path: string) => (match: DataRouteMatch) =>
  match.route.path === path;
