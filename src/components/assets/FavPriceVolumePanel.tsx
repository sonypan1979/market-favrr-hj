import { useQuery } from "@apollo/client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bixee,
  BixeeImageVar,
  DateFilter,
  FavQueryQuery,
  FavQueryQueryVariables,
  FavStatistics,
  FavStatisticsData,
  FavVolumeChartQuery,
  FavVolumeChartQueryVariables,
  HistoryDisplayType,
  HistoryType,
  StatisticsScale,
} from "../../../generated/graphql";
import FAV_QUERY from "../../graphql/query/fav_query";
import FAV_VOLUME_CHART_QUERY from "../../graphql/query/fav_volume_chart";
import "./LineChartType";
import dayjs from "dayjs";
import ExclusivePicker from "../input/ExclusivePicker";
import { FormattedMessage, useIntl } from "react-intl";
import "./favPriceVolumePanel.scss";
import ipoSrc from "../../assets/images/ipo.svg";
import Loader from "../loader/Loader";
import ResponsiveImage from "../image/ResponsiveImage";
import profilePlaceholderSrc from "../../assets/images/person-placeholder.svg";
import { useWatchIPO } from "../../hooks/useWatchIPO";
import Big from "big.js";
import { useEthereum } from "../../context/EthereumContext";
import USDLabel from "../currency/USDLabel";
import VolumeChart, { TimeRange } from "../chart/VolumeChart";
import PriceChart from "../chart/PriceChart";
import NumberAnimatedLabel from "../label/NumberAnimatedLabel";
import useWatchVisible from "../../hooks/useWatchVisible";
import { create } from "yup/lib/Reference";

enum ChartMode {
  PRICE,
  VOLUME,
}

