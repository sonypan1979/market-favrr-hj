import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bixee, BixeeImageVar } from "../../../generated/graphql";
import { favPath } from "../../routes/pathBuilder";
import ResponsiveImage from "../image/ResponsiveImage";
import "./favTile.scss";
import ProgressBar from "./ProgressBar";
import missingImgSrc from "../../assets/images/img-placeholder.svg";
import Countdown from "../time/Countdown";
import { useWatchIPO } from "../../hooks/useWatchIPO";
import { formatEthPrice } from "../../util/stringUtils";
import Big from "big.js";
import { FormattedNumber } from "react-intl";
import LikeButton from "../button/LikeButton";

interface Props {
  fav: Bixee;
  className?: string;
}

const FavTile = (props: Props) => {
  const fav = props.fav;

  const pps = new Big(fav.pps || 0);
  const delta = new Big(fav.delta || 0);

  const sharesLeft = new Big(fav.sharesLeft || 0);
  const sharesTotal = new Big(fav.sharesTotal || 0);

  const isIPO = useWatchIPO({ bixee: fav });
  return (
    <div className={`fav-tile ${props.className || ""}`}>
      <Link to={favPath(fav.title as string)} className="image-container">
        <ResponsiveImage
          images={fav.images as Array<BixeeImageVar>}
          defaultImg={missingImgSrc}
        />
        <LikeButton
          isFavorite={fav.favorite as boolean}
          title={fav.title as string}
          favId={fav.key as string}
        />
        {isIPO && <Countdown endDate={fav.IPOEndDate as string} />}
      </Link>
      <div className="name-price">
        <Link to={favPath(fav.title as string)} className="tile-name">
          {fav.displayName}
        </Link>
        <span className="tile-price">{`${pps.round(8).toFixed()} ETH`}</span>
      </div>
      <hr />
      {isIPO ? (
        <ProgressBar
          sharesLeft={Number(sharesLeft.round(8).toFixed())}
          sharesTotal={Number(sharesTotal.round(8).toFixed())}
        />
      ) : (
        <div style={{ display: "flex" }}>
          <span dangerouslySetInnerHTML={{ __html: fav.graph || "" }}></span>
          <span
            className={`delta-eth ${
              delta.eq(0) ? "neutral" : delta.gt(0) ? "positive" : "negative"
            }`}
          >{`${delta.gt(0) ? "+" : ""}${delta.round(8).toFixed()} ETH`}</span>
          <span className="delta-percent">
            <FormattedNumber value={parseInt(fav.deltaPercent || "0")} />%
          </span>
        </div>
      )}
    </div>
  );
};

export default FavTile;
