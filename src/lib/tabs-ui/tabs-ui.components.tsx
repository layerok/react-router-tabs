import { createContext, MutableRefObject, PropsWithChildren } from "react";
import { TabModel } from "./tabs-ui.types.ts";
import { TabsApi } from "src/lib/tabs-ui/useTabs.tsx";

export type TabContextValue = TabModel | null;

export const TabContext = createContext<TabContextValue>(null);

export const TabProvider = (
  props: PropsWithChildren<{
    tab: TabModel;
  }>,
) => {
  const { children, tab } = props;
  return <TabContext.Provider value={tab}>{children}</TabContext.Provider>;
};

export const TabsApiRefContext =
  createContext<MutableRefObject<TabsApi> | null>(null);

export const TabsApiProvider = (
  props: PropsWithChildren<{
    apiRef: MutableRefObject<TabsApi>;
  }>,
) => {
  const { children, apiRef } = props;
  return (
    <TabsApiRefContext.Provider value={apiRef}>
      {children}
    </TabsApiRefContext.Provider>
  );
};