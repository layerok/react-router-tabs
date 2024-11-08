export const normalizePathname = (pathname: string) =>
  pathname.endsWith("/") ? pathname : pathname + "/";
