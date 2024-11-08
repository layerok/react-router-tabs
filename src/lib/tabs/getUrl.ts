import { Location } from "react-router-dom";
import { normalizePathname } from "src/lib/tabs/normalizePathname.ts";

export const getUrl = (location: Location) => {
  const { pathname, search } = location;

  return normalizePathname(pathname) + search;
};
