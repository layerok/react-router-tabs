import { Params } from "react-router-dom";

export type TabHandle = {
  key: string;
  title: (props: { params: Params }) => string;
};

export type Handle = {
  tabs: TabHandle[];
};
