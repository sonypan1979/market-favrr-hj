import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Bixee,
  FavHistory,
  FavHistoryType,
  HistoryData,
  HistoryQueryQuery,
  HistoryQueryQueryVariables,
  PortfolioQuery,
  PortfolioQueryVariables,
} from "../../../generated/graphql";
import HISTORY_QUERY from "../../graphql/query/history_query";
import { formatUserDisplay } from "../../util/stringUtils";
import profilePlaceholderSrc from "../../assets/images/person-placeholder.svg";
import favrrPlaceholderSrc from "../../assets/images/profile-placeholder.svg";
import oceanaPlaceholderSrc from "../../assets/images/oceana-placeholder.svg";
import "./activityPanel.scss";
import TimeSince from "../time/TimeSince";
import Loader from "../loader/Loader";
import BuyModal from "../transaction/BuySellModal";
import LoadMoreButton from "../button/LoadMoreButton";
import PORTFOLIO_QUERY from "../../graphql/query/portfolio_query";
import { Link } from "react-router-dom";
import { favPath, howItWorksPath } from "../../routes/pathBuilder";
import OrderBook from "../orders/OrderBook";
import { useWatchIPO } from "../../hooks/useWatchIPO";
import Tooltip, { TooltipBody, TooltipTitle } from "../tooltip/Tooltip";
import infoSrc from "../../assets/images/info.svg";
import { HashLink } from "react-router-hash-link";

const ActivityPanelItem = (props: {
  history: FavHistory;
  displayCoin?: boolean;
}) => {
  // if (props.history.type != ActivityType.BUY) {
  //   return null;
  // }

  let description: JSX.Element | null = null;
  const descriptionVariables = {
    User: (content: JSX.Element) => (
      <span className="user-label">{content}</span>
    ),
    username: props.history.to ? formatUserDisplay(props.history.to) : "",
    Shares: (content: JSX.Element) => (
      <span className="shares-label">{content}</span>
    ),
    shares: props.history.amount,
    EthPrice: (content: JSX.Element) => (
      <span className="price-label">{content}</span>
    ),
    ethPrice: props.history.price,
    Coin: (content: JSX.Element) =>
      props.displayCoin ? (
        <Link
          to={favPath(props.history.title as string)}
          className="coin-label"
        >
          {content}
        </Link>
      ) : null,

    coinName: props.displayCoin ? props.history.coin : null,
  };
  switch (props.history.type) {
    case FavHistoryType.Sell:
    // case FavHistoryType.BuyFromIpo:
    case FavHistoryType.Buy:
      description = (
        <FormattedMessage
          defaultMessage="Purchased <Shares>{shares} {shares, select, 1 {share} other {shares}}</Shares> {coinName, select, null {} other {of}} <Coin>{coinName}</Coin> at {ipo, select, true {IPO for} other {}} <EthPrice>{ethPrice} ETH</EthPrice> by <User>{username}</User>"
          values={{ ...descriptionVariables, ipo: props.history.isIPO }}
        />
      );
      break;
    case FavHistoryType.WithdrawSellOrder:
    case FavHistoryType.WithdrawBuyOrder:
      description = (
        <FormattedMessage
          defaultMessage="Withdrawn {orderType, select, buy {buy} other {sell}} order for <Shares>{shares} {shares, select, 1 {share} other {shares}}</Shares> {coinName, select, null {} other {of}} <Coin>{coinName}</Coin> at <EthPrice>{ethPrice} ETH</EthPrice> by <User>{username}</User>"
          values={{
            ...descriptionVariables,
            orderType: [FavHistoryType.WithdrawBuyOrder].includes(
              props.history.type
            )
              ? "buy"
              : "sell",
            username: props.history.from
              ? formatUserDisplay(props.history.from)
              : "",
          }}
        />
      );
      break;
    case FavHistoryType.BuyOrderPlaced:
    case FavHistoryType.SellOrderPlaced:
      description = (
        <FormattedMessage
          defaultMessage="Placed {orderType, select, buy {buy} other {sell}} order for <Shares>{shares} {shares, select, 1 {share} other {shares}}</Shares> {coinName, select, null {} other {of}} <Coin>{coinName}</Coin> at <EthPrice>{ethPrice} ETH</EthPrice> by <User>{username}</User>"
          values={{
            ...descriptionVariables,
            orderType:
              props.history.type == FavHistoryType.BuyOrderPlaced
                ? "buy"
                : "sell",
            username: props.history.from
              ? formatUserDisplay(props.history.from)
              : "",
          }}
        />
      );
      break;
    case FavHistoryType.IpoEnd:
      description = (
        <FormattedMessage
          defaultMessage="Trading started <Shares>{shares} {shares, select, 1 {share} other {shares}}</Shares> at <EthPrice>{ethPrice} ETH</EthPrice>"
          values={{
            ...descriptionVariables,
          }}
        />
      );
      break;
    case FavHistoryType.IpoStart:
      description = (
        <FormattedMessage
          defaultMessage="IPOed <Shares>{shares} {shares, select, 1 {share} other {shares}}</Shares> at <EthPrice>{ethPrice} ETH</EthPrice>"
          values={{
            ...descriptionVariables,
          }}
        />
      );
      break;
    default:
      break;
  }

  const favrrAction = [FavHistoryType.IpoStart, FavHistoryType.IpoEnd].includes(
    props.history.type as FavHistoryType
  );

  return (
    <div className="activity-panel-item">
      <div className={`userthumb ${favrrAction ? "favrr-action" : ""}`}>
        <img
          src={
            favrrAction
              ? process.env.OCEANA_ENV == "true"
                ? oceanaPlaceholderSrc
                : favrrPlaceholderSrc
              : profilePlaceholderSrc
          }
        />
      </div>
      <span className="event-description">{description}</span>
      <TimeSince date={props.history.date} />
    </div>
  );
};

