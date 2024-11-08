import { DataRouteMatch } from "react-router-dom";
import { RouterTabModel } from "src/lib/tabs/useRouterTabs.tsx";

export type TabHandle = {
  key: any;
  title: (match: DataRouteMatch) => string;
  insertAt?: (models: RouterTabModel[]) => number;
};

export type Handle = {
  tabs: TabHandle[];
};
