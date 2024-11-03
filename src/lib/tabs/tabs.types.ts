import { ReactNode } from "react";

export type ValidTabMeta = Record<string, unknown>;

export type TabModel<Meta extends ValidTabMeta = ValidTabMeta> = {
  id: string;
  title: string;
  content: ReactNode;
  isClosable?: boolean;
  meta: Meta;
};

export type TabbedNavigationMeta = {
  path: string;
  routeId: string;
};
