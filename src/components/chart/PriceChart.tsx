import { Chart, ChartOptions } from "chart.js";
import { easingEffects } from "chart.js/helpers";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FavStatistics } from "../../../generated/graphql";
import useWatchVisible from "../../hooks/useWatchVisible";
import { formatEthPrice } from "../../util/stringUtils";
import { DataPointRaw } from "../assets/EquityChart";
import { TimeRange } from "./VolumeChart";

interface Props {
  data: Array<FavStatistics>;
  timeScale: TimeRange;
  onHoverPoint?: (point: DataPointRaw | null) => void;
}
const PriceChart = (props: Props) => {
  const { data, timeScale, onHoverPoint } = props;
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const hoveringCanvasRef = useRef(false);
  //   const [canvasRect, setCanvasRect] = useState<null | {
  //     width: number;
  //     height: number;
  //   }>(null);

  //   useEffect(() => {
  //     if (containerRef.current) {
  //       setCanvasRect({
  //         width: containerRef.current.clientWidth,
  //         height: containerRef.current.clientHeight,
  //       });
  //     }
  //   }, [window.innerWidth]);
  const [isVisible, setIsVisible] = useState(false);

  useWatchVisible({
    elementRef: canvasRef,
    visibleOffset: 250,
    onVisibilityChange: (visibility) => setIsVisible(visibility),
  });

  const chartData = useMemo(() => {
    const dataPoints = data.map((favStatistics) => ({
      x: dayjs(favStatistics?.date).valueOf(),
      y:
        favStatistics?.price != null && favStatistics?.price != undefined
          ? (favStatistics.price as number)
          : (favStatistics.equity as number),
    }));

    dataPoints.sort((A, B) => (A.x > B.x ? 1 : -1));
    return {
      datasets: [
        {
          borderColor: "#7FBA7A",
          data: dataPoints,
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  }, [data]);

  const options = useMemo(() => {
    const restart = false;
    const totalDuration = 1200;
    const delayBetweenPoints = totalDuration / data.length;

    // const delay = (ctx: any) => easing(ctx.index / data.length) * totalDuration;
    const previousY = (ctx: any) =>
      ctx.index === 0
        ? ctx.chart.scales.yAxis.getPixelForValue(100)
        : ctx.chart
            .getDatasetMeta(ctx.datasetIndex)
            .data[ctx.index - 1].getProps(["y"], true).y;
    const animation = {
      x: {
        type: "number",
        easing: "linear",
        duration: delayBetweenPoints,
        from: NaN, // the point is initially skipped
        delay: (ctx: any) => {
          if (ctx.type !== "data" || ctx.xStarted) {
            return 0;
          }
          ctx.xStarted = true;
          return ctx.index * delayBetweenPoints;
        },
      },
      y: {
        type: "number",
        easing: "linear",
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx: any) {
          if (ctx.type !== "data" || ctx.yStarted) {
            return 0;
          }
          ctx.yStarted = true;
          return ctx.index * delayBetweenPoints;
        },
      },
    };
    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      // animation: false,
      scales: {
        xAxis: {
          type: "time",
          display: false,
          grid: {
            display: false,
          },
          ticks: {
            callback: (tick, index, ticks) => {
              return tick;
            },
          },
        },
        yAxis: {
          min: 0,
          // max: 100,
          ticks: {
            autoSkip: true,
            maxTicksLimit: 4,
          },
          grid: {
            borderDash: [8, 8],
            borderWidth: 0,
            // borderWidth: 10000,
            color: "#353945",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
          intersect: false,
          enabled: false,
          external: function (context) {
            // Tooltip Element
            let tooltipEl = document.getElementById("chartjs-tooltip");

            const tooltipModel = context.tooltip;
            const value = (tooltipModel.dataPoints[0].raw as any).y as number;
            const date = dayjs((tooltipModel.dataPoints[0].raw as any).x);

            const dataPointRaw = this.dataPoints[0].raw as {
              x: number;
              y: number;
              ethDelta: number;
              percentageDelta: number;
            };

            if (onHoverPoint && hoveringCanvasRef.current) {
              onHoverPoint({
                ethDelta: dataPointRaw.ethDelta,
                ethPrice: dataPointRaw.y,
                percentageDelta: dataPointRaw.percentageDelta,
                x: dataPointRaw.x,
              });
            }

            // Create element on first render
            if (!tooltipEl) {
              tooltipEl = document.createElement("div");
              tooltipEl.id = "chartjs-tooltip";
              tooltipEl.innerHTML = "<table></table>";
              tooltipEl.style.position = "absolute";
              document.body.appendChild(tooltipEl);
            }

            if (tooltipModel.opacity === 0) {
              tooltipEl.style.opacity = "0";
              return;
            } else {
              tooltipEl.style.opacity = "";
            }

            const dataLabel = `${formatEthPrice(value)} ETH`;

            tooltipEl.innerHTML = `<div class="shares">${dataLabel}</div><div class="date">${date.format(
              timeScale == TimeRange.HOUR ? "h:mma" : "MMMM Do"
            )}</div>`;

            const position = context.chart.canvas.getBoundingClientRect();
            const toolTipWidth = tooltipEl.clientWidth;
            const leftPosition = Math.min(
              position.left +
                window.pageXOffset +
                tooltipModel.caretX -
                toolTipWidth / 2,
              window.innerWidth - toolTipWidth
            );
            tooltipEl.style.left = leftPosition + "px";
            tooltipEl.style.top = position.top + window.pageYOffset + "px";
          },
        },
      },
      animation: animation as any,
    };
    return options;
  }, [timeScale]);

  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) {
      return;
    }
    if (chartRef.current?.canvas != canvas) {
      chartRef.current?.destroy();
      chartRef.current = null;
    }
    if (!chartRef.current) {
      chartRef.current = new Chart(canvas, {
        type: "LineWithCursor" as any,
        data: chartData,
        options,
      });
    } else {
      chartRef.current.data = chartData;
      chartRef.current.update();
    }
  }, [chartData, options, isVisible]);

  useEffect(() => {
    return () => chartRef.current?.destroy();
  }, []);

  useEffect(() => {
    //It is important to also trigger remove on unmount
    return () => {
      document.getElementById("chartjs-tooltip")?.remove();
    };
  }, []);

  return (
    // <div className="price-chart">
    //   {canvasRect &&
    <canvas
      ref={canvasRef}
      onMouseEnter={() => {
        hoveringCanvasRef.current = true;
      }}
      onMouseLeave={() => {
        hoveringCanvasRef.current = false;
        if (onHoverPoint) {
          onHoverPoint(null);
        }
      }}
    ></canvas>
    // }
    // </div>}
  );
};

export default PriceChart;