const FavPriceVolumePanel = (props: { favTitle: string }) => {
  const [currentTimeScale, setCurrentTimeScale] = useState<TimeRange>(
    TimeRange.ALL
  );

  const { data: favData } = useQuery<FavQueryQuery, FavQueryQueryVariables>(
    FAV_QUERY,
    { fetchPolicy: "no-cache", variables: { title: props.favTitle } }
  );
  const isIPO = useWatchIPO({ bixee: favData?.fav as Bixee });

  const [currentMode, setCurrentMode] = useState<ChartMode>(
    isIPO ? ChartMode.VOLUME : ChartMode.PRICE
  );

  useEffect(() => {
    if (isIPO) {
      setCurrentMode(ChartMode.VOLUME);
    }
  }, [favData?.fav]);

  const creationDate = dayjs(favData?.fav?.added as string);
  const now = dayjs();

  const effectiveTimeScale = useMemo(() => {
    let currentTimeScaleEffective = currentTimeScale; // Convert ALL time to a specific range when fav created recently
    if (currentTimeScale == TimeRange.ALL) {
      if (now.diff(creationDate, "week") < 1) {
        currentTimeScaleEffective = TimeRange.DAY;
      } else if (now.diff(creationDate, "month") < 1) {
        currentTimeScaleEffective = TimeRange.WEEK;
      } else if (now.diff(creationDate, "month") < 3) {
        currentTimeScaleEffective = TimeRange.MONTH;
      } else if (now.diff(creationDate, "month") < 6) {
        currentTimeScaleEffective = TimeRange.TRIMESTER;
      }
    }
    return currentTimeScaleEffective;
  }, [currentTimeScale, favData?.fav?.added]);

  const timeStep = useMemo(() => {
    if (effectiveTimeScale == TimeRange.DAY) {
      return TimeRange.HOUR;
    }
    if (effectiveTimeScale == TimeRange.WEEK) {
      return TimeRange.DAY;
    }
    if (effectiveTimeScale == TimeRange.MONTH) {
      return currentMode == ChartMode.PRICE ? TimeRange.DAY : TimeRange.WEEK;
    }
    if (effectiveTimeScale == TimeRange.TRIMESTER) {
      return currentMode == ChartMode.PRICE ? TimeRange.DAY : TimeRange.WEEK;
    }
    if (effectiveTimeScale == TimeRange.SEMESTER) {
      return currentMode == ChartMode.PRICE ? TimeRange.DAY : TimeRange.MONTH;
    }
    if (effectiveTimeScale == TimeRange.ALL) {
      return currentMode == ChartMode.PRICE ? TimeRange.DAY : TimeRange.MONTH;
    } else {
      return currentMode == ChartMode.PRICE ? TimeRange.DAY : TimeRange.MONTH;
    }
  }, [effectiveTimeScale, currentMode]);
  const chartTimeVariables = useMemo(() => {
    const chartQueryVariables: DateFilter = {};
    chartQueryVariables.scale =
      timeStep == TimeRange.HOUR
        ? StatisticsScale.Hour
        : timeStep == TimeRange.DAY
        ? StatisticsScale.Day
        : timeStep == TimeRange.WEEK
        ? StatisticsScale.Week
        : StatisticsScale.Month;
    if (effectiveTimeScale == TimeRange.DAY) {
      chartQueryVariables.start = dayjs()
        .subtract(24, "hour")
        .startOf("hour")
        .format();
    }
    if (effectiveTimeScale == TimeRange.WEEK) {
      chartQueryVariables.start = dayjs().subtract(6, "day").format();
    }
    if (effectiveTimeScale == TimeRange.MONTH) {
      chartQueryVariables.start = dayjs()
        .subtract(1, "month")
        .add(1, "day")
        .format();
    }
    if (effectiveTimeScale == TimeRange.TRIMESTER) {
      chartQueryVariables.start = dayjs()
        .subtract(3, "month")
        .add(1, "week")
        .format();
    }
    if (effectiveTimeScale == TimeRange.SEMESTER) {
      chartQueryVariables.start = dayjs().subtract(5, "month").format();
    }
    if (effectiveTimeScale == TimeRange.ALL) {
      chartQueryVariables.alltime = true;
    } else {
      chartQueryVariables.end = dayjs().format();
    }

    return chartQueryVariables;
  }, [effectiveTimeScale, currentMode, timeStep]);

  const { data, loading: loadingChart } = useQuery<
    FavVolumeChartQuery,
    FavVolumeChartQueryVariables
  >(FAV_VOLUME_CHART_QUERY, {
    skip: currentMode == ChartMode.PRICE && isIPO,
    fetchPolicy: "no-cache",
    variables: {
      titles: [props.favTitle],
      type:
        currentMode == ChartMode.PRICE ? HistoryType.Price : HistoryType.Volume,
      dateFilter: chartTimeVariables,
      displayType:
        currentMode == ChartMode.PRICE
          ? HistoryDisplayType.Chart
          : HistoryDisplayType.Bar,
    },
  });

  const panelRef = useRef<HTMLDivElement>(null);

  const { ethQuotation } = useEthereum();
  const sharesTotal = new Big(favData?.fav?.sharesTotal || 0);
  const sharesLeft = new Big(favData?.fav?.sharesLeft || 0);
  const boughtShares = sharesTotal.minus(sharesLeft);

  const delta = new Big(favData?.fav?.delta || 0);
  const deltaPercent = new Big(favData?.fav?.deltaPercent || 0);
  const volumeDeltaPercentage = new Big(
    favData?.fav?.volumeDeltaPercentage || 0
  );

  const pps = new Big(favData?.fav?.pps || 0);
  const intl = useIntl();

  const shouldAnimateNumber = useRef(true);

  // useEffect(() => {
  //   if (favData && shouldAnimateNumber.current == false) {
  //     shouldAnimateNumber.current = true;
  //   }
  //   //  else {
  //   //   shouldAnimateNumber.current = false;
  //   // }
  // }, [favData, currentMode]);

  const [isChartVisible, setIsVisible] = useState(false);
  useWatchVisible({
    elementRef: panelRef,
    visibleOffset: 250,
    onVisibilityChange: (visibility) => setIsVisible(visibility),
  });
  return (
    <div className="fav-price-volume-panel" ref={panelRef}>
      <div className="coin-summary">
        <div className="coin-icon-container">
          <ResponsiveImage
            className="coin-icon"
            images={favData?.fav?.icons as Array<BixeeImageVar>}
            defaultImg={profilePlaceholderSrc}
          />
        </div>
        <div>
          <div className="fav-coin-name">
            <span>{favData?.fav?.displayName}</span>
            <span className="coin-symbol">{favData?.fav?.coin}</span>
          </div>
          {currentMode == ChartMode.VOLUME ? (
            <div className="bought-shares">
              <FormattedMessage
                defaultMessage="<White>{shares}</White> {isIPO, select, true {IPO} other {}} {shares, select, 1 {Share} other {Shares}} Sold"
                values={{
                  shares: boughtShares.round(8).toFixed(),
                  White: (content: JSX.Element) => (
                    <span className="almost-white">{content}</span>
                  ),
                  isIPO,
                }}
              />
            </div>
          ) : (
            <div className="price-change">
              <NumberAnimatedLabel
                shouldAnimate={shouldAnimateNumber.current}
                className="almost-white"
                finalLabel={pps.round(8).toFixed() + " ETH"}
              />{" "}
              <NumberAnimatedLabel
                shouldAnimate={shouldAnimateNumber.current}
                finalLabel={intl.formatNumber(
                  Number(pps.times(ethQuotation).toFixed()),
                  {
                    currency: "USD",
                    style: "currency",
                  }
                )}
              />
            </div>
          )}
          <div>
            {(() => {
              const value =
                currentMode == ChartMode.PRICE
                  ? deltaPercent
                  : volumeDeltaPercentage;
              return (
                <NumberAnimatedLabel
                  shouldAnimate={shouldAnimateNumber.current}
                  className={`delta ${
                    value.gt(0)
                      ? "positive"
                      : value.lt(0)
                      ? "negative"
                      : "neutral"
                  }`}
                  finalLabel={
                    (value.gt(0) ? "+" : "") + value.round(2).toFixed() + "%"
                  }
                />
              );
            })()}
            <span className="delta-timeframe">
              <FormattedMessage defaultMessage="24h" />
            </span>
          </div>
        </div>
      </div>
      <div className="chart-wrapper">
        {currentMode == ChartMode.PRICE && isIPO ? (
          <div className="still-ipo">
            <img src={ipoSrc} />
            <div>
              <FormattedMessage
                defaultMessage="No price trends yet while {coin} is in IPO."
                values={{ coin: favData?.fav?.coin }}
              />
            </div>
          </div>
        ) : loadingChart ? (
          <Loader />
        ) : currentMode == ChartMode.VOLUME ? (
          <VolumeChart
            data={data!.historyGraph![0]!.data as Array<FavStatistics>}
            timeScale={timeStep}
            timeRange={effectiveTimeScale}
          />
        ) : (
          <PriceChart
            data={data!.historyGraph![0]!.data as Array<FavStatistics>}
            timeScale={timeStep}
          />
        )}
      </div>

      <ExclusivePicker
        className="mode-picker"
        value={currentMode}
        onChange={(newValue) => {
          shouldAnimateNumber.current = false;
          setCurrentMode(newValue);
        }}
        options={[
          {
            label: <FormattedMessage defaultMessage="Price" />,
            value: ChartMode.PRICE,
          },
          {
            label: <FormattedMessage defaultMessage="Volume" />,
            value: ChartMode.VOLUME,
          },
        ]}
      />
      <ExclusivePicker
        disabled={currentMode == ChartMode.PRICE && isIPO}
        value={currentTimeScale}
        onChange={(newValue) => setCurrentTimeScale(newValue)}
        options={[
          { label: "1D", value: TimeRange.DAY },
          {
            label: "1W",
            value: TimeRange.WEEK,
            disabled: creationDate.diff(dayjs(), "week") == 0,
          },
          {
            label: "1M",
            value: TimeRange.MONTH,
            disabled: creationDate.diff(dayjs(), "month") == 0,
          },
          {
            label: "3M",
            value: TimeRange.TRIMESTER,
            disabled: Math.abs(creationDate.diff(dayjs(), "month")) < 3,
          },
          {
            label: "6M",
            value: TimeRange.SEMESTER,
            disabled: Math.abs(creationDate.diff(dayjs(), "month")) < 6,
          },
          {
            label: "All",
            value: TimeRange.ALL,
          },
        ]}
      />
    </div>
  );
};

export default FavPriceVolumePanel;
