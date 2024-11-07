import { Params } from "react-router-dom";

export type TabHandle = {
  key: any;
  title: (props: { params: Params }) => string;
};

export type Handle = {
  tabs: TabHandle[];
};
