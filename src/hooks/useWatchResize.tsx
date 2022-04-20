import { useEffect, useState } from "react";
import debouncer from "../util/debouncer";

export const useWatchResize = (options?: { debouncer?: number }) => {
  const [_, setEmptyState] = useState({});
  const refresh = debouncer(() => setEmptyState({}), options?.debouncer || 0);

  useEffect(() => {
    const resizeListener = () => {
      refresh();
    };

    window.addEventListener("resize", resizeListener);
    return () => window.removeEventListener("resize", resizeListener);
  });

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};
