import { ReactNode } from "react";

export type TabModel = {
  id: string;
  title: string;
  content: ReactNode;
  isClosable?: boolean;
};