enum ActivityTab {
  HISTORY,
  DETAILS,
  ORDER_BOOK,
}

const ActivityPanel = (props: {
  activities?: Array<FavHistory>;
  loading: boolean;
  fetchMore?: () => void;
  fav?: Bixee;
  displayCoin?: boolean;
}) => {
  const [isDisplayingModal, setDisplayingModal] = useState(false);
  if (isDisplayingModal && props.fav) {
    return (
      <BuyModal
        fav={props.fav as Bixee}
        onClose={() => setDisplayingModal(false)}
        transactionType="buy"
      />
    );
  }
  return (
    <div className="activity-panel">
      {props.activities?.length == 0 && (
        <div className="empty-activity-panel">
          <h3 className="title">
            <FormattedMessage defaultMessage="Nothing Yet" />
          </h3>
          <div className="text">
            <FormattedMessage
              defaultMessage="Be the 1st to buy <Shares>{shareName} shares</Shares> during the IPO to get the greatest return on your investment. <Link>Learn more</Link>"
              values={{
                Link: (content: JSX.Element) => (
                  <Link to={howItWorksPath()} className="learn-more">
                    {content}
                  </Link>
                ),
                Shares: (content: JSX.Element) => (
                  <span className="shares-label">{content}</span>
                ),
                shareName: props.fav?.coin,
              }}
            />
          </div>
          <button
            className="action-button blue-button"
            onClick={() => setDisplayingModal(true)}
          >
            <FormattedMessage defaultMessage="Buy Now" />
          </button>
        </div>
      )}
      {props.activities?.map((history, i) => (
        <ActivityPanelItem
          key={i}
          history={history as FavHistory}
          displayCoin={props.displayCoin}
        />
      ))}
      {props.fetchMore && (
        <div className="load-more-container">
          {props.loading ? (
            <Loader />
          ) : (
            <LoadMoreButton onClick={props.fetchMore} />
          )}
        </div>
      )}
    </div>
  );
};

