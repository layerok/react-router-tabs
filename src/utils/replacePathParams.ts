export const replacePathParams = (
  path: string,
  params: Record<string, unknown>,
) => {
  return Object.keys(params).reduce(
    (acc, key) => acc.replace(":" + key, params[key] + ""),
    path,
  );
};
