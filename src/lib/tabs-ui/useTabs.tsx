import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { TabModel } from "src/lib/tabs-ui/tabs-ui.types.ts";
import { removeItem } from "src/utils/array-utils.ts";

type StateListener = (state: State, partialState: Partial<State>) => void;

type Disposer = () => void;

export type TabsApi = {
  listeners: Set<StateListener>;
  subscribe: (cb: StateListener) => Disposer;
  setTabs: (tabs: TabModel[], emitEvents?: boolean) => void;
  setActiveTabId: (id: string | undefined, emitEvents?: boolean) => void;
  getState: () => State;
  getActiveTab: () => TabModel | undefined;
  setState: (
    state: Partial<State> | { (prevState: State): Partial<State> },
    emitEvents?: boolean,
  ) => void;
  forceUpdate: () => void;
  closeTab: (tab: TabModel) => void;
  registerChildTabsApi: (childTabsApi: TabsApi) => void;
  unregisterChildTabsApi: () => void;
  registerParentTabsApi: (parentTabsApi: TabsApi) => void;
  unregisterParentTabsApi: () => void;
  setStartPinnedTabs: (ids: string[], emitEvents: boolean) => void;
  setEndPinnedTabs: (ids: string[], emitEvents: boolean) => void;
};

export type TabsProps = {
  hasControlledActiveTabId?: boolean;
  activeTabId?: string;
  initialActiveTabId?: string;
  startPinnedTabs?: string[];
  endPinnedTabs?: string[];
  tabs?: TabModel[];
  initialTabs?: TabModel[];
  initialStartPinnedTabs?: string[];
  initialEndPinnedTabs?: string[];
  onActiveTabIdChange?: (id: string | undefined) => void;
  onStartPinnedTabsChange?: (ids: string[]) => void;
  onEndPinnedTabsChange?: (ids: string[]) => void;
  onTabsChange?: (tabs: TabModel[]) => void;
  apiRef?: React.Ref<TabsApi | undefined>;
};

export type State = {
  tabs: TabModel[];
  activeTabId: string | undefined;
  startPinnedTabs: string[];
  endPinnedTabs: string[];
  childTabsApi: TabsApi | undefined;
  parentTabsApi: TabsApi | undefined;
};

export type ControlledStateCallbacks = {
  tabs?: (tabs: TabModel[]) => void;
  activeTabId?: (id: string | undefined) => void;
  startPinnedTabs?: (ids: string[]) => void;
  endPinnedTabs?: (ids: string[]) => void;
  childTabsApi?: (childTabsApi: TabsApi | undefined) => void;
  parentTabsApi?: (parentTabsApi: TabsApi | undefined) => void;
};

const useForceRerender = () => {
  const [, setIncrement] = useState(0);
  return useCallback(() => {
    setIncrement((prev) => prev + 1);
  }, []);
};

const useClosing = (apiRef: MutableRefObject<TabsApi>) => {
  apiRef.current["closeTab"] = (tab: TabModel) => {
    const {
      tabs,
      activeTabId: prevActiveId,
      startPinnedTabs,
    } = apiRef.current.getState();

    const prevActiveTab = tabs.find((tab) => tab.id === prevActiveId);
    const activeTab =
      prevActiveId === tab.id ? closestItem(tabs, tab) : prevActiveTab;

    const updatedTabs = removeItem(tabs, tab);

    apiRef.current.setState({
      tabs: updatedTabs,
      activeTabId: activeTab?.id,
      startPinnedTabs: startPinnedTabs.filter((id) => id !== tab.id),
    });

    apiRef.current.forceUpdate();
  };
};

const useActive = (apiRef: MutableRefObject<TabsApi>, props: TabsProps) => {
  const { hasControlledActiveTabId, activeTabId } = props;
  apiRef.current["setActiveTabId"] = (
    id: string | undefined,
    emitEvents = true,
  ) => {
    apiRef.current.setState(
      {
        activeTabId: id,
      },
      emitEvents,
    );
    apiRef.current.forceUpdate();
  };
  apiRef.current["getActiveTab"] = () => {
    const { tabs, activeTabId } = apiRef.current.getState();
    return tabs.find((tab) => tab.id === activeTabId);
  };
  const state = apiRef.current.getState();
  if (hasControlledActiveTabId && state.activeTabId !== activeTabId) {
    apiRef.current.setActiveTabId(activeTabId, false);
  }
};

const useTabsState = (apiRef: MutableRefObject<TabsApi>, props: TabsProps) => {
  const {
    initialTabs = [],
    initialActiveTabId,
    initialStartPinnedTabs = [],
    initialEndPinnedTabs = [],
  } = props;

  const stateRef = useRef<State>({
    tabs: initialTabs,
    activeTabId: initialActiveTabId,
    startPinnedTabs: initialStartPinnedTabs,
    endPinnedTabs: initialEndPinnedTabs,
    childTabsApi: undefined,
    parentTabsApi: undefined,
  });

  apiRef.current["getState"] = () => {
    return stateRef.current;
  };

  apiRef.current["setState"] = (
    stateOrFn: Partial<State> | { (state: State): Partial<State> },
    emitEvents = true,
  ) => {
    const newState =
      typeof stateOrFn === "function" ? stateOrFn(stateRef.current) : stateOrFn;

    const mergedNewState = {
      ...stateRef.current,
      ...newState,
    };

    if (emitEvents) {
      [...apiRef.current.listeners].forEach((listener) => {
        listener(mergedNewState, newState);
      });
    }

    stateRef.current = mergedNewState;
  };
};