export const FavActivityPanel = (props: { fav: Bixee }) => {
  const isIPO = useWatchIPO({ bixee: props.fav });

  const [activatedTab, setActivatedTab] = useState(
    isIPO ? ActivityTab.HISTORY : ActivityTab.ORDER_BOOK
  );

  const { data, loading, fetchMore } = useQuery<
    HistoryQueryQuery,
    HistoryQueryQueryVariables
  >(HISTORY_QUERY, {
    skip: !props.fav?.key,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",

    variables: {
      key: props.fav?.key,
      pagination: { perPage: 5 },
      type:
        //Checkin for history even if not visible, to detect if headers should be visible
        activatedTab == ActivityTab.DETAILS
          ? HistoryData.Details
          : HistoryData.History,
    },
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () => {
    fetchMore({
      variables: {
        key: props.fav?.key,
        pagination: { cursor: data?.history?.cursor, perPage: 5 },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const mergedResult = {
          ...fetchMoreResult,
          history: {
            ...fetchMoreResult?.history,
            results: (prev.history?.results || []).concat(
              fetchMoreResult?.history?.results || []
            ),
          },
        };
        return mergedResult;
      },
    });
  };

  const hasMore =
    data?.history?.cursor &&
    data.history.totalCount != data?.history?.results?.length;

  const hideTabsHeader =
    isIPO &&
    activatedTab == ActivityTab.HISTORY &&
    (loading || (data?.history?.totalCount == 0 && !data?.history?.cursor));

  return (
    <>
      <div
        className="activity-panel-tabs"
        style={{ visibility: hideTabsHeader ? "hidden" : undefined }}
      >
        {isIPO ? null : (
          <button
            className={`activity-tab order-book-tab ${
              activatedTab == ActivityTab.ORDER_BOOK ? "active-tab" : ""
            }`}
            onClick={() => setActivatedTab(ActivityTab.ORDER_BOOK)}
            style={{ marginRight: "12px" }}
          >
            <FormattedMessage defaultMessage="Order book" />
            <Tooltip
              tooltip={
                <div className="whats-an-order">
                  <TooltipTitle>
                    <FormattedMessage defaultMessage="What's the Order Book?" />
                  </TooltipTitle>
                  <TooltipBody>
                    <FormattedMessage
                      defaultMessage="The order book records the interest of buyers and sellers in the market for a particular {oceana, select, true {NFT} other {FAV}}. <Link>Learn more</Link>"
                      values={{
                        Link: (content: JSX.Element) => (
                          <HashLink
                            to={howItWorksPath("order-book")}
                            className="learn-more"
                          >
                            {content}
                          </HashLink>
                        ),
                        oceana: process.env.OCEANA_ENV,
                      }}
                    />
                  </TooltipBody>
                </div>
              }
              position="top"
            >
              <img src={infoSrc} />
            </Tooltip>
          </button>
        )}
        <button
          className={`activity-tab ${
            activatedTab == ActivityTab.HISTORY ? "active-tab" : ""
          }`}
          onClick={() => setActivatedTab(ActivityTab.HISTORY)}
          style={{ marginRight: "12px" }}
        >
          <FormattedMessage defaultMessage="history" />
        </button>
        <button
          className={`activity-tab ${
            activatedTab == ActivityTab.DETAILS ? "active-tab" : ""
          }`}
          onClick={() => setActivatedTab(ActivityTab.DETAILS)}
        >
          <FormattedMessage defaultMessage="details" />
        </button>
      </div>
      {activatedTab == ActivityTab.ORDER_BOOK ? (
        <OrderBook title={props.fav.title as string} />
      ) : (
        <ActivityPanel
          fav={props.fav}
          loading={loading}
          fetchMore={hasMore ? loadMore : undefined}
          activities={
            (data?.history?.results || undefined) as
              | Array<FavHistory>
              | undefined
          }
        />
      )}
    </>
  );
};

export const PortfolioActivityPanel = (props: { address: string }) => {
  const { data, loading, fetchMore } = useQuery<
    PortfolioQuery,
    PortfolioQueryVariables
  >(PORTFOLIO_QUERY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: { address: props.address, pagination: { perPage: 5 } },
    notifyOnNetworkStatusChange: true,
  });
  const loadMore = () => {
    fetchMore({
      variables: {
        address: props.address,
        pagination: { cursor: data?.portfolio?.cursor, perPage: 5 },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const mergedResult = {
          ...fetchMoreResult,
          portfolio: {
            ...fetchMoreResult?.portfolio,
            results: (prev.portfolio?.results || []).concat(
              fetchMoreResult?.portfolio?.results || []
            ),
          },
        };
        return mergedResult;
      },
    });
  };

  const hasMore = !!(
    data?.portfolio?.totalCount &&
    data?.portfolio?.totalCount != data?.portfolio?.results?.length
  );
  return (
    <ActivityPanel
      loading={loading}
      fetchMore={hasMore ? loadMore : undefined}
      activities={
        (data?.portfolio?.results || undefined) as Array<FavHistory> | undefined
      }
      displayCoin
    />
  );
};

export default ActivityPanel;
