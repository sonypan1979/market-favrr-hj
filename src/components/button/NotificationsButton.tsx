import { useQuery } from "@apollo/client";
import React, { useMemo, useRef, useState } from "react";
import {
  GetNotificationsQuery,
  GetNotificationsQueryVariables,
} from "../../../generated/graphql";
import notificationSrc from "../../assets/images/notification.svg";
import profilePlaceholderSrc from "../../assets/images/profile-placeholder.svg";
import oceanaProfilePlaceholderSrc from "../../assets/images/oceana-placeholder.svg";
import { useWallet } from "../../context/WalletContext";
import GET_NOTIFICATIONS_QUERY from "../../graphql/query/get_notifications_query";
import MobileUserMenu from "../header/MobileUserMenu";
import PopupFullpageResponsive from "../modal/PopupFullpageResponsive";
import NotificationSubscriptionMenu from "../notification/NotificationSubscriptionMenu";
import NotificationMenu from "../notification/NotificationSubscriptionMenu";
import "./notificationsButton.scss";

interface Props {
  avatar?: string;
}

const NotificationsButton = (props: Props) => {
  const [displayNotifications, setDisplayNotifications] = useState(false);
  const userSrc =
    props.avatar ||
    (process.env.OCEANA_ENV == "true"
      ? oceanaProfilePlaceholderSrc
      : profilePlaceholderSrc);

  const { walletAddresses } = useWallet();
  const address = walletAddresses?.length ? walletAddresses[0] : null;

  const { data } = useQuery<
    GetNotificationsQuery,
    GetNotificationsQueryVariables
  >(GET_NOTIFICATIONS_QUERY, {
    skip: !address,
    variables: {
      address,
    },
  });

  const hasUnread = data?.getNotifications?.unread || false;

  const isMobileLayout =
    typeof window !== "undefined" && window.innerWidth <= 750;

  return (
    <div className="notifications-button">
      <img
        className={`notification-img ${
          isMobileLayout ? "user-img" : "notification-icon"
        }`}
        src={isMobileLayout ? userSrc : notificationSrc}
        onClick={(e) => {
          if (displayNotifications) {
            e.stopPropagation();
            e.preventDefault();
          }
          //This slight async delay allows for the click to propagante before the useClickOutside listener is added
          setTimeout(() => {
            setDisplayNotifications(!displayNotifications);
          }, 0);
        }}
      />
      {hasUnread && <div className="notification-marker" />}
      {displayNotifications &&
        (isMobileLayout ? (
          <MobileUserMenu
            onClose={() => {
              if (displayNotifications) {
                setDisplayNotifications(false);
              }
            }}
          />
        ) : (
          <PopupFullpageResponsive
            onClose={() => setDisplayNotifications(false)}
          >
            <NotificationSubscriptionMenu
              onClose={() => setDisplayNotifications(false)}
            />
          </PopupFullpageResponsive>
        ))}
    </div>
  );
};

export default NotificationsButton;
