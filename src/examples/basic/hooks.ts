import { UIMatch, useMatches } from "react-router-dom";
import { Handle } from "src/examples/basic/types.ts";
import { getTabHandleUI } from "src/examples/basic/utils.ts";

export const useActiveTabId = (key: string) => {
  const matches = useMatches() as UIMatch<any, Handle>[];
  const storeMatches = matches.filter(getTabHandleUI(key));

  return storeMatches[storeMatches.length - 1]?.pathname;
};
