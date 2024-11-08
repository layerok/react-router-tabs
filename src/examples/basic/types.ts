import { DataRouteMatch } from "react-router-dom";
import { RouterTabPath } from "src/lib/tabs/useRouterTabs.tsx";

export type TabHandle = {
  key: any;
  title: (match: DataRouteMatch) => string;
  insertAt?: (paths: RouterTabPath[]) => number;
};

export type Handle = {
  tabs: TabHandle[];
};
