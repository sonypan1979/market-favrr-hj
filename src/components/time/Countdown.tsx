import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import useForceRender from "../../hooks/useForceRender";
import "./countdown.scss";

dayjs.extend(duration);

enum TimeFields {
  SECONDS = 0,
  MINUTES,
  HOURS,
  DAYS,
}

const Countdown = (props: { endDate: string }) => {
  const endDate = useMemo(() => {
    return dayjs(props.endDate);
  }, [props.endDate]);

  if (!endDate.isValid()) {
    return null;
  }

  const forceRender = useForceRender();
  const updateIntervalIdRef = useRef(
    null as null | ReturnType<typeof setInterval>
  );

  const now = dayjs();
  const duration = dayjs.duration(endDate.diff(now));
  const days = endDate.diff(now, "day");
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const hideSeconds = days > 30;

  useEffect(() => {
    updateIntervalIdRef.current = setInterval(
      forceRender,
      hideSeconds ? 55 * 1000 : 990
    );

    return () => {
      if (updateIntervalIdRef.current) {
        clearInterval(updateIntervalIdRef.current);
      }
    };
  }, [props.endDate, hideSeconds]);

  let firstElement = TimeFields.SECONDS;
  if (days) {
    firstElement = TimeFields.DAYS;
  } else if (hours) {
    firstElement = TimeFields.HOURS;
  } else if (minutes) {
    firstElement = TimeFields.MINUTES;
  }

  return (
    <div className="countdown">
      {firstElement >= TimeFields.DAYS ? (
        <span
          className="timeslot day"
          style={{
            minWidth:
              days >= 10 || firstElement != TimeFields.DAYS ? "23px" : "12px",
          }}
        >
          <FormattedMessage
            defaultMessage="{value}d"
            values={{ value: days }}
          />
        </span>
      ) : null}
      {firstElement >= TimeFields.HOURS ? (
        <span
          className="timeslot hour"
          style={{
            minWidth:
              hours >= 10 || firstElement != TimeFields.HOURS ? "20px" : "10px",
          }}
        >
          <FormattedMessage
            defaultMessage="{value}h"
            values={{
              value:
                hours < 10 && firstElement != TimeFields.HOURS
                  ? `0${hours}`
                  : hours,
            }}
          />
        </span>
      ) : null}
      {firstElement >= TimeFields.MINUTES ? (
        <span
          className="timeslot minute"
          style={{
            minWidth:
              minutes >= 10 || firstElement != TimeFields.MINUTES
                ? "28px"
                : "14px",
          }}
        >
          <FormattedMessage
            defaultMessage="{value}m"
            values={{
              value:
                minutes < 10 && firstElement != TimeFields.MINUTES
                  ? `0${minutes}`
                  : minutes,
            }}
          />
        </span>
      ) : null}
      {!hideSeconds && (
        <span
          className="timeslot second"
          style={{
            minWidth:
              minutes >= 10 || firstElement != TimeFields.MINUTES
                ? "23px"
                : "12px",
          }}
        >
          <FormattedMessage
            defaultMessage="{value}s"
            values={{
              value: seconds < 10 ? `0${seconds}` : seconds,
            }}
          />
        </span>
      )}
    </div>
  );
};

export default Countdown;
