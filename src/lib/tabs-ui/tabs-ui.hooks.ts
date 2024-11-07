import { useContext } from "react";
import {
  TabContext,
  TabContextValue,
  TabsApiRefContext,
} from "./tabs-ui.components.tsx";

export const useTabContext = () => {
  return useContext<TabContextValue>(TabContext);
};

export const useTabsApiRefContext = () => {
  return useContext(TabsApiRefContext);
};
