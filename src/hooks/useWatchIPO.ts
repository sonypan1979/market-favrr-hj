import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Bixee } from "../../generated/graphql";

export const useWatchIPO = (props: { bixee?: Bixee }) => {
  const [_, rerender] = useState({});
  const isIPO = dayjs(props.bixee?.IPOEndDate).isAfter(dayjs());

  useEffect(() => {
    const remainingTime = dayjs(props.bixee?.IPOEndDate).diff(
      dayjs(),
      "millisecond"
    );
    const isStillIPO = remainingTime > 0;
    if (isStillIPO != isIPO) {
      rerender({});
    }
    if (isStillIPO) {
      const timeout = setTimeout(() => {
        rerender({});
      }, Math.min(remainingTime, 99999));
      //This min is to avoid an overflow

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [props.bixee?.IPOEndDate, isIPO]);

  return isIPO;
};
