import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import NotificationSubscriptionMenu from "../components/notification/NotificationSubscriptionMenu";
import { homePath } from "../routes/pathBuilder";
import BasePage from "./BasePage";
import "./notificationsPage.scss";

const NotificationsPage = () => {
  const location = useLocation();
  const history = useHistory();
  useEffect(() => {
    if (window.innerWidth > 730) {
      if (location.key) {
        history.goBack();
      } else {
        history.replace(homePath());
      }
    }
  }, [window.innerWidth < 730]);
  return (
    <BasePage className="notifications-page" displayFooter={false}>
      <NotificationSubscriptionMenu />
    </BasePage>
  );
};

export default NotificationsPage;
