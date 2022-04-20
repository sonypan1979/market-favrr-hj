import React, { useEffect, useRef, useState } from "react";
import "./tickersBar.scss";
import {
  Bixee,
  BixeeImageVar,
  SortingField,
  useFavsQuery,
} from "../../../generated/graphql";
import FavThumb from "../fav/FavThumb";
import Big from "big.js";
import { Link } from "react-router-dom";
import { favPath } from "../../routes/pathBuilder";
import Marquee from "react-fast-marquee";

const TickerItem = (props: { fav: Bixee }) => {
  const { fav } = props;
  const pps = new Big(fav.pps || 0);
  const delta = new Big(fav.deltaPercent || 0);
  const signLabel = delta.gt(0)
    ? "positive"
    : delta.lt(0)
    ? "negative"
    : "neutral";
  return (
    <div className="ticker-item">
      <Link to={favPath(fav.title as string)}>
        <FavThumb images={fav.icons as Array<BixeeImageVar>} size={32} />
      </Link>
      <Link to={favPath(fav.title as string)} className="coin-label">
        {fav.coin}
      </Link>
      <Link
        to={favPath(fav.title as string)}
        className={`price-label ${signLabel}`}
      >
        <span>{pps.round(8).toFixed()} ETH</span>
      </Link>
      <Link to={favPath(fav.title as string)} className={`delta ${signLabel}`}>
        <span>{`${delta.gt(0) ? "+" : ""}${delta.round(2).toFixed()}%`}</span>
      </Link>
    </div>
  );
};

const TickersBar = () => {
  const { data } = useFavsQuery({
    pollInterval: 20000,
    variables: {
      sort: { field: SortingField.Event, order: "DESC" },
      pagination: { perPage: 12 },
      filter: {
        isIPO: false,
      },
    },
  });
  console.log("fav data is : ", data);
  const lastFavUpdates = data?.favs?.results;

  // const [displayElements, setDisplayElements] = useState<Array<Bixee>>([]);

  const displayElements = lastFavUpdates || [];

  // if (displayElements.length == 0 && lastFavUpdates?.length) {
  //   setDisplayElements(lastFavUpdates as Array<Bixee>);
  // }

  if (!displayElements.length) {
    return null;
  }

  return (
    <Marquee className="tickers-bar" gradient={false} pauseOnHover speed={28}>
      {displayElements.map((fav, i) => (
        <React.Fragment key={fav?.key}>
          <TickerItem fav={fav as Bixee} />
          <div className="vertical-separator" />
        </React.Fragment>
      ))}
    </Marquee>
  );
};

export default TickersBar;
