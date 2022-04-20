import { useQuery } from "@apollo/client";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  DateFilter,
  EquityHistoryQuery,
  EquityHistoryQueryVariables,
  FavStatistics,
  HistoryType,
  StatisticsScale,
} from "../../../generated/graphql";
import { useEthereum } from "../../context/EthereumContext";
import EQUITY_HISTORY_QUERY from "../../graphql/query/equity_history_query";
import { formatEthPrice } from "../../util/stringUtils";
import PriceChart from "../chart/PriceChart";
import USDLabel from "../currency/USDLabel";
import ExclusivePicker from "../input/ExclusivePicker";
import NumberAnimatedLabel from "../label/NumberAnimatedLabel";
import Loader from "../loader/Loader";
import "./equityChart.scss";

enum TimeRange {
  DAY,
  WEEK,
  MONTH,
  TRIMESTER,
  SEMESTER,
  ALL,
}

export interface DataPointRaw {
  x: number;
  ethPrice: number;
  ethDelta: number;
  percentageDelta: number;
}

const EquityChart = ({
  address,
  className,
}: {
  address: string;
  className: string;
}) => {
  const [currentTimeScale, setCurrentTimeScale] = useState(TimeRange.ALL);

  const [hoverPoint, setHoverPoint] = useState<DataPointRaw | null>(null);
  const hoverPointRef = useRef<DataPointRaw | null>(null);
  hoverPointRef.current = hoverPoint;

  const chartTimeVariables = useMemo(() => {
    const chartQueryVariables: DateFilter = {};
    if (currentTimeScale == TimeRange.DAY) {
      chartQueryVariables.start = dayjs().subtract(1, "day").format();
      chartQueryVariables.scale = StatisticsScale.Hour;
    }
    if (currentTimeScale == TimeRange.WEEK) {
      chartQueryVariables.start = dayjs().subtract(7, "day").format();
      chartQueryVariables.scale = StatisticsScale.Day;
    }
    if (currentTimeScale == TimeRange.MONTH) {
      chartQueryVariables.start = dayjs().subtract(1, "month").format();
      chartQueryVariables.scale = StatisticsScale.Day;
    }
    if (currentTimeScale == TimeRange.TRIMESTER) {
      chartQueryVariables.start = dayjs().subtract(3, "month").format();
      chartQueryVariables.scale = StatisticsScale.Day;
    }
    if (currentTimeScale == TimeRange.SEMESTER) {
      chartQueryVariables.start = dayjs().subtract(6, "month").format();
      chartQueryVariables.scale = StatisticsScale.Day;
    }
    if (currentTimeScale == TimeRange.ALL) {
      chartQueryVariables.alltime = true;
      chartQueryVariables.scale = StatisticsScale.Day;
    } else {
      chartQueryVariables.end = dayjs().format();
    }

    return chartQueryVariables;
  }, [currentTimeScale]);

  const { data, loading } = useQuery<
    EquityHistoryQuery,
    EquityHistoryQueryVariables
  >(EQUITY_HISTORY_QUERY, {
    fetchPolicy: "no-cache",
    variables: {
      address,
      type: HistoryType.Price,
      dateFilter: chartTimeVariables,
    },
  });

  // const chartData = useMemo(() => {
  //   const dataPoints = data?.userHistoryGraph?.data
  //     ? data.userHistoryGraph.data.map((favStatistics) => ({
  //         x: dayjs(favStatistics?.date).valueOf(),
  //         y: favStatistics?.equity as number,
  //         ethDelta: favStatistics?.equityDelta as number,
  //         percentageDelta: favStatistics?.equityDeltaPercent as number,
  //       }))
  //     : [];
  //   dataPoints.sort((A, B) => (A.x > B.x ? 1 : -1));
  //   return {
  //     datasets: [
  //       {
  //         borderColor: "#7FBA7A",
  //         data: dataPoints,
  //         fill: false,
  //         pointRadius: 0,
  //       },
  //     ],
  //   };
  // }, [data]);
  const lastDataPoint = useMemo<DataPointRaw | null>(() => {
    let lastPointPosition = 0;

    if (!data?.userHistoryGraph?.data?.length) {
      return null;
    }
    data?.userHistoryGraph?.data.forEach((point, i) => {
      const time = dayjs(point?.date as string);
      const lastTime = dayjs(
        data.userHistoryGraph!.data![lastPointPosition]!.date
      );
      if (time.isAfter(lastTime)) {
        lastPointPosition = i;
      }
    });
    const lastPoint = data.userHistoryGraph!.data![lastPointPosition]!;
    return {
      x: lastPoint.date,
      ethPrice: lastPoint.equity as number,
      ethDelta: lastPoint.equityDelta as number,
      percentageDelta: lastPoint.equityDeltaPercent as number,
    };
  }, [data]);

  const { ethQuotation } = useEthereum();

  useEffect(() => {
    setHoverPoint(lastDataPoint);
  }, [lastDataPoint]);

  const firstHoverPointRef = useRef<DataPointRaw | null>(null);
  if (hoverPoint && !firstHoverPointRef.current) {
    firstHoverPointRef.current = hoverPoint;
  }

  const shouldAnimateRef = useRef(true);

  const intl = useIntl();
  return (
    <div className={`equity-chart ${className || ""}`}>
      <>
        <div className="price-row">
          <NumberAnimatedLabel
            shouldAnimate={shouldAnimateRef.current}
            className="eth-price"
            finalLabel={`${formatEthPrice(hoverPoint?.ethPrice || 0)} ETH`}
          />

          <NumberAnimatedLabel
            shouldAnimate={shouldAnimateRef.current}
            className="usd-price"
            finalLabel={intl.formatNumber(
              Number(ethQuotation.times(hoverPoint?.ethPrice || 0).toFixed()),
              {
                currency: "USD",
                style: "currency",
              }
            )}
          />
        </div>
        <div className="delta-row">
          <NumberAnimatedLabel
            shouldAnimate={shouldAnimateRef.current}
            className="eth-delta"
            finalLabel={`+${formatEthPrice(hoverPoint?.ethDelta || 0)} ETH`}
          />
          <NumberAnimatedLabel
            shouldAnimate={shouldAnimateRef.current}
            className="percentage-delta"
            finalLabel={`+${hoverPoint?.percentageDelta || 0}%`}
          />
        </div>
      </>
      {loading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        <div className="canvas-container">
          <PriceChart
            data={data?.userHistoryGraph?.data as Array<FavStatistics>}
            timeScale={currentTimeScale}
            onHoverPoint={(newHoverPoint) => {
              shouldAnimateRef.current = false;
              if (
                newHoverPoint?.x != hoverPoint?.x ||
                newHoverPoint?.ethPrice != hoverPoint?.ethPrice ||
                newHoverPoint?.ethDelta != hoverPoint?.ethDelta
              ) {
                setHoverPoint(newHoverPoint || lastDataPoint);
              }
            }}
          />
        </div>
      )}
      <ExclusivePicker
        value={currentTimeScale}
        onChange={(newValue) => {
          shouldAnimateRef.current = false;
          setCurrentTimeScale(newValue);
        }}
        options={[
          { label: "1D", value: TimeRange.DAY },
          { label: "1W", value: TimeRange.WEEK },
          { label: "1M", value: TimeRange.MONTH },
          { label: "3M", value: TimeRange.TRIMESTER },
          { label: "6M", value: TimeRange.SEMESTER },
          { label: "All", value: TimeRange.ALL },
        ]}
      />
    </div>
  );
};

export default EquityChart;
