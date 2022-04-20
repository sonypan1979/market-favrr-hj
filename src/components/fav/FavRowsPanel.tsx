import React, { CSSProperties, Ref, useEffect, useRef, useState } from "react";
import { Bixee, BixeeImageVar } from "../../../generated/graphql";
import { favPath } from "../../routes/pathBuilder";
import FavThumb from "./FavThumb";
import "./favRowsPanel.scss";
import { FormattedMessage } from "react-intl";
import ScrollContainer from "react-indiana-drag-scroll";
import Big from "big.js";
import { Link } from "react-router-dom";
import ScrollShadowOverlay from "../layout/ScrollShadowOverlay";
import Loader from "../loader/Loader";

const FavRow = (props: {
  fav: Bixee;
  style?: CSSProperties;
  position: number;
}) => {
  const { fav, style, position } = props;

  return (
    <div style={{ display: "flex", gap: 16, ...style }} className="fav-row">
      <Link to={favPath(fav.title as string)} className="thumb-link">
        <div className="position-badge">{position}</div>
        <FavThumb images={fav.icons as Array<BixeeImageVar>} size={72} />
      </Link>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Link to={favPath(fav.title as string)}>
          <span className="display-name-label">{fav.displayName}</span>{" "}
          <span className="coin-tick">{fav.coin}</span>
        </Link>
        <div className="market-cap-label">
          <FormattedMessage
            defaultMessage="{marketCap} Market Cap"
            values={{
              marketCap: new Big(fav.marketCap || 0)
                .round(4, Big.roundUp)
                .toFixed(),
            }}
          />
        </div>
      </div>
    </div>
  );
};

const FavRowsPanel = (props: { favs?: Array<Bixee> }) => {
  const { favs } = props;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  //   const ITEMS_PER_COLUMN = 3;

  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      if (scrollRef.current.clientWidth < scrollRef.current.scrollWidth) {
        scrollRef.current.style.setProperty("cursor", "grabbing");
      }
    }
  });
  return (
    <ScrollShadowOverlay
      scrollElementRef={scrollRef}
      className="fav-rows-panel"
    >
      <ScrollContainer
        className={`scroll-container ${scrolling ? `scrolling` : ""}`}
        vertical={true}
        hideScrollbars={false}
        onStartScroll={() => setScrolling(true)}
        onEndScroll={() => setScrolling(false)}
        ref={(scroll) => {
          scrollRef.current = (scroll as any)?.container?.current || null;
        }}
      >
        {!favs && <Loader />}
        {favs?.map((fav, i) => {
          return (
            <FavRow
              key={fav.key as string}
              fav={fav}
              position={i + 1}
              style={{}}
            />
          );
        })}
      </ScrollContainer>
    </ScrollShadowOverlay>
  );
};

export default FavRowsPanel;
