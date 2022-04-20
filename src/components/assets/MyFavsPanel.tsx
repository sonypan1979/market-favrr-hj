import { useQuery } from "@apollo/client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Bixee,
  BixeeImageVar,
  EquityFavsQuery,
  EquityFavsQueryVariables,
  FavsQuery,
  FavsQueryVariables,
  SortingField,
  Sorting,
} from "../../../generated/graphql";
import ResponsiveImage from "../image/ResponsiveImage";
import favPlaceholderSrc from "../../assets/images/person-placeholder.svg";
import emptyWatchlistSrc from "../../assets/images/star.svg";
import chevronSrc from "../../assets/images/chevron.svg";
import "./myFavsPanel.scss";
import { favPath, homePath } from "../../routes/pathBuilder";
import { Link } from "react-router-dom";
import Loader from "../loader/Loader";
import FAVS_EQUITY_QUERY from "../../graphql/query/favs_equity_query";
import { useWallet } from "../../context/WalletContext";
import Big from "big.js";
import BorderedButton from "../button/BorderedButton";
import { ResponsiveContext } from "../../context/ResponsiveContext";
import { Transition, TransitionGroup } from "react-transition-group";

const MyFavsRow = (props: { fav: Bixee; shares?: string; equity?: string }) => {
  const { fav } = props;
  const shares = new Big(props.shares || 1);
  const equity = new Big(props.equity || 0);
  const pps = new Big(fav.pps as string);
  return (
    <Link to={favPath(fav.title as string)} className="my-favs-row">
      <div className="image-container">
        <ResponsiveImage
          images={fav.icons as Array<BixeeImageVar>}
          defaultImg={favPlaceholderSrc}
        />
      </div>
      <div className="name-amount-section">
        <div className="fav-name">
          {fav.displayName}
          {props.shares != undefined && (
            <span className="fav-coin">{fav.coin}</span>
          )}
        </div>
        <div className="shares-amount">
          {props.shares == undefined ? (
            <span className="fav-coin">{fav.coin}</span>
          ) : (
            <FormattedMessage
              defaultMessage="{shares} {shares, select, 1 {share} other {shares}}"
              values={{ shares: shares.round(8).toFixed() }}
            />
          )}
        </div>
      </div>
      <div className="price">
        <div className="current-price">
          {(props.equity ? equity : pps).round(8).toFixed() + " ETH"}
        </div>
        <div
          className={`delta-price ${
            (fav.delta || 0) >= 0 ? "positive" : "negative"
          }`}
        >
          {((fav.delta || 0) >= 0 ? "+" : "") +
            shares
              .times(fav.delta || 0)
              .round(8)
              .toFixed() +
            " ETH"}
        </div>
      </div>
    </Link>
  );
};

const MyFavsPanel = () => {
  const { walletAddresses } = useWallet();
  const { data, loading } = useQuery<EquityFavsQuery, EquityFavsQueryVariables>(
    FAVS_EQUITY_QUERY,
    {
      variables: {
        filter: {
          owned: walletAddresses?.length ? walletAddresses[0] : undefined,
        },
        sort: {
          field: SortingField.Event,
          order: "DESC",
        },
        pagination: {
          perPage: 999,
        },
      },
    }
  );

  //If you change variables, update query made in like button to update this
  const { data: watchlistData, loading: watchlistLoading } = useQuery<
    EquityFavsQuery,
    EquityFavsQueryVariables
  >(FAVS_EQUITY_QUERY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      filter: {
        favorited: walletAddresses?.length ? walletAddresses[0] : undefined,
      },
      sort: {
        field: SortingField.Name,
      },
      pagination: {
        perPage: 99999,
      },
    },
  });

  const [watchlistExpanded, setWatchlistExpanded] = useState(
    window.innerWidth > 660
  );

  const watchlistContainerRef = useRef<HTMLDivElement | null>(null);

  const emptyMyFavs = data?.favs?.count == 0;
  const emptyWatchlist = watchlistData?.favs?.count == 0;

  useEffect(() => {
    if (watchlistContainerRef.current) {
      const maxHeight = watchlistExpanded
        ? watchlistContainerRef.current.scrollHeight + "px"
        : "0px";
      watchlistContainerRef.current?.style.setProperty("max-height", maxHeight);
    }
  }, [watchlistData?.favs?.count, watchlistExpanded]);

  return (
    <div className="my-favs-panel">
      <h2 className="panel-title my-favs">
        <FormattedMessage
          defaultMessage="My {oceana, select, true {Portfolio} other {FAVs}}"
          values={{ oceana: process.env.OCEANA_ENV }}
        />
      </h2>
      {emptyMyFavs && (
        <div className="empty-section empty-myfavs-section">
          <div className="img-container">
            <img src={favPlaceholderSrc} />
          </div>
          <div className="empty-label">
            <FormattedMessage defaultMessage="Nothing Yet" />
          </div>

          <Link to={homePath()}>
            <button className="action-button find-favs-button">
              <FormattedMessage
                defaultMessage="Find {assetsName}"
                values={{
                  assetsName:
                    process.env.OCEANA_ENV == "true" ? "NFTs" : "FAVs",
                }}
              />
            </button>
          </Link>
        </div>
      )}
      {loading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        data?.favs?.result?.map((myFavs) => (
          <MyFavsRow
            key={myFavs?.fav?.key as string}
            fav={myFavs?.fav as Bixee}
            shares={myFavs?.shares as string}
            equity={myFavs?.equity as string}
          />
        ))
      )}
      <h2
        className="panel-title"
        style={{
          marginTop: 54,
          marginBottom: 0,
        }}
      >
        <span style={{ margin: "auto 0px" }}>
          <FormattedMessage
            defaultMessage="Watchlist"
            values={{ oceana: process.env.OCEANA_ENV }}
          />
        </span>

        {watchlistData?.favs?.count ? (
          <BorderedButton
            buttonProps={{
              onClick: () => setWatchlistExpanded(!watchlistExpanded),
              style: {
                marginLeft: "auto",
                transition: "0.3s all ease-out",
                transform: watchlistExpanded ? "rotate(90deg)" : "",
              },
            }}
            iconSrc={chevronSrc}
          />
        ) : null}
      </h2>
      {emptyWatchlist && (
        <div className="empty-section empty-watchlist-section">
          <div className="img-container" style={{ opacity: 0.26 }}>
            <img src={emptyWatchlistSrc} />
          </div>
          <div className="empty-label">
            <FormattedMessage defaultMessage="Nothing Yet" />
          </div>
        </div>
      )}
      {watchlistLoading ? (
        <div className="loader-container" style={{ marginTop: 32 }}>
          <Loader />
        </div>
      ) : (
        <Transition
          in={watchlistExpanded}
          timeout={700}
          mountOnEnter
          unmountOnExit
        >
          <div
            className={`rows-container ${watchlistExpanded ? "expanded" : ""}`}
            ref={watchlistContainerRef}
            style={{ marginBottom: 0 }}
          >
            {watchlistData?.favs?.result?.map((myFavs) => (
              <MyFavsRow
                key={myFavs?.fav?.key as string}
                fav={myFavs?.fav as Bixee}
              />
            ))}
          </div>
        </Transition>
      )}
    </div>
  );
};

export default MyFavsPanel;
