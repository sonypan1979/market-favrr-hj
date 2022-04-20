import dayjs from "dayjs";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  BixeeImageVar,
  GetNotificationsQuery,
  GetNotificationsQueryVariables,
  NotificationOrderTxType,
  NotificationOrderType,
  NotificationPayload,
  NotificationType,
  OrderState,
  OrderType,
  ReadNotificationMutation,
  ReadNotificationMutationVariables,
  SubscriptionEvent,
} from "../../../generated/graphql";
import ResponsiveImage from "../image/ResponsiveImage";
import TimeSince from "../time/TimeSince";
import profilePlaceholderSrc from "../../assets/images/person-placeholder.svg";
import "./notificationTile.scss";
import { formatEthPrice } from "../../util/stringUtils";
import { gql, useApolloClient, useMutation } from "@apollo/client";
import READ_NOTIFICATION_MUTATION from "../../graphql/mutation/read_notification";
import { useWallet } from "../../context/WalletContext";
import OrderStatusLabel from "../orders/OrderStatusLabel";
import BullePoint from "../util/BulletPoint";
import OrderSummaryModal, {
  OrderSummaryWithTx,
} from "../orders/OrderSummaryModal";
import Big from "big.js";
import GET_NOTIFICATIONS_QUERY from "../../graphql/query/get_notifications_query";

// export interface MockNotification {
//   id: number;
//   img?: string;
//   category?: string;
//   type: MockNotificationType;
//   shares?: number;
//   time?: string;
//   price?: number;
//   coin?: string;
// }
const OrderTypeMap = {
  [NotificationOrderType.OrderFailed]: OrderState.Failed,
  [NotificationOrderType.OrderFullfilled]: OrderState.Completed,
  [NotificationOrderType.OrderPending]: OrderState.Pending,
  [NotificationOrderType.OrderPlaced]: OrderState.Filled,
  [NotificationOrderType.OrderWithdrawn]: OrderState.Withdrawn,
};

const NotificationTile = ({
  notification,
}: {
  notification: NotificationPayload;
}) => {
  const [readNotification] = useMutation<
    ReadNotificationMutation,
    ReadNotificationMutationVariables
  >(READ_NOTIFICATION_MUTATION);

  const { walletAddresses } = useWallet();
  const client = useApolloClient();
  const [orderIdDisplayed, setOrderIdDisplayed] = useState<string | null>(null);

  const pps = new Big(notification.order?.pps || 0);
  const totalAmount = new Big(notification.order?.totalAmount || 0);
  const amount = new Big(notification.order?.amount || 0);

  if (orderIdDisplayed) {
    return (
      <OrderSummaryWithTx
        tx={orderIdDisplayed}
        onClose={() => setOrderIdDisplayed(null)}
      />
    );
  }
  return (
    <div
      className="notification-tile"
      onClick={() => {
        if (!notification.read && walletAddresses?.length) {
          client.writeFragment({
            fragment: gql`
              fragment NotificationFragment on NotificationPayload {
                id
                read
              }
            `,
            data: {
              id: notification.id,
              read: true,
              __typename: notification.__typename,
            },
          });
          readNotification({
            variables: {
              address: walletAddresses[0],
              id: notification.id,
            },
          }).then(({ data }) => {
            try {
              const notificationsData = client.readQuery<
                GetNotificationsQuery,
                GetNotificationsQueryVariables
              >({
                query: GET_NOTIFICATIONS_QUERY,
                variables: {
                  address: walletAddresses[0] as string,
                },
              });
              client.writeQuery<
                GetNotificationsQuery,
                GetNotificationsQueryVariables
              >({
                query: GET_NOTIFICATIONS_QUERY,
                variables: { address: walletAddresses[0] as string },
                data: {
                  ...notificationsData,
                  getNotifications: {
                    ...notificationsData?.getNotifications,
                    unread: data?.readNotification?.unread,
                  },
                },
              });
            } catch {}
          });
        }
        console.log({
          notificationType: notification.type,
          tx: notification.order?.tx,
        });
        if (notification.type == NotificationType.OrderUpdate) {
          setOrderIdDisplayed(notification.order?.tx as string);
        }
      }}
    >
      <ResponsiveImage
        images={notification.fav?.icons as Array<BixeeImageVar>}
        defaultImg={profilePlaceholderSrc}
      />
      <div className="info">
        <span className="title">
          {notification.type == NotificationType.Ipo
            ? "COLLECTION NAME"
            : `${amount.round(8).toFixed()} ${notification.fav?.coin}`}
        </span>
        <div>
          <span className={`type ${notification.type}`}>
            {notification.type == NotificationType.Ipo && (
              <FormattedMessage defaultMessage="IPOed" />
            )}
            {/* {notification.order?.type ==
              NotificationOrderType.OrderFullfilled &&
              (notification.order.transactionType ==
              NotificationOrderTxType.Buy ? (
                <FormattedMessage defaultMessage="Purchased" />
              ) : (
                <FormattedMessage defaultMessage="Sold" />
              ))}
            {notification.order?.type == NotificationOrderType.OrderPlaced &&
              (notification.order.transactionType ==
              NotificationOrderTxType.Buy ? (
                <FormattedMessage defaultMessage="Buy" />
              ) : (
                <FormattedMessage defaultMessage="Sell" />
              ))}
            {notification.order?.type == NotificationOrderType.OrderPending && (
              <FormattedMessage defaultMessage="Processing" />
            )}

            {notification.order?.type == NotificationOrderType.OrderFailed && (
              <FormattedMessage defaultMessage="Failed" />
            )} */}
          </span>{" "}
          {notification.type != NotificationType.Ipo && (
            <span className="subtitle">
              <FormattedMessage
                defaultMessage="{orderType, select, buy {Buy} other {Sell}} at {price} ETH "
                values={{
                  price: pps.times(amount).round(8).toFixed(),
                  orderType:
                    notification.order?.transactionType ==
                    NotificationOrderTxType.Buy
                      ? "buy"
                      : "sell",
                }}
              />
            </span>
          )}
        </div>
        <div>
          <OrderStatusLabel
            state={
              OrderTypeMap[notification.order?.type as NotificationOrderType]
            }
            filledProgress={
              totalAmount.eq(0)
                ? 0
                : Number(
                    totalAmount
                      .minus(amount)
                      .div(totalAmount)
                      .times(100)
                      .round(0, Big.roundDown)
                      .toFixed()
                  )
            }
          />
          <BullePoint />
          <TimeSince date={notification.created} />
        </div>
      </div>
      {!notification.read && <div className="read-symbol" />}
    </div>
  );
};

export default NotificationTile;
