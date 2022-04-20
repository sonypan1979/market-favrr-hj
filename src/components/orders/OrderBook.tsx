import { useQuery } from "@apollo/client";
import { PROPERTY_TYPES } from "@babel/types";
import Big, { RoundingMode } from "big.js";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  OrdersQueryQuery,
  OrdersQueryQueryVariables,
  OrderType,
  PpsQuery,
  PpsQueryVariables,
} from "../../../generated/graphql";
import { useEthereum } from "../../context/EthereumContext";
import ORDERS_QUERY from "../../graphql/query/orders_query";
import PPS_QUERY from "../../graphql/query/pps_query";
import { formatEthPrice } from "../../util/stringUtils";
import LoadMoreButton from "../button/LoadMoreButton";
import USDLabel from "../currency/USDLabel";
import orderIcon from "../../assets/images/icon_orders.svg";
import Loader from "../loader/Loader";
import "./orderBook.scss";

const ORDER_PER_PAGE = 4;
const OrderBook = (props: { title: string }) => {
  const { title } = props;
  const { data: ppsData } = useQuery<PpsQuery, PpsQueryVariables>(PPS_QUERY, {
    variables: { title },
  });
  const { data: sellData, fetchMore: fetchMoreSell } = useQuery<
    OrdersQueryQuery,
    OrdersQueryQueryVariables
  >(ORDERS_QUERY, {
    // pollInterval: 60 * 1000,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      type: OrderType.Sell,
      title: props.title,
      pagination: {
        perPage: ORDER_PER_PAGE,
      },
    },
  });

  const { data: buyData, fetchMore: fetchMoreBuy } = useQuery<
    OrdersQueryQuery,
    OrdersQueryQueryVariables
  >(ORDERS_QUERY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      type: OrderType.Buy,
      title: props.title,
      pagination: {
        perPage: ORDER_PER_PAGE,
      },
    },
  });

  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = () => {
    const fetchMoreBuyPromise = buyData?.orders?.cursor
      ? fetchMoreBuy({
          variables: {
            type: OrderType.Buy,
            title: props.title,
            pagination: {
              perPage: ORDER_PER_PAGE,
              cursor: buyData.orders.cursor,
            },
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            const mergedResult = {
              ...fetchMoreResult,
              orders: {
                ...fetchMoreResult?.orders,
                orders: (prev.orders?.orders || []).concat(
                  fetchMoreResult?.orders?.orders || []
                ),
              },
            };
            return mergedResult;
          },
        })
      : null;
    const fetchMoreSellPromise = sellData?.orders?.cursor
      ? fetchMoreSell({
          variables: {
            type: OrderType.Sell,
            title: props.title,
            pagination: {
              perPage: ORDER_PER_PAGE,
              cursor: sellData.orders.cursor,
            },
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            const mergedResult = {
              ...fetchMoreResult,
              orders: {
                ...fetchMoreResult?.orders,
                orders: (fetchMoreResult?.orders?.orders || []).concat(
                  prev.orders?.orders || []
                ),
              },
            };
            return mergedResult;
          },
        })
      : null;

    setLoadingMore(true);
    return Promise.all([
      fetchMoreBuyPromise,
      fetchMoreSellPromise,
      null,
      undefined,
    ]).finally(() => setLoadingMore(false));
  };

  const hasMore = !!(buyData?.orders?.cursor || sellData?.orders?.cursor);
  const { ethQuotation } = useEthereum();

  if (!buyData || !sellData) {
    return (
      <div className="order-book" style={{ padding: 40 }}>
        <Loader style={{ margin: "auto" }} />
      </div>
    );
  }
  if (
    sellData?.orders?.orders?.length == 0 &&
    buyData?.orders?.orders?.length == 0
  ) {
    return (
      <div className="order-book">
        <div className="empty-order-container">
          <img src={orderIcon} className="empty-order-icon" />
          <div>
            <FormattedMessage defaultMessage="No Orders" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="order-book">
      <div className="order-book--header">
        <span className="row-item">
          <FormattedMessage defaultMessage="Price Per Share" />
        </span>
        <span>
          <FormattedMessage defaultMessage="Shares" />
        </span>
        <span className="row-item">
          <FormattedMessage defaultMessage="Total Price" />
        </span>
      </div>
      {sellData?.orders?.orders?.length == 0 && (
        <div className="empty-order-container">
          <img src={orderIcon} className="empty-order-icon" />
          <div>
            <FormattedMessage defaultMessage="No Sell Orders" />
          </div>
        </div>
      )}
      {sellData?.orders?.orders?.map((transaction, i) => {
        const pps = new Big(transaction?.pps as string);
        const shares = new Big(transaction?.shares as string);
        return (
          <div key={i} className={`order-row sell`}>
            <span className="row-item">
              <span>{pps.round(8, Big.roundUp).toFixed()} ETH</span>
              <span className="usd-price">
                <USDLabel
                  value={pps.times(ethQuotation).round(2, Big.roundDown)}
                />
              </span>
            </span>
            <span>{shares.round(8, Big.roundUp).toFixed()}</span>
            <span className="row-item">
              <span>{`${shares
                .times(pps)
                .round(8, Big.roundUp)
                .toFixed()} ETH`}</span>
              <span className="usd-price">
                <USDLabel
                  value={ethQuotation.times(pps).times(shares).round(2)}
                />
              </span>
            </span>
          </div>
        );
      })}
      <div className="last-pps">
        <span>
          <FormattedMessage defaultMessage="Last Price Per Share" />
        </span>
        <span>{new Big(ppsData?.pps?.pps || "0").round(8).toFixed()} ETH</span>
      </div>
      {buyData?.orders?.orders?.length == 0 && (
        <div className="empty-order-container">
          <img src={orderIcon} className="empty-order-icon" />
          <div>
            <FormattedMessage defaultMessage="No Buy Orders" />
          </div>
        </div>
      )}
      {buyData?.orders?.orders?.map((transaction, i) => {
        const pps = new Big(transaction?.pps as string);
        const shares = transaction?.shares as string;
        return (
          <div key={i} className={`order-row buy`}>
            <span className="row-item">
              <span>{`${pps.round(8, Big.roundDown).toFixed()} ETH`}</span>
              <span className="usd-price">
                <USDLabel
                  value={ethQuotation.times(pps).round(2, Big.roundDown)}
                />
              </span>
            </span>
            <span>{transaction?.shares}</span>
            <span className="row-item">
              <span>{`${pps
                .times(shares)
                .round(8, Big.roundDown)
                .toFixed()} ETH`}</span>
              <span className="usd-price">
                <USDLabel
                  value={ethQuotation
                    .times(pps)
                    .times(shares)
                    .round(2, Big.roundDown)}
                />
              </span>
            </span>
          </div>
        );
      })}
      {hasMore && <LoadMoreButton onClick={loadMore} loading={loadingMore} />}
    </div>
  );
};

export default OrderBook;
