import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import PopupFullpageResponsive from "../modal/PopupFullpageResponsive";
import "./notificationSubscriptionMenu.scss";
import EmptyNotificationsForm from "./EmptyNotificationsForm";
import NotificationTile from "./NotificationTile";
import { NetworkStatus, useQuery } from "@apollo/client";
import {
  GetNotificationsQuery,
  GetNotificationsQueryVariables,
  NotificationOrderTxType,
  NotificationOrderType,
  NotificationPayload,
  NotificationPayloadOrder,
  SubscriptionEvent,
} from "../../../generated/graphql";
import GET_NOTIFICATIONS_QUERY from "../../graphql/query/get_notifications_query";
import { useWallet } from "../../context/WalletContext";
import Loader from "../loader/Loader";
import dayjs, { Dayjs } from "dayjs";

const NotificationSubscriptionMenu = (props: { onClose?: () => void }) => {
  const [displaySubscription, setDisplaySubscription] = useState(false);
  const { walletAddresses } = useWallet();
  const address = walletAddresses?.length ? walletAddresses[0] : null;

  const { data, loading, fetchMore, networkStatus } = useQuery<
    GetNotificationsQuery,
    GetNotificationsQueryVariables
  >(GET_NOTIFICATIONS_QUERY, {
    skip: !address,
    notifyOnNetworkStatusChange: true,
    // fetchPolicy: "cache-and-network",
    // nextFetchPolicy: "cache-first",
    variables: {
      address,
    },
  });

  const notificationsWithoutDuplicatedAndSorted = useMemo(() => {
    const ids = new Set();
    if (!data?.getNotifications?.events?.length) {
      return undefined;
    }
    const sortedNotifications = [...data?.getNotifications?.events].sort(
      (notificationA, notificationB) => {
        return dayjs(notificationA?.created).isAfter(
          dayjs(notificationB?.created)
        )
          ? -1
          : 1;
      }
    );
    return sortedNotifications?.filter((notification) => {
      if (!ids.has(notification?.id)) {
        ids.add(notification?.id);
        return true;
      }
      return false;
    });
  }, [data?.getNotifications?.events]);

  const hasNotifications = !!notificationsWithoutDuplicatedAndSorted?.length;

  const loadingMoreRef = useRef(false);

  const loadMore = () => {
    if (loadingMoreRef.current) {
      return;
    }
    loadingMoreRef.current = true;
    fetchMore({
      variables: {
        address,
        pagination: {
          cursor: data?.getNotifications?.cursor,
        },
      },
      updateQuery: ((
        prev: GetNotificationsQuery,
        { fetchMoreResult }: { fetchMoreResult: GetNotificationsQuery }
      ) => {
        const mergedResult = {
          ...fetchMoreResult,
          getNotifications: {
            ...fetchMoreResult?.getNotifications,
            events: (prev.getNotifications?.events || []).concat(
              fetchMoreResult?.getNotifications?.events || []
            ),
          },
        };
        return mergedResult;
      }) as any,
    }).finally(() => {
      loadingMoreRef.current = false;
    });
  };

  const notificationsListRef = useRef<HTMLDivElement>(null);
  const subscribeButtonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notificationsListRef.current) {
      const clientHeight = notificationsListRef.current.clientHeight;
      const scrollHeight = notificationsListRef.current.scrollHeight;
      const displayShadow = scrollHeight > clientHeight;
      subscribeButtonContainerRef.current?.style.setProperty(
        "box-shadow",
        displayShadow ? null : "none"
      );
    }
  });

  return (
    <div
      className={`notification-subscription-menu ${
        (displaySubscription || !hasNotifications) && !loading
          ? "subscription"
          : "notifications"
      }`}
      // onClose={props.onClose}
    >
      {networkStatus == NetworkStatus.loading ? (
        <span className="initial-loader">
          <Loader />
        </span>
      ) : hasNotifications && !displaySubscription ? (
        <>
          <h2 className="notifications-title">
            <FormattedMessage defaultMessage="Notifications" />
          </h2>
          <div
            className="notifications-list"
            ref={notificationsListRef}
            onScroll={(e) => {
              const element = e.target as HTMLDivElement;
              const reachedBottom =
                element.scrollHeight -
                  element.clientHeight -
                  element.scrollTop <
                10;

              if (reachedBottom && data?.getNotifications?.cursor) {
                loadMore();
              }
            }}
          >
            {notificationsWithoutDuplicatedAndSorted?.map((notification) => (
              <NotificationTile
                key={notification?.id as string}
                notification={notification as NotificationPayload}
              />
            ))}
            {networkStatus == NetworkStatus.fetchMore && (
              <div style={{ textAlign: "center" }}>
                <Loader />
              </div>
            )}
          </div>

          <div
            className="subscription-button-container"
            ref={subscribeButtonContainerRef}
          >
            <button
              className="subscription-button"
              onClick={() => setDisplaySubscription(true)}
            >
              <FormattedMessage defaultMessage="Subscribe for Updates" />
            </button>
          </div>
        </>
      ) : (
        <EmptyNotificationsForm
          skipEmptyNotifications={hasNotifications}
          onFinish={
            hasNotifications ? () => setDisplaySubscription(false) : undefined
          }
        />
      )}
    </div>
  );
};

export default NotificationSubscriptionMenu;
