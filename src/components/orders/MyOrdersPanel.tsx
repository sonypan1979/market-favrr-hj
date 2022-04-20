import { NetworkStatus, useQuery } from "@apollo/client";
import Big from "big.js";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  BixeeImageVar,
  MyOrdersQuery,
  MyOrdersQueryVariables,
  Order,
  OrderState,
} from "../../../generated/graphql";
import { useEthereum } from "../../context/EthereumContext";
import MY_ORDERS_QUERY from "../../graphql/query/my_orders_query";
import { formatEthPrice } from "../../util/stringUtils";
import FavThumb from "../fav/FavThumb";
import ResponsiveImage from "../image/ResponsiveImage";
import ExclusivePicker from "../input/ExclusivePicker";
import Loader from "../loader/Loader";
import "./myOrdersPanel.scss";
import OrderStatusLabel from "./OrderStatusLabel";
import OrderSummaryModal from "./OrderSummaryModal";
import emptyOrdersSrc from "../../assets/images/icon_orders.svg";
import USDLabel from "../currency/USDLabel";
import LoadMoreButton from "../button/LoadMoreButton";
import TimeSince from "../time/TimeSince";

const OrderRow = (props: {
  order: Order;
  onClick: () => void;
  numberOfColumns: number;
}) => {
  const { order, onClick, numberOfColumns } = props;
  const { ethQuotation } = useEthereum();

  //TODO remove undefined comparision as query is fixed
  const shares = new Big((order.shares as string) || 0);
  const pps = new Big((order.pps as string) || 0);
  const totalShares = new Big((order.totalShares as string) || 0);
  const progress = totalShares.eq(0)
    ? new Big(0)
    : totalShares.minus(shares).div(totalShares);

  const statusLabel = (
    <div className={`order-status ${order?.state || ""}`}>
      <OrderStatusLabel
        state={order?.state as OrderState}
        filledProgress={Number(
          progress.times(100).round(0, Big.roundDown).toFixed()
        )}
      />
    </div>
  );

  const typeLabel = (
    <div className={`${order?.type || ""} order-type`}>{order?.type}</div>
  );

  return (
    <tr className="order-row" onClick={onClick}>
      <td style={{ display: "flex" }}>
        <div
          className={`image-name-container ${
            numberOfColumns >= 5 ? "row" : "column"
          }`}
        >
          <FavThumb
            images={order?.fav?.icons as Array<BixeeImageVar>}
            size={40}
            style={{ margin: "auto 0px" }}
          />
          <div>
            {numberOfColumns >= 5 && <div>{order?.fav?.displayName}</div>}
            <div
              className={numberOfColumns >= 5 ? "secondary-info" : undefined}
              style={{
                textAlign: numberOfColumns >= 5 ? "left" : "center",
              }}
            >
              {order?.fav?.coin}
            </div>
          </div>
        </div>
      </td>
      <td>
        <div>{pps.round(8).toFixed()} ETH</div>
        <div className="secondary-info">
          <USDLabel value={pps.times(ethQuotation)} /> USD
        </div>
        {numberOfColumns < 4 && (
          <span>
            {order.totalShares}{" "}
            <span className="secondary-info">
              <FormattedMessage defaultMessage="shares" />
            </span>
          </span>
        )}
      </td>

      {numberOfColumns >= 4 && <td>{order?.totalShares}</td>}
      <td>
        {numberOfColumns < 5 && typeLabel}
        {statusLabel}
        <TimeSince date={order.date} />
      </td>
      {numberOfColumns >= 5 && <td>{typeLabel}</td>}
    </tr>
  );
};

const MyOrdersPanel = () => {
  const [statusFilter, setStatusFilter] = useState<OrderState | null>(null);

  const ITEMS_PER_PAGE = 5;
  const {
    data: myOrdersData,
    loading,
    fetchMore,
    networkStatus,
  } = useQuery<MyOrdersQuery, MyOrdersQueryVariables>(MY_ORDERS_QUERY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    variables: {
      state: statusFilter == null ? undefined : statusFilter,
      pagination: {
        perPage: ITEMS_PER_PAGE,
      },
    },
  });

  const loadMore = () => {
    fetchMore({
      variables: {
        state: statusFilter == null ? undefined : statusFilter,
        pagination: {
          perPage: ITEMS_PER_PAGE,
          cursor: myOrdersData?.MyOrders?.cursor as string,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const mergedResult = {
          ...fetchMoreResult,
          MyOrders: {
            ...fetchMoreResult?.MyOrders,
            orders: (prev.MyOrders?.orders || []).concat(
              fetchMoreResult?.MyOrders?.orders || []
            ),
          },
        };
        return mergedResult;
      },
    });
  };

  const [orderDisplayed, setOrderDisplayed] = useState<null | Order>(null);

  let numberOfColumns = 5;
  if (window.innerWidth <= 1010) {
    numberOfColumns = 4;
  }
  if (window.innerWidth <= 430) {
    numberOfColumns = 3;
  }

  return (
    <>
      <div className="my-orders-panel">
        {(statusFilter != null || myOrdersData?.MyOrders?.count != 0) && (
          <ExclusivePicker
            value={statusFilter || "ALL"}
            options={[
              {
                value: "ALL",
                label: "All",
              },
              {
                value: OrderState.Filled,
                label: "Open",
              },
              {
                value: OrderState.Completed,
                label: "Completed",
              },
              // {
              //   value: OrderState.Pending,
              //   label: "Pending",
              // },
              {
                value: OrderState.Withdrawn,
                label: "Withdrawn",
              },
            ]}
            onChange={(status) => {
              setStatusFilter(status == "ALL" ? null : status);
            }}
          />
        )}
        <table>
          {myOrdersData?.MyOrders?.count != 0 &&
            networkStatus != NetworkStatus.loading && (
              <thead>
                <tr>
                  <th>
                    <FormattedMessage defaultMessage="Asset" />
                  </th>
                  <th>
                    <FormattedMessage defaultMessage="Share price" />
                  </th>
                  {numberOfColumns >= 4 && (
                    <th>
                      <FormattedMessage defaultMessage="Shares" />
                    </th>
                  )}
                  {numberOfColumns >= 5 && (
                    <th>
                      <FormattedMessage defaultMessage="Status" />
                    </th>
                  )}
                  <th>
                    <FormattedMessage defaultMessage="Type" />
                  </th>
                </tr>
              </thead>
            )}
          <tbody>
            {networkStatus == NetworkStatus.loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", paddingTop: 50 }}>
                  <Loader style={{ margin: "auto" }} />
                </td>
              </tr>
            ) : (
              <>
                {myOrdersData?.MyOrders?.orders?.map((order, i) => (
                  <OrderRow
                    key={order?.tx as string}
                    order={order as Order}
                    onClick={() => setOrderDisplayed(order)}
                    numberOfColumns={numberOfColumns}
                  />
                ))}
                {myOrdersData?.MyOrders?.count == 0 && (
                  <tr>
                    <td className="no-orders" colSpan={5}>
                      <div className="empty-order">
                        <img src={emptyOrdersSrc} />
                        <div>
                          <FormattedMessage defaultMessage="No Orders Yet" />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
        {myOrdersData?.MyOrders?.cursor ? (
          <div style={{ width: "100%", textAlign: "center" }}>
            <LoadMoreButton loading={loading} onClick={loadMore} />
          </div>
        ) : null}
      </div>
      {orderDisplayed && (
        <OrderSummaryModal
          order={orderDisplayed}
          onClose={() => setOrderDisplayed(null)}
        />
      )}
    </>
  );
};

export default MyOrdersPanel;
