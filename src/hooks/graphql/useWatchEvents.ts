import { useApolloClient, useSubscription } from "@apollo/client";
import {
  EventsSubscription,
  EventsSubscriptionVariables,
  GetNotificationsQuery,
  GetNotificationsQueryVariables,
  NotificationPayload,
  NotificationType,
  SubscriptionEvent,
} from "../../../generated/graphql";
import { useWallet } from "../../context/WalletContext";
import GET_NOTIFICATIONS_QUERY from "../../graphql/query/get_notifications_query";
import EVENTS_SUBSCRIPTION from "../../graphql/subscription/events_subscription";

export default () => {
  const { walletAddresses } = useWallet();
  const address = walletAddresses && walletAddresses[0];

  const apolloClient = useApolloClient();

  useSubscription<EventsSubscription, EventsSubscriptionVariables>(
    EVENTS_SUBSCRIPTION,
    {
      variables: {
        address,
      },
      skip: !address,
      onSubscriptionData: ({ client, subscriptionData: { data } }) => {
        console.log({ data });
        //avoid type error in subscription
        const dataEvents = data?.events as NotificationPayload;
        if (dataEvents.type == NotificationType.OrderUpdate) {
          const cacheData = apolloClient.readQuery<
            GetNotificationsQuery,
            GetNotificationsQueryVariables
          >({ query: GET_NOTIFICATIONS_QUERY, variables: { address } });

          console.log({
            old: cacheData,
            new: {
              query: GET_NOTIFICATIONS_QUERY,
              variables: { address },
              data: {
                getNotifications: {
                  ...cacheData?.getNotifications,
                  count: (cacheData?.getNotifications?.count || 0) + 1,
                  unread: true,
                  events: [{ ...dataEvents, IPO: null }].concat(
                    (cacheData?.getNotifications?.events as any) || []
                  ),
                },
              },
            },
          });
          apolloClient.writeQuery<
            GetNotificationsQuery,
            GetNotificationsQueryVariables
          >({
            query: GET_NOTIFICATIONS_QUERY,
            variables: { address },
            data: {
              getNotifications: {
                ...cacheData?.getNotifications,
                count: (cacheData?.getNotifications?.count || 0) + 1,
                unread: true,
                events: [{ ...dataEvents, IPO: null }].concat(
                  (cacheData?.getNotifications?.events as any) || []
                ),
              },
            },
          });
        }
      },
    }
  );
};