const usePinning = (apiRef: MutableRefObject<TabsApi>, props: TabsProps) => {
  const {
    startPinnedTabs: startPinnedTabsProp,
    endPinnedTabs: endPinnedTabsProp,
  } = props;
  const setStartPinnedTabs = useCallback(
    (ids: string[], emitEvents = true) => {
      apiRef.current.setState(
        {
          startPinnedTabs: ids,
        },
        emitEvents,
      );
      apiRef.current.forceUpdate();
    },
    [apiRef],
  );

  const setEndPinnedTabs = useCallback(
    (ids: string[], emitEvents = true) => {
      apiRef.current.setState(
        {
          endPinnedTabs: ids,
        },
        emitEvents,
      );
      apiRef.current.forceUpdate();
    },
    [apiRef],
  );
  apiRef.current["setStartPinnedTabs"] = setStartPinnedTabs;
  apiRef.current["setEndPinnedTabs"] = setEndPinnedTabs;
  const state = apiRef.current.getState();

  if (
    startPinnedTabsProp &&
    state.startPinnedTabs.join("") != startPinnedTabsProp.join("")
  ) {
    apiRef.current.setStartPinnedTabs(startPinnedTabsProp, false);
  }
  if (
    endPinnedTabsProp &&
    state.endPinnedTabs.join("") != endPinnedTabsProp.join("")
  ) {
    apiRef.current.setEndPinnedTabs(endPinnedTabsProp, false);
  }
};

const useChildTabsApi = (apiRef: MutableRefObject<TabsApi>) => {
  apiRef.current["registerChildTabsApi"] = (childTabsApi: TabsApi) => {
    apiRef.current.setState(
      {
        childTabsApi,
      },
      false,
    );
  };

  apiRef.current["unregisterChildTabsApi"] = () => {
    apiRef.current.setState(
      {
        childTabsApi: undefined,
      },
      false,
    );
  };

  apiRef.current["registerParentTabsApi"] = (parentTabsApi: TabsApi) => {
    apiRef.current.setState(
      {
        parentTabsApi,
      },
      false,
    );
  };

  apiRef.current["unregisterParentTabsApi"] = () => {
    apiRef.current.setState(
      {
        parentTabsApi: undefined,
      },
      false,
    );
  };
};

const useTabModels = (apiRef: MutableRefObject<TabsApi>, props: TabsProps) => {
  const { tabs: tabsFromProps } = props;

  apiRef.current["setTabs"] = (tabs: TabModel[], emitEvents = true) => {
    apiRef.current.setState(
      {
        tabs,
      },
      emitEvents,
    );
    apiRef.current.forceUpdate();
  };

  const { tabs: prevTabs } = apiRef.current.getState();

  const hashTabs = (tabs: TabModel[]) => {
    return tabs.map((tab) => tab.id).join("");
  };

  if (tabsFromProps && hashTabs(prevTabs) != hashTabs(tabsFromProps)) {
    apiRef.current.setTabs(tabsFromProps, false);
  }
};

export const useTabs = (
  apiRef: MutableRefObject<TabsApi>,
  props: TabsProps,
) => {
  const {
    onTabsChange,
    onActiveTabIdChange,
    onStartPinnedTabsChange,
    onEndPinnedTabsChange,
  } = props;
  apiRef.current["forceUpdate"] = useForceRerender();

  if (!apiRef.current.listeners) {
    apiRef.current.listeners = new Set<StateListener>();
  }

  apiRef.current["subscribe"] = (cb: StateListener) => {
    apiRef.current.listeners.add(cb);
    return () => {
      apiRef.current.listeners.delete(cb);
    };
  };

  useEffect(() => {
    const handlersMap = {
      tabs: onTabsChange,
      activeTabId: onActiveTabIdChange,
      startPinnedTabs: onStartPinnedTabsChange,
      endPinnedTabs: onEndPinnedTabsChange,
    };
    return apiRef.current.subscribe((_, partialState) => {
      Object.keys(partialState).forEach((subStateKey) => {
        const subState = partialState[subStateKey as keyof State];
        // @ts-ignore
        const subStateChangeHandler = handlersMap[subStateKey];
        // @ts-ignore
        subStateChangeHandler?.(subState);
      });
    });
  }, [
    apiRef,
    onTabsChange,
    onActiveTabIdChange,
    onStartPinnedTabsChange,
    onEndPinnedTabsChange,
  ]);

  useTabsState(apiRef, props);
  useTabModels(apiRef, props);

  useClosing(apiRef);
  usePinning(apiRef, props);
  useActive(apiRef, props);
  useChildTabsApi(apiRef);
};

function closestItem<T>(arr: T[], item: T): T | undefined {
  const index = arr.indexOf(item);
  if (index === -1) {
    return arr[0];
  } else if (index === arr.length - 1) {
    return arr[arr.length - 2];
  } else {
    return arr[index + 1];
  }
}
